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
        },
        services: {
            mode: data.services_mode,
            items: data.services_items || [],
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
            greeting_mode: greeting?.mode || 'ai',
            greeting_text: greeting?.text || '',
            services_mode: services?.mode || 'template',
            services_items: services?.items || [],
            schedule_mode: schedule?.mode || 'template',
            schedule_days: schedule?.days || [],
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

    return NextResponse.json({ success: true });
}

// Helper to update bot's knowledge base
async function updateBotKnowledge(
    supabase: any,
    botId: string,
    data: { greeting: any; services: any; schedule: any; faq: any }
) {
    const { services, schedule, faq } = data;

    // Build knowledge content
    let content = '';

    if (services?.mode === 'template' && services.items?.length > 0) {
        content += '## Услуги и цены\n';
        for (const item of services.items) {
            if (item.name) {
                content += `- ${item.name}: ${item.price || 0} тг\n`;
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

    if (!content) return;

    // Upsert knowledge document
    await supabase
        .from('knowledge_documents')
        .upsert({
            bot_id: botId,
            title: 'Настройки бота (автоматически)',
            content,
            type: 'text',
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'bot_id,title',
        });
}
