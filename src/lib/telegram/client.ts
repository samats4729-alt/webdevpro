import { Bot, Context, webhookCallback } from 'grammy';
import { createClient } from '@supabase/supabase-js';

// Flow rule interface (same as WhatsApp)
interface FlowRule {
    id: string;
    trigger: {
        type: 'keyword' | 'contains' | 'starts_with' | 'exact' | 'not_contains' | 'any';
        value: string;
        secondaryCondition?: {
            type: 'contains' | 'exact' | 'starts_with' | 'not_contains';
            value: string;
            negate?: boolean;
        };
    };
    action: {
        type: 'reply' | 'media' | 'buttons' | 'ai' | 'aiApi';
        message?: string;
        delaySeconds?: number;
        mediaType?: 'image' | 'video' | 'audio' | 'document';
        mediaUrl?: string;
        caption?: string;
        menuText?: string;
        buttons?: { text: string; triggerValue?: string }[];
        systemPrompt?: string;
        model?: string;
        temperature?: number;
        useKnowledgeBase?: boolean;
        // AI API fields (custom key)
        apiKey?: string;
        baseUrl?: string;
    };
    enabled: boolean;
    platforms?: string[]; // ['whatsapp', 'telegram']
}

// Session data for Telegram bots
interface TelegramSession {
    bot: Bot;
    botId: string;
    flowRules: FlowRule[];
    isRunning: boolean;
}

// Global singleton for Telegram sessions
const globalWithTelegram = global as typeof globalThis & {
    _telegramSessions: Map<string, TelegramSession>;
};

if (!globalWithTelegram._telegramSessions) {
    globalWithTelegram._telegramSessions = new Map<string, TelegramSession>();
}

const sessions = globalWithTelegram._telegramSessions;

// Get Supabase client with service role
function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

// Match flow rules with platform filtering
function matchFlowRule(messageText: string, rules: FlowRule[]): FlowRule[] {
    const text = messageText.toLowerCase().trim();
    const matchedRules: FlowRule[] = [];

    // Filter rules by telegram platform first
    const platformRules = rules.filter(rule =>
        !rule.platforms || rule.platforms.length === 0 || rule.platforms.includes('telegram')
    );

    for (const rule of platformRules) {
        if (!rule.enabled) continue;
        const triggerValue = rule.trigger.value.toLowerCase().trim();
        if (!triggerValue && rule.trigger.type !== 'any') continue;

        let matched = false;

        switch (rule.trigger.type) {
            case 'exact': matched = text === triggerValue; break;
            case 'contains':
            case 'keyword':
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

            matched = sec.negate ? !secMatched : secMatched;
        }

        if (matched) {
            matchedRules.push(rule);
        }
    }
    return matchedRules;
}

// Get AI response
async function getAIResponse(botId: string, userMessage: string): Promise<string | null> {
    try {
        const supabase = getSupabase();
        const { data: bot } = await supabase
            .from('bots')
            .select('ai_enabled, ai_system_prompt, ai_model, ai_temperature, name')
            .eq('id', botId)
            .single();

        if (!bot || !bot.ai_enabled) return null;

        const { data: knowledge } = await supabase
            .from('knowledge_base')
            .select('*')
            .eq('bot_id', botId);

        let knowledgeContext = '';
        if (knowledge && knowledge.length > 0) {
            knowledgeContext = '\n\n=== БАЗА ЗНАНИЙ ===\n' + knowledge.map((item: any) =>
                `[${item.category}] ${item.title}\n${item.content}`
            ).join('\n');
        }

        const systemPrompt = `${bot.ai_system_prompt || 'Ты вежливый помощник.'}\nОтвечай от имени "${bot.name}".\n${knowledgeContext}`;

        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) return null;

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: bot.ai_model || 'deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: bot.ai_temperature || 0.7
            })
        });

        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;
    } catch (e) {
        console.error('[Telegram AI] Error:', e);
        return null;
    }
}

// Save lead and message to database
async function saveLeadAndMessage(
    botId: string,
    chatId: string,
    username: string | null,
    firstName: string | null,
    content: string,
    direction: 'in' | 'out'
) {
    try {
        const supabase = getSupabase();
        const displayName = firstName || username || chatId;

        // Upsert lead
        const { data: lead, error: leadError } = await supabase
            .from('leads')
            .upsert({
                bot_id: botId,
                phone: chatId, // Using chat_id as identifier
                name: displayName,
                platform: 'telegram',
                status: 'active',
                last_message_at: new Date().toISOString()
            }, {
                onConflict: 'bot_id,phone',
                ignoreDuplicates: false
            })
            .select()
            .single();

        if (leadError) {
            console.error('[Telegram] Failed to upsert lead:', leadError);
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
            console.error('[Telegram] Failed to save message:', msgError);
        } else {
            console.log(`[Telegram] Saved ${direction} message for lead ${lead.id}`);
        }
    } catch (e) {
        console.error('[Telegram] Error saving lead/message:', e);
    }
}

// Create Telegram bot client
export async function createTelegramClient(botId: string, token: string, flowRules: FlowRule[] = []) {
    // Check if already exists
    if (sessions.has(botId)) {
        console.log(`[Telegram] Session ${botId} already exists`);
        return sessions.get(botId)!.bot;
    }

    console.log(`[Telegram] Creating bot for ${botId}`);
    const bot = new Bot(token);

    // Store session
    sessions.set(botId, {
        bot,
        botId,
        flowRules,
        isRunning: false
    });

    // Handle incoming messages
    bot.on('message:text', async (ctx) => {
        const text = ctx.message.text;
        const chatId = ctx.chat.id.toString();
        const username = ctx.from?.username || null;
        const firstName = ctx.from?.first_name || null;

        console.log(`[Telegram] Message from ${chatId}: ${text}`);

        // Save incoming message
        saveLeadAndMessage(botId, chatId, username, firstName, text, 'in');

        // Get session and rules
        const session = sessions.get(botId);
        if (!session) return;

        const matchedRules = matchFlowRule(text, session.flowRules);

        if (matchedRules.length > 0) {
            for (const rule of matchedRules) {
                // Simulate typing
                await ctx.api.sendChatAction(chatId, 'typing');

                if (rule.action.delaySeconds) {
                    await new Promise(r => setTimeout(r, rule.action.delaySeconds! * 1000));
                } else {
                    await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));
                }

                if (rule.action.type === 'reply' && rule.action.message) {
                    // Check if this is a menu (has button format in message)
                    if (rule.action.menuText || (rule.action.buttons && rule.action.buttons.length > 0)) {
                        // Send as InlineKeyboard
                        const buttons = rule.action.buttons || [];
                        const keyboard = buttons.map((btn: any, idx: number) => [{
                            text: btn.text,
                            callback_data: `btn_${idx}_${btn.text.substring(0, 30)}`
                        }]);

                        await ctx.reply(rule.action.menuText || rule.action.message, {
                            parse_mode: 'Markdown',
                            reply_markup: { inline_keyboard: keyboard }
                        });
                        saveLeadAndMessage(botId, chatId, username, firstName, rule.action.menuText || rule.action.message, 'out');
                    } else if (rule.action.mediaUrl) {
                        await ctx.replyWithPhoto(rule.action.mediaUrl, { caption: rule.action.message });
                        saveLeadAndMessage(botId, chatId, username, firstName, rule.action.message, 'out');
                    } else {
                        await ctx.reply(rule.action.message, { parse_mode: 'Markdown' });
                        saveLeadAndMessage(botId, chatId, username, firstName, rule.action.message, 'out');
                    }
                } else if (rule.action.type === 'ai') {
                    await ctx.api.sendChatAction(chatId, 'typing');
                    const aiReply = await getAIResponse(botId, text);
                    if (aiReply) {
                        await ctx.reply(aiReply, { parse_mode: 'Markdown' });
                        saveLeadAndMessage(botId, chatId, username, firstName, aiReply, 'out');
                    }
                } else if (rule.action.type === 'aiApi' && rule.action.apiKey) {
                    // Custom AI API with user's own key
                    await ctx.api.sendChatAction(chatId, 'typing');
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
                            await ctx.reply(aiReply, { parse_mode: 'Markdown' });
                            saveLeadAndMessage(botId, chatId, username, firstName, aiReply, 'out');
                        }
                    } catch (e) {
                        console.error('[Telegram] Custom AI API failed:', e);
                    }
                } else if (rule.action.type === 'media' && rule.action.mediaUrl) {
                    const { mediaType, mediaUrl, caption } = rule.action;
                    if (mediaType === 'image') {
                        await ctx.replyWithPhoto(mediaUrl, { caption });
                    } else if (mediaType === 'video') {
                        await ctx.replyWithVideo(mediaUrl, { caption });
                    } else if (mediaType === 'audio') {
                        await ctx.replyWithAudio(mediaUrl, { caption });
                    } else {
                        await ctx.replyWithDocument(mediaUrl, { caption });
                    }
                    saveLeadAndMessage(botId, chatId, username, firstName, caption || `[${mediaType}]`, 'out');
                }
            }
        } else {
            // Fallback to AI
            const aiReply = await getAIResponse(botId, text);
            if (aiReply) {
                await ctx.reply(aiReply, { parse_mode: 'Markdown' });
                saveLeadAndMessage(botId, chatId, username, firstName, aiReply, 'out');
            }
        }
    });

    // Handle inline button clicks (callback queries)
    bot.on('callback_query:data', async (ctx) => {
        const callbackData = ctx.callbackQuery.data;
        const chatId = ctx.chat?.id?.toString() || '';
        const username = ctx.from?.username || null;
        const firstName = ctx.from?.first_name || null;

        console.log(`[Telegram] Button click from ${chatId}: ${callbackData}`);

        // Parse callback data: btn_index_buttonText
        const parts = callbackData.split('_');
        const buttonText = parts.slice(2).join('_'); // Get button text after btn_index_

        // Acknowledge the callback
        await ctx.answerCallbackQuery();

        // Save the button click as incoming message
        saveLeadAndMessage(botId, chatId, username, firstName, buttonText, 'in');

        // Get session and match rules
        const session = sessions.get(botId);
        if (!session) return;

        // Also try matching by button index (1, 2, 3...)
        const buttonIndex = parseInt(parts[1]) + 1;

        // First try exact button text, then try digit
        let matchedRules = matchFlowRule(buttonText, session.flowRules);
        if (matchedRules.length === 0) {
            matchedRules = matchFlowRule(buttonIndex.toString(), session.flowRules);
        }

        if (matchedRules.length > 0) {
            for (const rule of matchedRules) {
                await ctx.api.sendChatAction(chatId, 'typing');

                if (rule.action.delaySeconds) {
                    await new Promise(r => setTimeout(r, rule.action.delaySeconds! * 1000));
                } else {
                    await new Promise(r => setTimeout(r, 300 + Math.random() * 500));
                }

                if (rule.action.type === 'reply' && rule.action.message) {
                    await ctx.reply(rule.action.message, { parse_mode: 'Markdown' });
                    saveLeadAndMessage(botId, chatId, username, firstName, rule.action.message, 'out');
                } else if (rule.action.type === 'ai') {
                    const aiReply = await getAIResponse(botId, buttonText);
                    if (aiReply) {
                        await ctx.reply(aiReply, { parse_mode: 'Markdown' });
                        saveLeadAndMessage(botId, chatId, username, firstName, aiReply, 'out');
                    }
                }
            }
        }
    });

    // Handle errors
    bot.catch((err) => {
        console.error('[Telegram] Bot error:', err);
    });

    return bot;
}

// Start bot with long polling (for development)
export async function startTelegramPolling(botId: string) {
    const session = sessions.get(botId);
    if (!session) {
        console.error(`[Telegram] Session ${botId} not found`);
        return false;
    }

    if (session.isRunning) {
        console.log(`[Telegram] Bot ${botId} already running`);
        return true;
    }

    try {
        await session.bot.start();
        session.isRunning = true;
        console.log(`[Telegram] Bot ${botId} started with polling`);

        // Update bot status in DB
        const supabase = getSupabase();
        await supabase
            .from('bots')
            .update({ status: 'online', updated_at: new Date().toISOString() })
            .eq('id', botId);

        return true;
    } catch (e: any) {
        console.error(`[Telegram] Failed to start bot ${botId}:`, e);
        return false;
    }
}

// Stop Telegram bot
export async function stopTelegramBot(botId: string) {
    const session = sessions.get(botId);
    if (!session) return false;

    try {
        await session.bot.stop();
        session.isRunning = false;
        sessions.delete(botId);

        // Update bot status in DB
        const supabase = getSupabase();
        await supabase
            .from('bots')
            .update({ status: 'offline', updated_at: new Date().toISOString() })
            .eq('id', botId);

        console.log(`[Telegram] Bot ${botId} stopped`);
        return true;
    } catch (e) {
        console.error(`[Telegram] Failed to stop bot ${botId}:`, e);
        return false;
    }
}

// Update flow rules for running bot
export function updateTelegramFlowRules(botId: string, flowRules: FlowRule[]) {
    const session = sessions.get(botId);
    if (session) {
        session.flowRules = flowRules;
        console.log(`[Telegram] Updated flow rules for bot ${botId}`);
    }
}

// Get session status
export function getTelegramSession(botId: string) {
    return sessions.get(botId);
}

// Webhook handler for production
export function getTelegramWebhookHandler(botId: string) {
    const session = sessions.get(botId);
    if (!session) return null;
    return webhookCallback(session.bot, 'std/http');
}

// Validate token by getting bot info
export async function validateTelegramToken(token: string): Promise<{ valid: boolean; botInfo?: any; error?: string }> {
    try {
        const bot = new Bot(token);
        const me = await bot.api.getMe();
        return { valid: true, botInfo: me };
    } catch (e: any) {
        return { valid: false, error: e.message };
    }
}
