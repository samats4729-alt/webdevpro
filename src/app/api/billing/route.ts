import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PLANS = {
    trial: { botsLimit: 1, price: 0 },
    starter: { botsLimit: 1, price: 7000 },
    pro: { botsLimit: 3, price: 10000 },
    business: { botsLimit: 10, price: 30000 },
};

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('plan, created_at')
            .eq('id', user.id)
            .single();

        const { count: botsCount } = await supabase
            .from('bots')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        const plan = profile?.plan || 'trial';
        const planData = PLANS[plan as keyof typeof PLANS] || PLANS.trial;

        // Calculate trial end
        let trialEnds = null;
        if (plan === 'trial') {
            const createdAt = new Date(profile?.created_at || user.created_at);
            const trialEnd = new Date(createdAt);
            trialEnd.setDate(trialEnd.getDate() + 3);
            trialEnds = trialEnd.toISOString();
        }

        return NextResponse.json({
            plan,
            botsCount: botsCount || 0,
            botsLimit: planData.botsLimit,
            trialEnds,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { plan } = await request.json();

        if (!plan || !PLANS[plan as keyof typeof PLANS]) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        // Update user's plan
        const { error } = await supabase
            .from('profiles')
            .update({ plan })
            .eq('id', user.id);

        if (error) {
            console.error('Failed to update plan:', error);
            return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            plan,
            botsLimit: PLANS[plan as keyof typeof PLANS].botsLimit
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
