import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - Get bot sections
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('bot_sections')
        .select('*')
        .eq('bot_id', params.id)
        .single();

    if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json(null);
    }

    // Transform to wizard format
    return NextResponse.json({
        greeting: {
            mode: data.greeting_mode,
            text: data.greeting_text || '',
            trigger: data.greeting_trigger || 'all',
            keywords: data.greeting_keywords || [],
            media: data.greeting_media || null,
            ai_style: data.greeting_ai_style || null,
            ai_prompt: data.greeting_ai_prompt || null,
        },
        services: {
            mode: data.services_mode,
            items: data.services_items || [],
            ai_prompt: data.services_ai_prompt || null,
        },
        schedule: {
            mode: data.schedule_mode,
            days: data.schedule_days || [],
        },
        faq: {
            mode: data.faq_mode,
            items: data.faq_items || [],
        },
    });
}

// POST - Save bot sections
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { greeting, services, schedule, faq } = body;

    // Upsert sections
    const { error } = await supabase
        .from('bot_sections')
        .upsert({
            bot_id: params.id,
            // Greeting
            greeting_mode: greeting?.mode || 'ai',
            greeting_text: greeting?.text || '',
            greeting_trigger: greeting?.trigger || 'all',
            greeting_keywords: greeting?.keywords || [],
            greeting_media: greeting?.media || null,
            greeting_ai_style: greeting?.ai_style || null,
            greeting_ai_prompt: greeting?.ai_prompt || null,
            // Services
            services_mode: services?.mode || 'template',
            services_items: services?.items || [],
            services_ai_prompt: services?.ai_prompt || null,
            // Schedule
            schedule_mode: schedule?.mode || 'template',
            schedule_days: schedule?.days || [],
            // FAQ
            faq_mode: faq?.mode || 'ai',
            faq_items: faq?.items || [],

            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'bot_id',
        });

    if (error) {
        console.error('Error saving bot sections:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also update bot's knowledge base with this info
    await updateBotKnowledge(supabase, params.id, { greeting, services, schedule, faq });

    // Sync Main Flow (create/update default AI flow)
    await syncMainFlow(supabase, params.id, { greeting, services, schedule, faq });

    return NextResponse.json({ success: true });
}

// Helper to update bot's knowledge base
async function updateBotKnowledge(
    supabase: any,
    botId: string,
    data: { greeting: any; services: any; schedule: any; faq: any }
) {
    const { greeting, services, schedule, faq } = data;

    // Build knowledge content
    let content = 'SYSTEM_INSTRUCTIONS:\n';

    // 1. Add Greeting AI Prompt if valid
    if (greeting?.mode === 'ai' && greeting?.ai_prompt) {
        content += `[ROLE & BEHAVIOR]\n${greeting.ai_prompt}\n\n`;
    }

    // 2. Add Services AI Prompt
    if (services?.mode === 'ai' && services?.ai_prompt) {
        content += `[SERVICES INSTRUCTIONS]\n${services.ai_prompt}\n\n`;
    }

    // 3. Template Content
    if (services?.mode === 'template' && services.items?.length > 0) {
        content += '## Услуги и цены\n';
        for (const item of services.items) {
            if (item.name) {
                content += `- ${item.name}: ${item.price || 0} тг`;
                if (item.category) content += ` (${item.category})`;
                if (item.description) content += ` - ${item.description}`;
                content += '\n';
            }
        }
        content += '\n';
    }

    if (schedule?.mode === 'template' && schedule.days?.length > 0) {
        content += '## График работы\n';
        for (const day of schedule.days) {
            if (day.enabled) {
                content += `- ${day.day}: ${day.from} - ${day.to}\n`;
            } else {
                content += `- ${day.day}: Выходной\n`;
            }
        }
        content += '\n';
    }

    if (faq?.mode === 'template' && faq.items?.length > 0) {
        content += '## Частые вопросы\n';
        for (const item of faq.items) {
            if (item.question) {
                content += `Вопрос: ${item.question}\nОтвет: ${item.answer}\n\n`;
            }
        }
    }

    if (!content.trim()) return;

    // Upsert knowledge document
    await supabase
        .from('knowledge_documents')
        .upsert({
            bot_id: botId,
            title: 'Настройки бота (Auto-Generated)',
            content,
            type: 'text',
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'bot_id,title',
        });
}

// Helper to sync Main Flow
async function syncMainFlow(
    supabase: any,
    botId: string,
    data: { greeting: any; services: any; schedule: any; faq: any }
) {
    const { greeting } = data;

    // Only manage flow if using AI Greeting mode
    // (If user manually edits flow later, we might overwrite it?
    // Ideally we only touch "Main AI Flow" or if no flows exist)

    // Check if any flow exists
    const { data: flows } = await supabase
        .from('flows')
        .select('*')
        .eq('bot_id', botId)
        .order('created_at', { ascending: true });

    let mainFlow = flows && flows.length > 0 ? flows[0] : null;

    // Construct System Prompt from wizard data
    let systemPrompt = greeting?.ai_prompt || 'Ты полезный бизнес-ассистент.';

    // Create Default Flow Structure
    const defaultNodes = {
        _nodes: [
            {
                id: '0',
                type: 'whatsappSource', // Default, assumes whatsapp
                position: { x: 250, y: 0 },
                data: { label: 'WhatsApp' }
            },
            {
                id: '1',
                type: 'trigger',
                position: { x: 250, y: 150 },
                data: {
                    label: 'Старт',
                    triggerType: 'any',
                    triggerValue: ''
                }
            },
            {
                id: '2',
                type: 'ai',
                position: { x: 250, y: 300 },
                data: {
                    label: 'AI-Архитектор',
                    systemPrompt: systemPrompt,
                    model: 'deepseek-chat',
                    temperature: 0.7,
                    useKnowledgeBase: true
                }
            }
        ],
        _edges: [
            { id: 'e0-1', source: '0', target: '1', type: 'smoothstep', animated: true },
            { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true }
        ]
    };

    if (!mainFlow) {
        // Create new flow
        const { error } = await supabase
            .from('flows')
            .insert({
                bot_id: botId,
                name: 'Основной сценарий (Wizard)',
                nodes: defaultNodes,
                enabled: true
            });

        if (error) console.error('Error creating default flow:', error);
    } else {
        // Update existing flow API Node prompt
        // We try to find the AI node and update it, preserving other nodes if possible
        let nodes = mainFlow.nodes;
        let nodeList = [];
        let edges = [];

        // Handle different storage formats
        if (nodes && typeof nodes === 'object' && Array.isArray(nodes._nodes)) {
            nodeList = nodes._nodes;
            edges = nodes._edges || [];
        } else if (Array.isArray(nodes)) {
            nodeList = nodes;
        } else {
            // Unknown format, overwrite with default to fix "broken" flows
            nodeList = defaultNodes._nodes;
            edges = defaultNodes._edges;
        }

        // Find AI node
        const aiNodeIndex = nodeList.findIndex((n: any) => n.type === 'ai' || n.type === 'aiApi');

        if (aiNodeIndex !== -1) {
            // Update prompt
            nodeList[aiNodeIndex].data.systemPrompt = systemPrompt;
            nodeList[aiNodeIndex].data.useKnowledgeBase = true;
            nodeList[aiNodeIndex].data.model = 'deepseek-chat';

            // Re-assemble
            const updatedNodes = Array.isArray(nodes) ? nodeList : { _nodes: nodeList, _edges: edges };

            await supabase
                .from('flows')
                .update({
                    nodes: updatedNodes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', mainFlow.id);
        } else {
            // No AI node found, maybe broken? Let's overwrite if it looks like empty/default
            if (nodeList.length < 2) {
                await supabase
                    .from('flows')
                    .update({
                        nodes: defaultNodes,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', mainFlow.id);
            }
        }
    }
}
