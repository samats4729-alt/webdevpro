import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Admin email - set in .env.local as ADMIN_EMAIL
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'samat@tenderai.kz';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== ADMIN_EMAIL) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get user stats
    const { data: profiles, count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const newToday = profiles?.filter(p => new Date(p.created_at) >= today).length || 0;
    const newWeek = profiles?.filter(p => new Date(p.created_at) >= weekAgo).length || 0;
    const newMonth = profiles?.filter(p => new Date(p.created_at) >= monthAgo).length || 0;

    // Plan distribution
    const planCounts = {
        trial: profiles?.filter(p => p.plan === 'trial').length || 0,
        starter: profiles?.filter(p => p.plan === 'starter').length || 0,
        pro: profiles?.filter(p => p.plan === 'pro').length || 0,
        business: profiles?.filter(p => p.plan === 'business').length || 0,
    };

    // Revenue calculation (monthly prices in tenge)
    const PRICES = { starter: 4990, pro: 9990, business: 29990 };
    const revenue = {
        starter: planCounts.starter * PRICES.starter,
        pro: planCounts.pro * PRICES.pro,
        business: planCounts.business * PRICES.business,
        total: planCounts.starter * PRICES.starter + planCounts.pro * PRICES.pro + planCounts.business * PRICES.business
    };

    // Activity stats
    const { count: botsCount } = await supabase.from('bots').select('*', { count: 'exact', head: true });
    const { count: leadsCount } = await supabase.from('leads').select('*', { count: 'exact', head: true });
    const { count: appointmentsCount } = await supabase.from('appointments').select('*', { count: 'exact', head: true });

    // Support tickets
    const { data: tickets } = await supabase
        .from('support_tickets')
        .select(`
            *,
            support_messages (*)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

    return NextResponse.json({
        users: {
            total: totalUsers || 0,
            newToday,
            newWeek,
            newMonth
        },
        plans: planCounts,
        revenue,
        activity: {
            bots: botsCount || 0,
            leads: leadsCount || 0,
            appointments: appointmentsCount || 0
        },
        support: {
            openTickets: tickets?.length || 0,
            tickets: tickets || []
        }
    });
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== ADMIN_EMAIL) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { ticket_id, message, action } = body;

    if (action === 'close') {
        await supabase
            .from('support_tickets')
            .update({ status: 'closed' })
            .eq('id', ticket_id);
        return NextResponse.json({ success: true });
    }

    if (message) {
        await supabase.from('support_messages').insert({
            ticket_id,
            message,
            sender_type: 'admin'
        });
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
