import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    WAMessage,
    jidNormalizedUser,
    proto,
    delay
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs';
import path from 'path';

// Flow rule interface
export interface FlowRule {
    id: string;
    trigger: {
        type: 'keyword' | 'contains' | 'starts_with' | 'exact' | 'not_contains' | 'any';
        value: string;
        // Optional secondary condition (AND)
        secondaryCondition?: {
            type: 'contains' | 'exact' | 'starts_with' | 'not_contains';
            value: string;
            negate?: boolean; // If true, finding the match returns false (for "No" branch)
        };
    };
    action: {
        type: 'reply' | 'media' | 'buttons' | 'ai' | 'aiApi' | 'input' | 'http' | 'showSlots' | 'bookAppointment';
        message?: string;
        delaySeconds?: number;
        // Media fields
        mediaType?: 'image' | 'video' | 'audio' | 'document';
        mediaUrl?: string;
        caption?: string;
        // Buttons fields
        menuText?: string;
        buttons?: { text: string; triggerValue?: string }[];
        // AI fields
        systemPrompt?: string;
        model?: string;
        temperature?: number;
        useKnowledgeBase?: boolean;
        // AI API fields (custom key)
        apiKey?: string;
        baseUrl?: string;
        // Input fields
        variableName?: string;
        customVariableName?: string;
        validationType?: string;
        promptMessage?: string;
        // HTTP fields
        method?: string;
        url?: string;
        headers?: Record<string, string>;
        body?: string;
        saveResponseTo?: string;
        // Appointment fields
        daysAhead?: number;
        serviceId?: string;
        reminderMinutes?: number;
        confirmationMessage?: string;
    };
    enabled: boolean;
    platforms?: string[]; // ['whatsapp', 'telegram'] - which platforms this rule applies to
}

// Store active sessions
interface SessionData {
    sock: any;
    qrCode: string | null;
    status: string;
    deviceInfo: any | null;
    autoReplyEnabled: boolean;
    autoReplyMessage: string;
    flowRules: FlowRule[];
}

// Global Singleton for Sessions
const globalWithSessions = global as typeof globalThis & {
    _whatsappSessions: Map<string, SessionData>;
};

if (!globalWithSessions._whatsappSessions) {
    globalWithSessions._whatsappSessions = new Map<string, SessionData>();
}

const sessions = globalWithSessions._whatsappSessions;

export interface WhatsAppClientOptions {
    botId: string;
    autoReplyEnabled?: boolean;
    autoReplyMessage?: string;
    flowRules?: FlowRule[];
    onMessage?: (message: any) => void;
}

// Helper to extract text from message
function getMessageText(message: WAMessage): string {
    if (!message.message) return '';

    console.log('[Baileys] Raw Message:', JSON.stringify(message.message, null, 2));

    return message.message.conversation ||
        message.message.extendedTextMessage?.text ||
        message.message.imageMessage?.caption ||
        message.message.videoMessage?.caption ||
        message.message.documentMessage?.caption ||
        // Check for ephemeral message (common in new chats)
        message.message.ephemeralMessage?.message?.extendedTextMessage?.text ||
        message.message.ephemeralMessage?.message?.conversation ||
        // Check for viewOnce message
        message.message.viewOnceMessage?.message?.imageMessage?.caption ||
        message.message.viewOnceMessage?.message?.videoMessage?.caption ||
        '';
}

// Helper to convert React Flow format to Rules
export function convertReactFlowToRules(nodes: any[], edges: any[] = []): FlowRule[] {
    if (!nodes || !Array.isArray(nodes)) return [];

    const rules: FlowRule[] = [];
    const triggerNodes = nodes.filter(n => n.type === 'trigger');
    const whatsappSources = nodes.filter(n => n.type === 'whatsappSource');
    const telegramSources = nodes.filter(n => n.type === 'telegramSource');

    // Build a map of trigger -> platforms based on source connections
    const triggerPlatforms: Map<string, Set<string>> = new Map();

    for (const source of whatsappSources) {
        const connectedEdges = edges.filter(e => e.source === source.id);
        for (const edge of connectedEdges) {
            const targetNode = nodes.find(n => n.id === edge.target);
            if (targetNode?.type === 'trigger') {
                if (!triggerPlatforms.has(targetNode.id)) {
                    triggerPlatforms.set(targetNode.id, new Set());
                }
                triggerPlatforms.get(targetNode.id)!.add('whatsapp');
            }
        }
    }

    for (const source of telegramSources) {
        const connectedEdges = edges.filter(e => e.source === source.id);
        for (const edge of connectedEdges) {
            const targetNode = nodes.find(n => n.id === edge.target);
            if (targetNode?.type === 'trigger') {
                if (!triggerPlatforms.has(targetNode.id)) {
                    triggerPlatforms.set(targetNode.id, new Set());
                }
                triggerPlatforms.get(targetNode.id)!.add('telegram');
            }
        }
    }

    // Recursive function to traverse the flow
    const traverse = (startNodeId: string, currentTrigger: any, secondaryCondition: any = null, handleId: string | null = null, currentDelay: number = 0, platforms: string[] = ['whatsapp', 'telegram']) => {
        // Find edges from current node
        const connectedEdges = edges.filter(e => e.source === startNodeId && (!handleId || e.sourceHandle === handleId));

        for (const edge of connectedEdges) {
            let nextNode = nodes.find(n => n.id === edge.target);
            if (!nextNode) continue;

            // 1. Handle Delay
            if (nextNode.type === 'delay') {
                const addedDelay = (nextNode.data.delaySeconds || 0);
                traverse(nextNode.id, currentTrigger, secondaryCondition, null, currentDelay + addedDelay, platforms);
                continue;
            }

            // 2. Handle Condition (Branching)
            if (nextNode.type === 'condition' && !secondaryCondition) {
                // YES Branch
                traverse(nextNode.id, currentTrigger, {
                    type: nextNode.data.conditionType || 'contains',
                    value: nextNode.data.conditionValue || '',
                    negate: false
                }, 'yes', currentDelay, platforms);

                // NO Branch
                traverse(nextNode.id, currentTrigger, {
                    type: nextNode.data.conditionType || 'contains',
                    value: nextNode.data.conditionValue || '',
                    negate: true
                }, 'no', currentDelay, platforms);
                continue;
            }

            // 3. Handle Actions
            const ruleId = `${currentTrigger.value}_${nextNode.id}${secondaryCondition ? `_${secondaryCondition.negate ? 'no' : 'yes'}` : ''}`;
            const rule: FlowRule = {
                id: ruleId,
                trigger: {
                    type: currentTrigger.type,
                    value: currentTrigger.value,
                    secondaryCondition
                },
                action: { type: 'reply' },
                enabled: true,
                platforms: platforms
            };

            if (currentDelay > 0) rule.action.delaySeconds = currentDelay;

            let isMenu = false;

            if (nextNode.type === 'message') {
                rule.action.type = 'reply';
                rule.action.message = nextNode.data.message;
                if (nextNode.data.mediaUrl) {
                    rule.action.mediaUrl = nextNode.data.mediaUrl;
                    rule.action.mediaType = 'image';
                }
            } else if (nextNode.type === 'ai') {
                rule.action.type = 'ai';
                rule.action.systemPrompt = nextNode.data.systemPrompt;
                rule.action.model = nextNode.data.model;
                rule.action.temperature = nextNode.data.temperature;
                rule.action.useKnowledgeBase = nextNode.data.useKnowledgeBase;
            } else if (nextNode.type === 'aiApi') {
                rule.action.type = 'aiApi';
                rule.action.apiKey = nextNode.data.apiKey;
                rule.action.baseUrl = nextNode.data.baseUrl;
                rule.action.model = nextNode.data.model;
                rule.action.systemPrompt = nextNode.data.systemPrompt;
                rule.action.temperature = nextNode.data.temperature;
            } else if (nextNode.type === 'media') {
                rule.action.type = 'media';
                rule.action.mediaUrl = nextNode.data.mediaUrl;
                rule.action.mediaType = nextNode.data.mediaType;
                rule.action.caption = nextNode.data.caption;
            } else if (nextNode.type === 'buttons') {
                isMenu = true;
                rule.action.type = 'reply';

                // Store buttons for Telegram InlineKeyboard
                const buttons = nextNode.data.buttons || [];
                rule.action.buttons = buttons;
                rule.action.menuText = nextNode.data.menuText || '';

                // Format Menu Text with Emojis for WhatsApp (text-based)
                // 1️⃣ Option A
                // 2️⃣ Option B
                const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

                const btnText = buttons.map((b: any, index: number) => {
                    const icon = emojis[index] || `${index + 1}.`;
                    return `${icon} ${b.text}`;
                }).join('\n');

                rule.action.message = `${nextNode.data.menuText || ''}\n\n${btnText}`;
            } else if (nextNode.type === 'input') {
                // Input Node - waits for user input and stores in variable
                rule.action.type = 'input';
                rule.action.variableName = nextNode.data.variableName || 'custom';
                rule.action.customVariableName = nextNode.data.customVariableName || 'data';
                rule.action.validationType = nextNode.data.validationType || 'none';
                rule.action.promptMessage = nextNode.data.promptMessage || '';
                if (nextNode.data.promptMessage) {
                    rule.action.message = nextNode.data.promptMessage;
                }
            } else if (nextNode.type === 'http') {
                // HTTP Node - makes external API calls
                rule.action.type = 'http';
                rule.action.method = nextNode.data.method || 'POST';
                rule.action.url = nextNode.data.url || '';
                rule.action.headers = nextNode.data.headers || {};
                rule.action.body = nextNode.data.body || '';
                rule.action.saveResponseTo = nextNode.data.saveResponseTo || '';
            } else if (nextNode.type === 'showSlots') {
                // Show available appointment slots
                rule.action.type = 'showSlots';
                rule.action.daysAhead = nextNode.data.daysAhead || 7;
                rule.action.serviceId = nextNode.data.serviceId || '';
            } else if (nextNode.type === 'bookAppointment') {
                // Book an appointment
                rule.action.type = 'bookAppointment';
                rule.action.reminderMinutes = nextNode.data.reminderMinutes || 60;
                rule.action.confirmationMessage = nextNode.data.confirmationMessage || '';
            }

            // check if rule is valid before pushing
            const validTypes = ['ai', 'aiApi', 'media', 'input', 'http', 'showSlots', 'bookAppointment'];
            if (rule.action.message || validTypes.includes(rule.action.type) || (rule.action.type === 'media' && rule.action.mediaUrl)) {
                rules.push(rule);
            }

            // 4. Continue Traversal
            if (isMenu) {
                // For Menus, we DON'T continue linear path. We branch based on user input.
                const buttons = nextNode.data.buttons || [];
                buttons.forEach((btn: any, index: number) => {
                    // Rule for Text Match
                    const newTriggerText = { type: 'exact', value: btn.text };
                    traverse(nextNode.id, newTriggerText, null, `btn-${index}`, 0, platforms);

                    // Rule for Digit Match (1, 2, 3...)
                    const digit = (index + 1).toString();
                    const newTriggerDigit = { type: 'exact', value: digit };
                    traverse(nextNode.id, newTriggerDigit, null, `btn-${index}`, 0, platforms);
                });

            } else {
                // Linear continuation
                traverse(nextNode.id, currentTrigger, secondaryCondition, null, currentDelay, platforms);
            }
        }
    };

    for (const trigger of triggerNodes) {
        // Allow 'any' type without triggerValue, or require triggerValue for other types
        const hasValidTrigger = trigger.data && trigger.data.triggerType &&
            (trigger.data.triggerType === 'any' || trigger.data.triggerValue);

        if (hasValidTrigger) {
            // Get platforms for this trigger from source connections
            const platforms = triggerPlatforms.has(trigger.id)
                ? Array.from(triggerPlatforms.get(trigger.id)!)
                : ['whatsapp', 'telegram']; // Default to all if no source connected

            traverse(trigger.id, {
                type: trigger.data.triggerType,
                value: trigger.data.triggerValue || '' // Empty string for 'any' type
            }, null, null, 0, platforms);
        }
    }

    return rules;
}

// Match Flow Rule - now with platform filtering
export function matchFlowRule(messageText: string, rules: FlowRule[], platform: 'whatsapp' | 'telegram' = 'whatsapp'): FlowRule[] {
    const text = messageText.toLowerCase().trim();
    const specificRules: FlowRule[] = []; // exact, contains, starts_with, keyword
    const anyRules: FlowRule[] = []; // 'any' type (catch-all)

    // Filter rules by platform first
    const platformRules = rules.filter(rule =>
        !rule.platforms || rule.platforms.length === 0 || rule.platforms.includes(platform)
    );

    for (const rule of platformRules) {
        if (!rule.enabled) continue;
        const triggerValue = rule.trigger.value.toLowerCase().trim();
        // Allow empty triggerValue for 'any' type
        if (!triggerValue && rule.trigger.type !== 'any') continue;

        let matched = false;

        switch (rule.trigger.type) {
            case 'exact': matched = text === triggerValue; break;
            case 'contains':
            case 'keyword': // Treat keyword as contains for now
                matched = text.includes(triggerValue);
                break;
            case 'not_contains': matched = !text.includes(triggerValue); break;
            case 'starts_with': matched = text.startsWith(triggerValue); break;
            case 'any': matched = true; break;
        }

        if (matched && rule.trigger.secondaryCondition) {
            const sec = rule.trigger.secondaryCondition;
            const secValue = sec.value.toLowerCase().trim();
            let secMatched = false;

            switch (sec.type) {
                case 'exact': secMatched = text === secValue; break;
                case 'contains': secMatched = text.includes(secValue); break;
                case 'not_contains': secMatched = !text.includes(secValue); break;
                case 'starts_with': secMatched = text.startsWith(secValue); break;
            }

            if (sec.negate) {
                matched = !secMatched;
            } else {
                matched = secMatched;
            }
        }

        if (matched) {
            // Separate 'any' rules from specific rules for priority
            if (rule.trigger.type === 'any') {
                anyRules.push(rule);
            } else {
                specificRules.push(rule);
            }
        }
    }

    // PRIORITY: If there are SPECIFIC matches, use them. Otherwise, use 'any' rules.
    // This prevents 'any' from triggering when user responds to a button (which has an 'exact' match)
    return specificRules.length > 0 ? specificRules : anyRules;
}

// AI Response function
interface AIOptions {
    systemPrompt?: string;
    model?: string;
    temperature?: number;
    useKnowledgeBase?: boolean;
    bypassGlobalCheck?: boolean;
}

export async function getAIResponse(botId: string, userMessage: string, context: any, options?: AIOptions): Promise<string | null> {

    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: bot } = await supabase.from('bots').select('ai_enabled, ai_system_prompt, ai_model, ai_temperature, name').eq('id', botId).single();

        if (!bot) return null;

        // Check ai_enabled unless bypassed
        if (!options?.bypassGlobalCheck && !bot.ai_enabled) return null;

        const useKB = options?.useKnowledgeBase !== undefined ? options.useKnowledgeBase : true;

        let knowledgeContext = '';
        if (useKB) {
            const { data: knowledge } = await supabase.from('knowledge_base').select('*').eq('bot_id', botId);
            if (knowledge && knowledge.length > 0) {
                knowledgeContext = '\n\n=== БАЗА ЗНАНИЙ ===\n' + knowledge.map((item: any) => `[${item.category}] ${item.title}\n${item.content}`).join('\n');
            }
        }

        const systemPromptBase = options?.systemPrompt || bot.ai_system_prompt || 'Ты вежливый помощник.';

        // Get bot's timezone from schedule settings (default to Asia/Almaty for Kazakhstan)
        let timezone = 'Asia/Almaty';
        const { data: scheduleData } = await supabase
            .from('working_schedule')
            .select('timezone')
            .eq('bot_id', botId)
            .single();
        if (scheduleData?.timezone) {
            timezone = scheduleData.timezone;
        }

        // Current date/time in bot's timezone
        const now = new Date();
        const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
            timeZone: timezone,
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit'
        });
        const isoFormatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        const todayISO = isoFormatter.format(now);
        const tomorrowDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const tomorrowISO = isoFormatter.format(tomorrowDate);

        const currentHour = parseInt(timeFormatter.format(now).split(':')[0]);

        const dateInfo = `
ТЕКУЩЕЕ ВРЕМЯ (${timezone}): ${dateFormatter.format(now)} ${timeFormatter.format(now)}
Сейчас ${currentHour} часов. Если клиент хочет записаться на сегодня после ${currentHour}:00 — это ВОЗМОЖНО, время ещё не прошло!
Сегодня: ${todayISO}
Завтра: ${tomorrowISO}
`;

        // Add tools capability instruction
        const toolsInstruction = `
КРИТИЧЕСКИ ВАЖНО - ОБЯЗАТЕЛЬНЫЕ ДЕЙСТВИЯ:
Когда клиент спрашивает о ценах, услугах, прайсе, стоимости — ТЫ ОБЯЗАН вызвать функцию getServices!
НИКОГДА не говори что "прайс недоступен" или "система недоступна" — СНАЧАЛА ВЫЗОВИ getServices!
Это ЖЕЛЕЗНОЕ правило без исключений.

ДОСТУПНЫЕ ФУНКЦИИ:
- getServices: Получить список услуг и цен (ВЫЗЫВАЙ при любом вопросе о ценах!)
- getAvailableSlots: Показать свободные окошки для записи  
- bookAppointment: Записать клиента (нужны имя, телефон, время)
- saveLead: Сохранить контакт клиента
- getSchedule: Показать график работы

${dateInfo}

ПРАВИЛА ОТВЕТОВ:
- Цены/услуги → ОБЯЗАТЕЛЬНО вызови getServices, потом отвечай на основе результата
- Запись → узнай имя и телефон, потом getAvailableSlots, затем bookAppointment
- Используй даты в формате YYYY-MM-DD

ОСОБЕННОСТИ WhatsApp:
- Форматирование: *жирный*, _курсив_, ~зачёркнутый~
- Информация о клиенте (имя, телефон) будет указана ниже в контексте, если доступна

ВАЖНО: Не говори что время прошло если оно больше текущего часа (${currentHour}).
`;

        const systemPrompt = `${systemPromptBase}\nОтвечай от имени "${bot.name}".\n${toolsInstruction}\n${knowledgeContext}`;

        // --- CONTEXT / MEMORY IMPLEMENTATION ---
        const apiMessages: any[] = [{ role: 'system', content: systemPrompt }];

        // Track current lead ID for tool calls
        let currentLeadId: string | null = null;

        // Option 1: History passed directly (e.g., from Emulator)
        if (context?.history && Array.isArray(context.history)) {
            // Format: [{ type: 'user'|'bot', content: '...' }, ...]
            const formattedHistory = context.history.map((msg: any) => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.content
            }));
            apiMessages.push(...formattedHistory);
            // Add current message (if not already in history)
            const lastHist = formattedHistory[formattedHistory.length - 1];
            if (!(lastHist?.role === 'user' && lastHist?.content === userMessage)) {
                apiMessages.push({ role: 'user', content: userMessage });
            }
        }
        // Option 2: Try to fetch history from DB if we have context (Baileys message object)
        else {
            const remoteJid = context?.key?.remoteJid || context?.from;

            if (remoteJid) {
                // Handle both @s.whatsapp.net and @lid formats
                let phone = remoteJid;
                if (remoteJid.includes('@s.whatsapp.net')) {
                    phone = remoteJid.replace('@s.whatsapp.net', '');
                } else if (remoteJid.includes('@lid')) {
                    phone = remoteJid.replace('@lid', '');
                }

                // 1. Find Lead with full info
                const { data: lead } = await supabase
                    .from('leads')
                    .select('id, name, phone')
                    .eq('bot_id', botId)
                    .eq('phone', phone)
                    .single();

                // Store lead ID for use in tool calls
                currentLeadId = lead?.id || null;

                // Add lead context to system prompt if we have info
                if (lead) {
                    const isRealPhone = !phone.match(/^\d{15,}$/); // LIDs are usually 15+ digits
                    const leadContext = `
ИНФОРМАЦИЯ О КЛИЕНТЕ:
- Имя: ${lead.name || 'Не указано'}
- Телефон: ${isRealPhone ? lead.phone : 'Скрыт (LID)'}

${isRealPhone ? 'Номер телефона клиента ИЗВЕСТЕН, НЕ нужно его спрашивать!' : 'Номер телефона клиента скрыт, спроси его ТОЛЬКО если нужно для записи.'}
`;
                    // Insert lead context after system prompt
                    apiMessages[0].content += '\n' + leadContext;
                }

                if (lead) {
                    // 2. Fetch messages from the last 24 hours
                    const oneDayAgo = new Date();
                    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

                    const { data: history } = await supabase
                        .from('messages')
                        .select('content, direction, created_at')
                        .eq('lead_id', lead.id)
                        .gte('created_at', oneDayAgo.toISOString())
                        .order('created_at', { ascending: false })
                        .limit(50);

                    if (history && history.length > 0) {
                        const historyMessages = history.reverse().map((msg: any) => ({
                            role: msg.direction === 'in' ? 'user' : 'assistant',
                            content: msg.content
                        }));

                        const lastHist = historyMessages[historyMessages.length - 1];
                        if (lastHist.role === 'user' && lastHist.content === userMessage) {
                            apiMessages.push(...historyMessages);
                        } else {
                            apiMessages.push(...historyMessages);
                            apiMessages.push({ role: 'user', content: userMessage });
                        }
                    } else {
                        apiMessages.push({ role: 'user', content: userMessage });
                    }
                } else {
                    apiMessages.push({ role: 'user', content: userMessage });
                }
            } else {
                // Fallback: No context, just current message
                apiMessages.push({ role: 'user', content: userMessage });
            }
        }

        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) return null;

        const model = options?.model || bot.ai_model || 'deepseek-chat';
        const temperature = options?.temperature !== undefined ? options.temperature : (bot.ai_temperature || 0.7);

        // Import tools dynamically to avoid circular dependencies
        const { AI_TOOLS, executeToolCall } = await import('@/lib/ai/ai-tools');

        // Detect if user is asking about prices/services - force getServices call
        const priceKeywords = ['цен', 'прайс', 'стоим', 'сколько стоит', 'услуг', 'цена', 'почем', 'расценк'];
        const isPriceQuery = priceKeywords.some(kw => userMessage.toLowerCase().includes(kw));

        // Use 'required' to force tool call for price queries, 'auto' otherwise
        const toolChoice = isPriceQuery ? { type: 'function', function: { name: 'getServices' } } : 'auto';

        console.log('[AI] Calling DeepSeek with tools:', AI_TOOLS.map(t => t.function.name));
        console.log('[AI] Messages count:', apiMessages.length, 'isPriceQuery:', isPriceQuery, 'toolChoice:', typeof toolChoice === 'string' ? toolChoice : 'forced:getServices');

        // First API call with tools
        let response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: model,
                messages: apiMessages,
                temperature: temperature,
                tools: AI_TOOLS,
                tool_choice: toolChoice
            })
        });

        let data = await response.json();
        let assistantMessage = data.choices?.[0]?.message;

        console.log('[AI] Response received:', {
            hasToolCalls: !!assistantMessage?.tool_calls,
            toolCallsCount: assistantMessage?.tool_calls?.length || 0,
            contentPreview: assistantMessage?.content?.substring(0, 100),
            finishReason: data.choices?.[0]?.finish_reason
        });

        // Handle tool calls loop (max 5 iterations to prevent infinite loops)
        let iterations = 0;
        while (assistantMessage?.tool_calls && iterations < 5) {
            iterations++;
            console.log(`[AI] Tool calls detected (iteration ${iterations}):`, assistantMessage.tool_calls.map((t: any) => t.function.name));

            // Add assistant message with tool_calls to messages
            apiMessages.push(assistantMessage);

            // Execute each tool call and add results
            for (const toolCall of assistantMessage.tool_calls) {
                const functionName = toolCall.function.name;
                const functionArgs = JSON.parse(toolCall.function.arguments || '{}');

                console.log(`[AI] Executing tool: ${functionName}`, functionArgs);
                const result = await executeToolCall(functionName, functionArgs, botId, currentLeadId);
                console.log(`[AI] Tool result:`, result.substring(0, 200));

                apiMessages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: result
                });
            }

            // Call API again with tool results
            response = await fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: model,
                    messages: apiMessages,
                    temperature: temperature,
                    tools: AI_TOOLS,
                    tool_choice: 'auto'
                })
            });

            data = await response.json();
            assistantMessage = data.choices?.[0]?.message;
        }

        return assistantMessage?.content || null;
    } catch (e) {
        console.error('[AI] Error:', e);
        return null;
    }
}

// --- CORE FUNCTION ---
export async function createWhatsAppClient(options: WhatsAppClientOptions) {
    // Ensure PINO log level is set
    const logger = pino({ level: 'silent' });

    const { botId, autoReplyEnabled = false, autoReplyMessage = '', flowRules = [] } = options;

    if (sessions.has(botId)) {
        const session = sessions.get(botId)!;
        // Only return if connection is NOT closed/closing, otherwise we might return a dead socket
        // Check if the socket is not closed (rudimentary check, or rely on caller to clear)
        // Better: The caller (reconnect logic) should clear the session.
        // For now, standard behavior:
        return session.sock;
    }

    const authPath = path.join(process.cwd(), 'baileys_auth_info', `session-${botId}`);
    console.log(`[Baileys] Session path for ${botId}: ${authPath}`);
    if (!fs.existsSync(authPath)) {
        console.log(`[Baileys] Creating session directory: ${authPath}`);
        fs.mkdirSync(authPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    // Fetch latest version
    const { version } = await fetchLatestBaileysVersion();

    // Generate unique browser fingerprint per bot to avoid detection
    const OS_OPTIONS = ['Windows', 'Mac OS', 'Linux', 'Ubuntu'];
    const BROWSER_OPTIONS = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
    const VERSION_OPTIONS = ['10.0', '11.0', '12.0', '10.15', '22.04', '21.10'];

    // Use botId hash to get consistent but unique fingerprint per bot
    const hash = botId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const osIndex = hash % OS_OPTIONS.length;
    const browserIndex = (hash * 7) % BROWSER_OPTIONS.length;
    const versionIndex = (hash * 13) % VERSION_OPTIONS.length;

    const browserFingerprint: [string, string, string] = [
        OS_OPTIONS[osIndex],
        BROWSER_OPTIONS[browserIndex],
        VERSION_OPTIONS[versionIndex]
    ];

    console.log(`[Baileys] Bot ${botId.substring(0, 8)} using browser: ${browserFingerprint.join('/')}`);

    const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        // Unique browser signature per bot to avoid farm detection
        browser: browserFingerprint,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false, // Don't sync old messages to prevent timeouts/bans

    });

    sessions.set(botId, {
        sock,
        qrCode: null,
        status: 'initializing',
        deviceInfo: null,
        autoReplyEnabled,
        autoReplyMessage,
        flowRules
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        const session = sessions.get(botId);
        if (!session) return;

        if (qr) {
            console.log(`[Baileys] [${new Date().toISOString()}] New QR for ${botId}: ${qr.substring(0, 10)}...`);
            session.qrCode = qr;
            session.status = 'qr_ready';
        }

        if (connection === 'close') {
            const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            console.error(`[Baileys] Connection closed for ${botId}. Reason:`, lastDisconnect?.error);
            console.log(`[Baileys] StatusCode: ${statusCode}, Reconnecting: ${shouldReconnect}`);

            if (statusCode === DisconnectReason.loggedOut || statusCode === 440 || statusCode === 401) {
                console.log(`[Baileys] Session ${botId} invalid (Conflict/Logged Out/440). Deleting...`);
                // Delete auth files
                if (fs.existsSync(authPath)) {
                    try {
                        fs.rmSync(authPath, { recursive: true, force: true });
                    } catch (e) { console.error('Error deleting auth', e); }
                }

                // Update DB to disconnected
                try {
                    const { createClient } = await import('@supabase/supabase-js');
                    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
                    await supabase.from('bots').update({ status: 'disconnected', updated_at: new Date().toISOString() }).eq('id', botId);
                } catch (e) { console.error('DB update error', e); }

                sessions.delete(botId);
            } else if (shouldReconnect) {
                // IMPROVEMENT: Delete the old session from map so createWhatsAppClient creates a NEW one
                sessions.delete(botId);
                // Optional small delay to prevent rapid loops
                setTimeout(() => createWhatsAppClient(options), 3000); // Increased delay
            }
        } else if (connection === 'open') {
            console.log(`[Baileys] Connected ${botId}`);
            session.status = 'connected';
            session.qrCode = null;
            session.deviceInfo = sock.user;
            try {
                const { createClient } = await import('@supabase/supabase-js');
                const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
                await supabase.from('bots').update({ status: 'online', updated_at: new Date().toISOString() }).eq('id', botId);
            } catch (e) { }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Function to save lead and message to database
    async function saveLeadAndMessage(
        phone: string,
        name: string | null,
        content: string,
        direction: 'in' | 'out'
    ) {
        try {
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            // Upsert lead
            const { data: lead, error: leadError } = await supabase
                .from('leads')
                .upsert({
                    bot_id: botId,
                    phone: phone,
                    name: name || phone,
                    platform: 'whatsapp',
                    status: 'active',
                    last_message_at: new Date().toISOString()
                }, {
                    onConflict: 'bot_id,phone',
                    ignoreDuplicates: false
                })
                .select()
                .single();

            if (leadError) {
                console.error('[Baileys] Failed to upsert lead:', leadError);
                return;
            }

            // Save message
            const { error: msgError } = await supabase
                .from('messages')
                .insert({
                    lead_id: lead.id,
                    content: content,
                    direction: direction,
                    message_type: 'text'
                });

            if (msgError) {
                console.error('[Baileys] Failed to save message:', msgError);
            } else {
                console.log(`[Baileys] Saved ${direction} message for lead ${lead.id}`);
            }
        } catch (e) {
            console.error('[Baileys] Error saving lead/message:', e);
        }
    }

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        for (const msg of messages) {
            if (!msg.message || msg.key.fromMe) continue;
            if (msg.key.remoteJid === 'status@broadcast') continue;

            const text = getMessageText(msg);
            const sender = msg.key.remoteJid!;
            console.log(`[Baileys] Msg from ${sender}: ${text}`);

            // Skip groups
            if (sender.includes('@g.us')) continue;

            // Extract phone number (handle both @s.whatsapp.net and @lid)
            let phone = sender;
            if (sender.includes('@s.whatsapp.net')) {
                phone = sender.replace('@s.whatsapp.net', '');
            } else if (sender.includes('@lid')) {
                // @lid is WhatsApp Business internal ID - keep as identifier
                phone = sender.replace('@lid', '');
            }
            const contactName = msg.pushName || null;

            // Save incoming message to database (await to ensure history is up to date for AI)
            await saveLeadAndMessage(phone, contactName, text, 'in');

            // Check Flow Rules
            const session = sessions.get(botId);
            if (!session) continue;

            let currentRules = session.flowRules;

            const matchedRules = matchFlowRule(text, currentRules, 'whatsapp');

            if (matchedRules.length > 0) {
                // Execute all matched rules
                for (const rule of matchedRules) {
                    // Natural typing delay (if no specific delay set)
                    if (rule.action.delaySeconds) {
                        await delay(rule.action.delaySeconds * 1000);
                    } else {
                        // Random delay between 1s and 2s to simulate human typing
                        const naturalDelay = Math.floor(Math.random() * 1000) + 1000;
                        await sock.sendPresenceUpdate('composing', sender);
                        await delay(naturalDelay);
                        await sock.sendPresenceUpdate('paused', sender);
                    }

                    if (rule.action.type === 'reply' && rule.action.message) {
                        try {
                            if (rule.action.mediaUrl) {
                                // Send as Image + Caption
                                await sock.sendMessage(sender, {
                                    image: { url: rule.action.mediaUrl },
                                    caption: rule.action.message
                                });
                                // Save outgoing message
                                saveLeadAndMessage(phone, contactName, rule.action.message, 'out');
                            } else {
                                // Send as Text only
                                console.log(`[Baileys] Sending text to ${sender}: ${rule.action.message.substring(0, 50)}...`);
                                await sock.sendMessage(sender, { text: rule.action.message });
                                // Save outgoing message
                                saveLeadAndMessage(phone, contactName, rule.action.message, 'out');
                            }
                        } catch (e) {
                            console.error(`[Baileys] Failed to send reply to ${sender}:`, e);
                        }
                    } else if (rule.action.type === 'ai') {
                        await sock.sendPresenceUpdate('composing', sender);

                        const aiOptions: AIOptions = {
                            systemPrompt: rule.action.systemPrompt,
                            model: rule.action.model,
                            temperature: rule.action.temperature,
                            useKnowledgeBase: rule.action.useKnowledgeBase,
                            bypassGlobalCheck: true
                        };

                        const aiReply = await getAIResponse(botId, text, msg, aiOptions);

                        if (aiReply) {
                            await sock.sendMessage(sender, { text: aiReply });
                            // Save AI response
                            saveLeadAndMessage(phone, contactName, aiReply, 'out');
                        }
                        await sock.sendPresenceUpdate('available', sender);
                    } else if (rule.action.type === 'aiApi' && rule.action.apiKey) {
                        // Custom AI API with user's own key
                        await sock.sendPresenceUpdate('composing', sender);
                        try {
                            const baseUrl = rule.action.baseUrl || 'https://api.openai.com/v1';
                            const response = await fetch(`${baseUrl}/chat/completions`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${rule.action.apiKey}`
                                },
                                body: JSON.stringify({
                                    model: rule.action.model || 'gpt-4',
                                    messages: [
                                        { role: 'system', content: rule.action.systemPrompt || 'Ты вежливый помощник.' },
                                        { role: 'user', content: text }
                                    ],
                                    temperature: rule.action.temperature || 0.7
                                })
                            });
                            const data = await response.json();
                            const aiReply = data.choices?.[0]?.message?.content;
                            if (aiReply) {
                                await sock.sendMessage(sender, { text: aiReply });
                                saveLeadAndMessage(phone, contactName, aiReply, 'out');
                            }
                        } catch (e) {
                            console.error('[Baileys] Custom AI API failed:', e);
                        }
                        await sock.sendPresenceUpdate('available', sender);
                    } else if (rule.action.type === 'media' && rule.action.mediaUrl) {
                        const { mediaType, mediaUrl, caption } = rule.action;
                        try {
                            if (mediaType === 'image') {
                                await sock.sendMessage(sender, { image: { url: mediaUrl }, caption: caption || '' });
                            } else if (mediaType === 'video') {
                                await sock.sendMessage(sender, { video: { url: mediaUrl }, caption: caption || '' });
                            } else if (mediaType === 'audio') {
                                await sock.sendMessage(sender, { audio: { url: mediaUrl }, mimetype: 'audio/mp4', ptt: true });
                            } else {
                                await sock.sendMessage(sender, { document: { url: mediaUrl }, mimetype: 'application/octet-stream', caption: caption || '', fileName: caption || 'file' });
                            }
                            // Save media message
                            saveLeadAndMessage(phone, contactName, caption || `[${mediaType}]`, 'out');
                        } catch (e) {
                            console.error('[Baileys] Media failed:', e);
                        }
                    }
                }
            } else {
                // Fallback AI only if NO rules matched
                const aiReply = await getAIResponse(botId, text, msg);
                if (aiReply) {
                    await sock.sendMessage(sender, { text: aiReply });
                    // Save AI fallback response
                    saveLeadAndMessage(phone, contactName, aiReply, 'out');
                }
            }
        }
    });

    return { initialize: async () => { } };
}

export function getWhatsAppSession(botId: string) {
    return sessions.get(botId);
}


export function updateBotSettings(botId: string, settings: any) {
    const session = sessions.get(botId);
    if (session) {
        if (settings.flowRules) {
            // Check if we need to convert
            if (settings.flowRules.length > 0 && !settings.flowRules[0].trigger) {
                // Looks like raw nodes, convert them
                session.flowRules = convertReactFlowToRules(settings.flowRules, settings.flowEdges);
                console.log(`[Baileys] Converted ${settings.flowRules.length} nodes to ${session.flowRules.length} rules.`);
            } else {
                session.flowRules = settings.flowRules;
            }
        }
        if (settings.autoReplyEnabled !== undefined) session.autoReplyEnabled = settings.autoReplyEnabled;
        if (settings.autoReplyMessage) session.autoReplyMessage = settings.autoReplyMessage;
    }
}

export function deleteWhatsAppSession(botId: string) {
    const session = sessions.get(botId);
    if (session && session.sock) {
        try {
            session.sock.end(undefined);
        } catch (e) {
            console.error(`[Baileys] Error ending socket for ${botId}:`, e);
        }
    }

    // Auth path
    const authPath = path.join(process.cwd(), 'baileys_auth_info', `session-${botId}`);
    if (fs.existsSync(authPath)) {
        try {
            fs.rmSync(authPath, { recursive: true, force: true });
            console.log(`[Baileys] Deleted auth session directory for ${botId}`);
        } catch (e) {
            console.error(`[Baileys] Error deleting auth dir for ${botId}:`, e);
        }
    }

    sessions.delete(botId);
    console.log(`[Baileys] Session ${botId} deleted from memory.`);
}
