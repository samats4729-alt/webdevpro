import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Admin email - only this user can access admin panel
const ADMIN_EMAIL = 'admin@tenderai.kz';

const PLANS = {
    trial: { price: 0 },
    starter: { price: 7000 },
    pro: { price: 10000 },
    business: { price: 30000 },
};

export async function GET(request: NextRequest) {
    try {
        // Check admin access
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || user.email !== ADMIN_EMAIL) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get date ranges
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        // Total users
        const { count: totalUsers } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        // New users today
        const { count: newToday } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', todayStart);

        // New users this week
        const { count: newWeek } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', weekStart);

        // New users this month
        const { count: newMonth } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', monthStart);

        // Users by plan
        const { data: planStats } = await supabaseAdmin
            .from('profiles')
            .select('plan');

        const planCounts = {
            trial: 0,
            starter: 0,
            pro: 0,
            business: 0
        };

        planStats?.forEach(p => {
            const plan = p.plan || 'trial';
            if (plan in planCounts) {
                planCounts[plan as keyof typeof planCounts]++;
            }
        });

        // Calculate revenue (monthly)
        const revenue = {
            starter: planCounts.starter * PLANS.starter.price,
            pro: planCounts.pro * PLANS.pro.price,
            business: planCounts.business * PLANS.business.price,
            total: 0
        };
        revenue.total = revenue.starter + revenue.pro + revenue.business;

        // Total bots
        const { count: totalBots } = await supabaseAdmin
            .from('bots')
            .select('*', { count: 'exact', head: true });

        // Total leads
        const { count: totalLeads } = await supabaseAdmin
            .from('leads')
            .select('*', { count: 'exact', head: true });

        // Total appointments
        const { count: totalAppointments } = await supabaseAdmin
            .from('appointments')
            .select('*', { count: 'exact', head: true });

        // Support tickets (open)
        const { count: openTickets } = await supabaseAdmin
            .from('support_tickets')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'open');

        // Get all open tickets with messages
        const { data: tickets } = await supabaseAdmin
            .from('support_tickets')
            .select(`
                *,
                support_messages (*)
            `)
            .eq('status', 'open')
            .order('updated_at', { ascending: false })
            .limit(50);

        return NextResponse.json({
            users: {
                total: totalUsers || 0,
                newToday: newToday || 0,
                newWeek: newWeek || 0,
                newMonth: newMonth || 0
            },
            plans: planCounts,
            revenue,
            activity: {
                bots: totalBots || 0,
                leads: totalLeads || 0,
                appointments: totalAppointments || 0
            },
            support: {
                openTickets: openTickets || 0,
                tickets: tickets || []
            }
        });
    } catch (error: any) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Reply to support ticket
export async function POST(request: NextRequest) {
    try {
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || user.email !== ADMIN_EMAIL) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { ticket_id, message, action } = await request.json();

        if (action === 'close') {
            await supabaseAdmin
                .from('support_tickets')
                .update({ status: 'closed', updated_at: new Date().toISOString() })
                .eq('id', ticket_id);

            return NextResponse.json({ success: true });
        }

        if (message) {
            const { data, error } = await supabaseAdmin
                .from('support_messages')
                .insert({
                    ticket_id,
                    sender_type: 'admin',
                    message
                })
                .select()
                .single();

            if (error) throw error;

            // Update ticket timestamp
            await supabaseAdmin
                .from('support_tickets')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', ticket_id);

            return NextResponse.json({ message: data });
        }

        return NextResponse.json({ error: 'No action specified' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
