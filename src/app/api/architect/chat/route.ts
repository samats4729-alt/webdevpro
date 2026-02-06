import { NextRequest, NextResponse } from 'next/server';
import { processArchitectChat, getInitialGreeting, ChatMessage } from '@/lib/ai/architect-chat';

export async function POST(request: NextRequest) {
    try {
        const { botId, messages, mode, sessionId: reqSessionId } = await request.json();

        // 1. Validate inputs
        if (!botId && mode === 'configure') {
            return NextResponse.json({ error: 'Bot ID is required for configure mode' }, { status: 400 });
        }

        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        // 2. Auth & Session Management
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        let sessionId = reqSessionId;

        if (user) {
            // Check if session exists or create new
            if (!sessionId) {
                const { data: newSession, error: sessionError } = await supabase
                    .from('architect_sessions')
                    .insert({ user_id: user.id, title: 'New Conversation' })
                    .select()
                    .single();

                if (sessionError) throw sessionError;
                sessionId = newSession.id;
            }

            // Save USER message
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.role === 'user') {
                await supabase.from('architect_messages').insert({
                    session_id: sessionId,
                    role: 'user',
                    content: lastMessage.content
                });

                // Smart Title Update (if it's the first few messages)
                const { count } = await supabase.from('architect_messages').select('*', { count: 'exact', head: true }).eq('session_id', sessionId);
                if (count && count <= 2) {
                    // Simple heuristic: use first 30 chars of prompt
                    const title = lastMessage.content.substring(0, 30) + (lastMessage.content.length > 30 ? '...' : '');
                    await supabase.from('architect_sessions').update({ title }).eq('id', sessionId);
                }
            }
        }

        // 3. Process Chat
        // If no messages, return initial greeting (but save it if session exists?)
        if (!messages || messages.length === 0) {
            return NextResponse.json({
                response: getInitialGreeting(),
                actionResults: [],
                sessionId
            });
        }

        // 2.5 Fetch Existing Bots for Context
        let existingBotsContext = '';
        if (user) {
            const { data: bots } = await supabase
                .from('bots')
                .select('id, name, industry, description')
                .eq('user_id', user.id);

            if (bots && bots.length > 0) {
                existingBotsContext = JSON.stringify(bots, null, 2);
            }
        }

        const result = await processArchitectChat(
            messages as ChatMessage[],
            botId || 'new', // Handle case where botId is null for generation
            apiKey,
            user?.id, // Pass user ID for bot creation
            existingBotsContext // Pass context
        );

        // 4. Save AI Response
        if (user && sessionId && result.response) {
            await supabase.from('architect_messages').insert({
                session_id: sessionId,
                role: 'ai',
                content: result.response,
                action_results: result.actionResults ? JSON.stringify(result.actionResults) : null
            });
        }

        // Return result with createdBotId if any
        return NextResponse.json({ ...result, sessionId, createdBotId: result.createdBotId });

    } catch (error: any) {
        console.error('Architect Chat Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process chat' },
            { status: 500 }
        );
    }
}

// GET - return available actions info
// GET: Fetch messages for a session or return info
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        // If no session ID, return basic info (backward compatibility)
        if (!sessionId) {
            return NextResponse.json({
                description: 'AI Architect Conversational Chat API',
                usage: 'POST with { botId, messages: [{role, content}] }',
                modes: ['configure', 'generate']
            });
        }

        const { createClient } = await import('@/lib/supabase/server');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: messages, error } = await supabase
            .from('architect_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ messages });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
