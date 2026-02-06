import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Global service role client for privileged operations where auth is manual
const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/bots
// Securely fetch bots for the authenticated user
export async function GET(request: NextRequest) {
    try {
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();

        let query = supabaseAdmin.from('bots').select('*').order('created_at', { ascending: false });

        if (user) {
            query = query.eq('user_id', user.id);
        } else {
            // Fallback: check query param if called from trusted source? 
            // Better: Require auth.
            // But if called via server-side fetch without cookies? 
            // For now, let's keep the user_id param fallback for internal APIs, 
            // but prioritize auth.
            const { searchParams } = new URL(request.url);
            const userId = searchParams.get('user_id');
            if (userId) {
                query = query.eq('user_id', userId);
            } else {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const { data: bots, error } = await query;

        if (error) throw error;

        return NextResponse.json({ bots });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST /api/bots - Create a new bot
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, industry, description, user_id } = body;

        // Try to get authenticated user first
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const ownerId = user?.id || user_id;

        if (!ownerId) {
            return NextResponse.json({ error: 'Unauthorized and no user_id provided' }, { status: 401 });
        }

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Check bot limit based on user's plan
        const PLAN_LIMITS: Record<string, number> = {
            trial: 1,
            starter: 1,
            pro: 3,
            business: 10,
        };

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('plan')
            .eq('id', ownerId)
            .single();

        const userPlan = profile?.plan || 'trial';
        const botLimit = PLAN_LIMITS[userPlan] || 1;

        const { count: currentBots } = await supabaseAdmin
            .from('bots')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', ownerId);

        if ((currentBots || 0) >= botLimit) {
            return NextResponse.json({
                error: `Лимит ботов достигнут (${botLimit}). Перейдите на более высокий тариф.`,
                limit: botLimit,
                current: currentBots
            }, { status: 403 });
        }

        const { data, error } = await supabaseAdmin
            .from('bots')
            .insert({
                user_id: ownerId,
                name,
                industry,
                description,
                status: 'offline',
                platform: 'whatsapp' // Default to whatsapp
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ bot: data });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
