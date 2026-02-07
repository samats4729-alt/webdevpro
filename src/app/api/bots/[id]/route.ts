import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';


// GET - Get bot details
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

        const { data: bot, error } = await supabase
            .from('bots')
            .select('*')
            .eq('id', botId)
            .eq('user_id', user.id)
            .single();

        if (error || !bot) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        }

        return NextResponse.json(bot);

    } catch (error: any) {
        console.error('[API Bot Details] Get Error:', error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}

// PATCH - Update bot settings
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const botId = params.id;
        const body = await request.json();

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only allow updating specific fields
        const allowedFields = ['name', 'welcome_message', 'auto_reply_enabled', 'auto_reply_message', 'platform', 'description'];
        const updates: any = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        updates.updated_at = new Date().toISOString();

        const { data: bot, error } = await supabase
            .from('bots')
            .update(updates)
            .eq('id', botId)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Update bot error:', error);
            return NextResponse.json({ error: 'Failed to update bot' }, { status: 500 });
        }

        return NextResponse.json(bot);

    } catch (error: any) {
        console.error('Update bot error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete bot
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const botId = params.id;

        if (!botId) {
            return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if bot exists and belongs to user
        const { data: bot } = await supabase
            .from('bots')
            .select('id')
            .eq('id', botId)
            .eq('user_id', user.id)
            .single();

        if (!bot) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        }

        // --- Disconnect Logic Start ---
        // Originally: await disconnectWhatsAppClient(botId);
        // New Baileys Logic:
        const { getWhatsAppSession } = await import('@/lib/whatsapp/client');
        const fs = await import('fs');
        const path = await import('path');

        const session = getWhatsAppSession(botId);

        if (session && session.sock) {
            console.log(`[DELETE] Disconnecting bot ${botId} before deletion...`);
            try {
                await session.sock.logout();
                session.sock.end(undefined);
            } catch (e) {
                console.error('Error logging out during delete:', e);
            }

            // Clean up local files
            const authPath = path.join(process.cwd(), 'baileys_auth_info', `session-${botId}`);
            if (fs.existsSync(authPath)) {
                fs.rmSync(authPath, { recursive: true, force: true });
            }
        } else {
            // Even if no active session in memory, check for stale files
            const authPath = path.join(process.cwd(), 'baileys_auth_info', `session-${botId}`);
            if (fs.existsSync(authPath)) {
                fs.rmSync(authPath, { recursive: true, force: true });
            }
        }
        // --- Disconnect Logic End ---

        // Delete bot from database
        const { error } = await supabase
            .from('bots')
            .delete()
            .eq('id', botId)
            .eq('user_id', user.id);

        if (error) {
            console.error('Failed to delete bot:', error);
            return NextResponse.json({ error: 'Failed to delete bot' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Bot deleted successfully' });

    } catch (error: any) {
        console.error('Delete bot error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
