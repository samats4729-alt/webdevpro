import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user;
        const { messages, locale } = await req.json();

        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        const isRu = locale === 'ru';

        // 1. Fetch Context (Bot Count + Recent Bots)
        const { count: botCount, data: recentBots } = await supabase
            .from('bots')
            .select('id, name, created_at', { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3);

        const botsList = recentBots?.map(b => `- "${b.name}" (ID: ${b.id})`).join('\n') || 'Нет созданных ботов.';
        const contextInfo = `User has ${botCount || 0} bots. Recent: \n${botsList}`;

        const systemPrompt = isRu
            ? `Ты — AI-Конструктор (Agent) платформы WebDevPro. 
               Твоя задача — СОЗДАВАТЬ и РЕДАКТИРОВАТЬ ботов.
               
               КОНТЕКСТ:
               ${contextInfo}
               
               Tвои инструменты (JSON):
               1. create_custom_bot(name, description)
                  * Создает бота с УНИКАЛЬНОЙ логикой на основе описания.
               2. update_node(bot_id, node_id, content) 
                  * ⛔ ИСПОЛЬЗУЙ ТОЛЬКО ЕСЛИ ПОЛЬЗОВАТЕЛЬ ЯВНО НАЗВАЛ ID.
               3. find_and_update_node(bot_id, search_text, new_content)
                  * Используй, если пользователь просит изменить текст, а ты НЕ знаешь ID.
               4. get_bot_flow(bot_id)
                  * ИСПОЛЬЗУЙ ПЕРВЫМ ДЕЛОМ, если пользователь просит "Исправь флориста", а ты не знаешь, какой там текст/телефон сейчас.
                  * Возвращает список блоков и их содержимое. Поможет тебе найти правильный search_text для find_and_update_node.
               
               ПРАВИЛА:
               1. "Хочу бота" -> СПРОСИ детали.
               2. "Исправь номер" -> Сначала посмотри flow (get_bot_flow), найди старый номер, потом find_and_update_node.
               3. "Добавь кнопку..." -> find_and_update_node + new_content=JSON.
               
               ФОРМАТ ОТВЕТА (Действие):
               JSON ТОЛЬКО для команд.
               `
            : `You are the AI Builder Agent.
               Tools:
               1. create_custom_bot
               2. update_node(bot_id, node_id) -> ONLY if user explicitly gave ID.
               3. find_and_update_node(bot_id, search_text, new_content) -> Use this for "Change text".
               4. get_bot_flow(bot_id) -> INSPECT FLOW structure.
               
               Rules:
               - NEVER GUESS IDS.
               - If user asks to change specific text/phone but you don't know the current value -> get_bot_flow FIRST.
               `;

        // Sanitize messages
        const sanitizedMessages = messages.map((msg: any) => ({
            role: msg.role === 'ai' ? 'assistant' : msg.role,
            content: msg.content
        }));

        // Request to DeepSeek API
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...sanitizedMessages
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'AI Provider Error' }, { status: response.status });
        }

        const data = await response.json();
        let reply = data.choices[0]?.message?.content || '';
        let actionResult = null;

        // 2. Action Handling (Agent Loop)
        try {
            console.log('[AI Debug] Raw Reply:', reply); // Log full raw output

            let trimmed = reply.trim();
            let commandStr = trimmed;

            // 1. Try to extract from Markdown Code Block
            const jsonBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (jsonBlockMatch) {
                commandStr = jsonBlockMatch[1].trim();
            } else {
                // 2. Try to find JSON object structure (first '{' to last '}')
                const firstBrace = trimmed.indexOf('{');
                const lastBrace = trimmed.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    commandStr = trimmed.substring(firstBrace, lastBrace + 1);
                }
            }

            if (commandStr.startsWith('{') && commandStr.endsWith('}')) {
                const command = JSON.parse(commandStr);
                console.log('[AI Debug] Parsed Command:', JSON.stringify(command, null, 2)); // Log parsed JSON

                // Normalize 'function' or 'command' call format to 'action' format
                if (command.function && !command.action) {
                    command.action = command.function;
                    command.params = command.arguments || {};
                }
                if (command.command && !command.action) {
                    command.action = command.command;
                }

                // Helper to preserve AI text but remove JSON
                const cleanReply = trimmed.replace(jsonBlockMatch ? jsonBlockMatch[0] : commandStr, '').trim();

                if (command.action === 'create_custom_bot') {
                    const { createCustomBotAction } = await import('@/lib/ai/actions');
                    const params = command.params || command;

                    // Send immediate feedback if AI didn't provide any text
                    if (!cleanReply) reply = `🏗️ Начинаю проектировать бота "${params.name}"...`;
                    else reply = cleanReply;

                    try {
                        const result = await createCustomBotAction(user.id, params.name || 'New Bot', params.description);
                        reply += `\n\n✅ Бот "${result.botName}" создан! (ID: ${result.botId})`;
                        actionResult = 'full';
                    } catch (e: any) {
                        console.error('Custom Bot Gen Failed:', e);
                        reply += `\n\n⚠️ Ошибка генерации схемы: ${e.message}`;
                        actionResult = 'full';
                    }
                }
                else if (command.action === 'create_bot') {
                    // ... Legacy ...
                }
                else if (command.action === 'apply_template') {
                    const { applyTemplateAction } = await import('@/lib/ai/actions');
                    const params = command.params || command;
                    await applyTemplateAction(user.id, params.bot_id, params.template_type);
                    reply = cleanReply + `\n\n✅ Шаблон "${params.template_type}" применен!`;
                    actionResult = 'flow';
                }
                else if (command.action === 'update_node') {
                    const { updateNodeAction } = await import('@/lib/ai/actions');
                    const params = command.params || command; // Support flat or nested

                    // SANITIZATION: AI sometimes sends { type: "message", text: "..." } instead of string
                    let contentToUpdate = params.content;
                    if (typeof contentToUpdate === 'object' && contentToUpdate !== null) {
                        if (contentToUpdate.text) contentToUpdate = contentToUpdate.text;
                        else if (contentToUpdate.message) contentToUpdate = contentToUpdate.message;
                        else contentToUpdate = JSON.stringify(contentToUpdate); // Fallback
                    }

                    try {
                        await updateNodeAction(user.id, params.bot_id, params.node_id, contentToUpdate);
                        reply = cleanReply + `\n\n✅ Успешно обновлено! ("${String(contentToUpdate).substring(0, 30)}...")`;
                        actionResult = 'flow';
                    } catch (e: any) {
                        console.error('Update Node Failed:', e);
                        reply = cleanReply + `\n\n❌ Ошибка: ${e.message}`;
                    }
                }
                else if (command.action === 'find_and_update_node') {
                    const { findAndUpdateNodeAction } = await import('@/lib/ai/actions');
                    const params = command.params || command;

                    try {
                        const result = await findAndUpdateNodeAction(user.id, params.bot_id, params.search_text, params.new_content);
                        reply = cleanReply + `\n\n✅ Текст заменен! (Блок ${result.updatedNodeId})`;
                        actionResult = 'flow';
                    } catch (e: any) {
                        console.error('Find/Update Failed:', e);
                        reply = cleanReply + `\n\n⚠️ Не нашел такой текст: ${e.message}. Попробуйте уточнить.`;
                    }
                }
                else if (command.action === 'get_bot_flow') {
                    const { getBotFlowAction } = await import('@/lib/ai/actions');
                    const params = command.params || command;

                    try {
                        const summary = await getBotFlowAction(user.id, params.bot_id);
                        reply = `🔍 **Анализ структуры бота:**\n\n${summary}\n\nТеперь вы можете сказать мне, какой именно текст или блок изменить, используя точные фразы из списка выше.`;
                        // No refresh needed, just info
                    } catch (e: any) {
                        reply = `❌ Ошибка чтения структуры: ${e.message}`;
                    }
                }
            }
        } catch (e) {
            console.error('AI Action Execution Failed:', e);
        }

        return NextResponse.json({
            reply,
            refreshType: actionResult // 'full' | 'flow' | null
        });

    } catch (error) {
        console.error('Private Chat Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
