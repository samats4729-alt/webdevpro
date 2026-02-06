import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/services?bot_id=...
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const botId = searchParams.get('bot_id');

        if (!botId) {
            return NextResponse.json({ error: 'bot_id required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('bot_id', botId)
            .order('name');

        if (error) throw error;

        return NextResponse.json({ services: data });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST /api/services - Create service
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { bot_id, name, description, duration_minutes, price, currency, is_active } = body;

        if (!bot_id || !name) {
            return NextResponse.json({ error: 'bot_id and name required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('services')
            .insert({
                bot_id,
                name,
                description,
                duration_minutes: duration_minutes || 60,
                price,
                currency: currency || 'KZT',
                is_active: is_active !== undefined ? is_active : true
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ service: data });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// PUT /api/services - Update service
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name, description, duration_minutes, price, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'id required' }, { status: 400 });
        }

        const updateData: any = { updated_at: new Date().toISOString() };
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (duration_minutes !== undefined) updateData.duration_minutes = duration_minutes;
        if (price !== undefined) updateData.price = price;
        if (is_active !== undefined) updateData.is_active = is_active;

        const { data, error } = await supabase
            .from('services')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ service: data });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE /api/services?id=...
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id required' }, { status: 400 });
        }

        await supabase
            .from('services')
            .delete()
            .eq('id', id);

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
