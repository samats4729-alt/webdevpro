import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Flow rule interface
export interface FlowRule {
    id: string;
    trigger: {
        type: 'keyword' | 'contains' | 'starts_with' | 'exact';
        value: string;
    };
    action: {
        type: 'reply';
        message: string;
    };
    enabled: boolean;
}

// GET - Get all flow rules for a bot
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const botId = params.id;
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify bot ownership
        const { data: bot } = await supabase
            .from('bots')
            .select('id, user_id')
            .eq('id', botId)
            .eq('user_id', user.id)
            .single();

        if (!bot) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        }

        // Get flows for this bot
        const { data: flows, error } = await supabase
            .from('flows')
            .select('*')
            .eq('bot_id', botId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching flows:', error);
            return NextResponse.json({ error: 'Failed to fetch flows' }, { status: 500 });
        }

        return NextResponse.json(flows || []);

    } catch (error: any) {
        console.error('Flows GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create a new flow
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const botId = params.id;
        const body = await request.json();
        const { name, rules } = body;

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify bot ownership
        const { data: bot } = await supabase
            .from('bots')
            .select('id')
            .eq('id', botId)
            .eq('user_id', user.id)
            .single();

        if (!bot) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        }

        // Create flow
        const { data: flow, error } = await supabase
            .from('flows')
            .insert([{
                bot_id: botId,
                name: name || 'Новый сценарий',
                nodes: rules || []
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating flow:', error);
            return NextResponse.json({ error: 'Failed to create flow' }, { status: 500 });
        }

        return NextResponse.json(flow);

    } catch (error: any) {
        console.error('Flows POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT - Update flow rules
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const botId = params.id;
        const body = await request.json();
        const { flowId, name, rules, nodes, edges } = body;

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify bot ownership
        const { data: bot } = await supabase
            .from('bots')
            .select('id')
            .eq('id', botId)
            .eq('user_id', user.id)
            .single();

        if (!bot) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        }

        // Update flow
        const updates: any = { updated_at: new Date().toISOString() };
        if (name !== undefined) updates.name = name;

        // Store nodes and edges together in the nodes column
        // (edges column may not exist in all DBs)
        if (nodes !== undefined) {
            // Store as: { _nodes: [...], _edges: [...] } for new format
            updates.nodes = {
                _nodes: nodes,
                _edges: edges || []
            };
        } else if (rules !== undefined) {
            updates.nodes = rules;
        }

        const { data: flow, error } = await supabase
            .from('flows')
            .update(updates)
            .eq('id', flowId)
            .eq('bot_id', botId)
            .select()
            .single();

        if (error) {
            console.error('Error updating flow:', error);
            return NextResponse.json({ error: 'Failed to update flow' }, { status: 500 });
        }

        return NextResponse.json(flow);

    } catch (error: any) {
        console.error('Flows PUT error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete a flow
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const botId = params.id;
        const { searchParams } = new URL(request.url);
        const flowId = searchParams.get('flowId');

        if (!flowId) {
            return NextResponse.json({ error: 'Flow ID is required' }, { status: 400 });
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify bot ownership
        const { data: bot } = await supabase
            .from('bots')
            .select('id')
            .eq('id', botId)
            .eq('user_id', user.id)
            .single();

        if (!bot) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        }

        // Delete flow
        const { error } = await supabase
            .from('flows')
            .delete()
            .eq('id', flowId)
            .eq('bot_id', botId);

        if (error) {
            console.error('Error deleting flow:', error);
            return NextResponse.json({ error: 'Failed to delete flow' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Flows DELETE error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
