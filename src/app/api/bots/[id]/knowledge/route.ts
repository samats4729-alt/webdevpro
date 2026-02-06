import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - List all knowledge items for a bot
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify bot ownership
        const { data: bot } = await supabase
            .from('bots')
            .select('id')
            .eq('id', params.id)
            .eq('user_id', user.id)
            .single();

        if (!bot) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        }

        // Get knowledge items
        const { data: items, error } = await supabase
            .from('knowledge_base')
            .select('*')
            .eq('bot_id', params.id)
            .order('category')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[knowledge] Error fetching:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ items: items || [] });
    } catch (error: any) {
        console.error('[knowledge] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Add new knowledge item
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify bot ownership
        const { data: bot } = await supabase
            .from('bots')
            .select('id')
            .eq('id', params.id)
            .eq('user_id', user.id)
            .single();

        if (!bot) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        }

        const body = await request.json();
        const { category, title, content, price, metadata } = body;

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        const { data: item, error } = await supabase
            .from('knowledge_base')
            .insert({
                bot_id: params.id,
                category: category || 'general',
                title,
                content,
                price: price || null,
                metadata: metadata || {}
            })
            .select()
            .single();

        if (error) {
            console.error('[knowledge] Error creating:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ item });
    } catch (error: any) {
        console.error('[knowledge] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Remove knowledge item
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const itemId = searchParams.get('itemId');

        if (!itemId) {
            return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
        }

        // Verify bot ownership and delete
        const { error } = await supabase
            .from('knowledge_base')
            .delete()
            .eq('id', itemId)
            .eq('bot_id', params.id);

        if (error) {
            console.error('[knowledge] Error deleting:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[knowledge] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
