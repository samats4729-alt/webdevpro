import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { matchFlowRule, getAIResponse, FlowRule } from '@/lib/whatsapp/client';

// Helper to convert DB text rules to FlowRule objects if needed
// But usually we get them from JSON in 'bots' table or 'flows' table.
// Actually client.ts expects FlowRules.
// We need to fetch the flow and convert it using convertReactFlowToRules (also exported?)
// Let's check if convertReactFlowToRules is exported. Yes it is in client.ts

import { convertReactFlowToRules } from '@/lib/whatsapp/client';

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();
        const { message, previousMessages } = await req.json();
        const botId = params.id;

        // 1. Fetch Bot Settings & Flow
        const { data: bot, error } = await supabase
            .from('bots')
            .select('*')
            .eq('id', botId)
            .single();

        if (error || !bot) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        }

        // 2. Fetch Flow
        // We need the active flow
        const { data: flows } = await supabase
            .from('flows')
            .select('*')
            .eq('bot_id', botId)
            .limit(1); // Assuming 1 active flow for now or take the first one

        let rules: FlowRule[] = [];

        if (flows && flows.length > 0) {
            const flow = flows[0];
            // Convert flow nodes to rules
            // Handle both legacy array and new object format
            let nodes = [];
            let edges = [];

            if (Array.isArray(flow.nodes)) {
                nodes = flow.nodes;
                edges = flow.edges || [];
            } else if (flow.nodes && (flow.nodes as any)._nodes) {
                nodes = (flow.nodes as any)._nodes;
                edges = (flow.nodes as any)._edges || [];
            }

            rules = convertReactFlowToRules(nodes, edges);
            console.log('[Emulator] Converted rules:', JSON.stringify(rules, null, 2));
        }

        // 3. Process Message
        const responses: any[] = [];
        const text = message.trim();
        console.log('[Emulator] Input text:', text, '| Rules count:', rules.length);

        // 3.1 Check Rules
        const matchedRules = matchFlowRule(text, rules, 'whatsapp'); // Simulate WhatsApp platform
        console.log('[Emulator] Matched rules:', matchedRules.length);

        if (matchedRules.length > 0) {
            for (const rule of matchedRules) {
                if (rule.action.type === 'reply' && rule.action.message) {
                    responses.push({
                        type: 'text',
                        content: rule.action.message,
                        buttons: rule.action.buttons // If menu
                    });
                    if (rule.action.mediaUrl) {
                        responses.push({
                            type: 'image',
                            content: rule.action.mediaUrl,
                            caption: rule.action.message
                        });
                    }
                } else if (rule.action.type === 'ai') {
                    // AI Node
                    const aiOptions = {
                        systemPrompt: rule.action.systemPrompt,
                        model: rule.action.model,
                        temperature: rule.action.temperature,
                        useKnowledgeBase: rule.action.useKnowledgeBase,
                        bypassGlobalCheck: true
                    };
                    // Pass conversation history for context
                    const aiContext = { history: previousMessages || [] };
                    const reply = await getAIResponse(botId, text, aiContext, aiOptions);
                    if (reply) responses.push({ type: 'text', content: reply, isAi: true });
                } else if (rule.action.type === 'input') {
                    // Input Node - show prompt and wait for user input
                    const promptMsg = rule.action.promptMessage || rule.action.message;
                    if (promptMsg) {
                        responses.push({ type: 'text', content: promptMsg });
                    }
                    // Note: Variable storage would be handled in real implementation
                } else if (rule.action.type === 'http') {
                    // HTTP Node - make external API call
                    try {
                        const httpResponse = await fetch(rule.action.url || '', {
                            method: rule.action.method || 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                ...(rule.action.headers || {})
                            },
                            body: rule.action.method !== 'GET' ? rule.action.body : undefined
                        });
                        const data = await httpResponse.json();
                        responses.push({
                            type: 'text',
                            content: `✅ HTTP ${rule.action.method} успешно выполнен`,
                            isAi: false
                        });
                    } catch (httpErr) {
                        responses.push({
                            type: 'text',
                            content: `❌ HTTP ошибка: ${httpErr}`,
                            isAi: false
                        });
                    }
                } else if (rule.action.type === 'showSlots') {
                    // Show available appointment slots
                    responses.push({
                        type: 'text',
                        content: `📅 Доступные слоты на ближайшие ${rule.action.daysAhead || 7} дней:\n\n• Сегодня: 10:00, 14:00, 16:00\n• Завтра: 11:00, 15:00\n• Послезавтра: 9:00, 12:00, 17:00`,
                        isAi: false
                    });
                } else if (rule.action.type === 'bookAppointment') {
                    // Book an appointment
                    const confirmation = rule.action.confirmationMessage || 'Вы успешно записаны!';
                    responses.push({
                        type: 'text',
                        content: `✅ ${confirmation}\n\n⏰ Напоминание за ${rule.action.reminderMinutes || 60} минут.`,
                        isAi: false
                    });
                }
            }
        } else {
            // 3.2 Global AI Fallback
            if (bot.ai_enabled) {
                const reply = await getAIResponse(botId, text, {});
                if (reply) responses.push({ type: 'text', content: reply, isAi: true });
            }
        }

        return NextResponse.json({ responses });

    } catch (e: any) {
        console.error('Emulation Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
