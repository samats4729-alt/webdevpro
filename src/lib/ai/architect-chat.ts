/**
 * AI Architect Conversational Chat System
 * Handles conversational dialogue for bot configuration
 */

import { ARCHITECT_ACTIONS, executeAction, getActionsForPrompt } from './architect-actions';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

const CONVERSATIONAL_SYSTEM_PROMPT = `
Ты — AI Архитектор бота. Ты ПОЛНОСТЬЮ создаешь и настраиваешь ботов автономно.

КРИТИЧЕСКИ ВАЖНО - СБОР ИНФОРМАЦИИ:
Перед созданием бота ОБЯЗАТЕЛЬНО уточни у пользователя:
1. **Платформа**: "WhatsApp или Telegram?"
2. **Регион/Валюта**: "Какая валюта? ₸ (тенге), ₽ (рубли), $ (доллары)?"
3. **Услуги и цены**: "Какие услуги предлагаете и по каким ценам?"

ПРАВИЛО ВАЛЮТЫ:
- Казахстан = ₸ (тенге)
- Россия = ₽ (рубли)
- СНГ/другие = спроси
НЕ ВЫДУМЫВАЙ цены! Используй ТОЛЬКО те цены, которые назвал пользователь.

ПРАВИЛО УСЛУГ:
Когда пользователь называет услуги - ОБЯЗАТЕЛЬНО добавь их через \`add_service\`:
\`\`\`action
{"action": "add_service", "params": {"name": "Стрижка", "duration_minutes": 30, "price": 3000}}
\`\`\`
НЕ пиши примерные цены! Спроси реальные у пользователя.

ПРАВИЛО ВРЕМЕНИ:
НЕ хардкодь слоты времени (15:00, 18:30 и т.д.)!
Бот будет брать РЕАЛЬНЫЕ свободные слоты из системы расписания.
В промпте пиши: "Бот предложит клиенту свободные слоты из вашего графика работы."

ПРАВИЛЬНАЯ СТРУКТУРА СЦЕНАРИЯ:
1. ПЛАТФОРМА (whatsappSource или telegramSource) - ПЕРВАЯ НОДА
2. ТРИГГЕР (trigger) - ВТОРАЯ НОДА
3. Остальные ноды (message, ai, buttons, etc.)

ЦЕПОЧКА ДЕЙСТВИЙ:
1. Спросить платформу (WhatsApp/Telegram)
2. Спросить валюту/регион
3. Спросить услуги и РЕАЛЬНЫЕ цены
4. \`create_bot\` с platform
5. \`add_service\` для КАЖДОЙ услуги с реальной ценой
6. \`configure_schedule\` если нужен график
7. \`generate_complete_flow\` с platform

ПРИМЕР ПРАВИЛЬНОГО ДИАЛОГА:
Пользователь: "Создай бота для барбершопа"
Ты: "Отлично! 💈 Несколько вопросов:
1. Платформа: WhatsApp или Telegram?
2. Регион: Казахстан (₸) или Россия (₽)?
3. Какие услуги и цены? (например: стрижка - 3000₸, борода - 1500₸)"

Пользователь: "WhatsApp, Казахстан, стрижка 4000₸, борода 2000₸"
Ты: "Создаю бота для WhatsApp! 💈
\`\`\`action
{"action": "create_bot", "params": {"name": "Барбершоп", "industry": "beauty", "platform": "whatsapp"}}
\`\`\`
\`\`\`action
{"action": "add_service", "params": {"name": "Стрижка", "duration_minutes": 30, "price": 4000}}
\`\`\`
\`\`\`action
{"action": "add_service", "params": {"name": "Борода", "duration_minutes": 20, "price": 2000}}
\`\`\`
\`\`\`action
{"action": "generate_complete_flow", "params": {"description": "...", "platform": "whatsapp"}}
\`\`\`"

ФОРМАТ:
\`\`\`action
{"action": "...", "params": {...}}
\`\`\`

${getActionsForPrompt()}

НЕ ДЕЛАЙ:
- НЕ выдумывай цены — спрашивай!
- НЕ хардкодь слоты времени
- НЕ создавай бота без выбора платформы
- НЕ пиши рубли для Казахстана
- НЕ говори "я не могу"
`;

/**
 * Process a chat message and potentially execute actions
 */
export async function processArchitectChat(
    messages: ChatMessage[],
    botId: string,
    apiKey: string,
    userId?: string,
    existingBots?: string
): Promise<{ response: string; actionResults: any[]; createdBotId?: string }> {

    let systemContent = CONVERSATIONAL_SYSTEM_PROMPT;
    if (existingBots) {
        systemContent += `\n\nСУЩЕСТВУЮЩИЕ БОТЫ ПОЛЬЗОВАТЕЛЯ:\n${existingBots}\n\nЕсли пользователь просит редактировать бота из списка - используй его ID.`;
    }

    // Call the AI
    const aiResponse = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: systemContent },
                ...messages
            ],
            temperature: 0.7,
            max_tokens: 1000
        })
    });

    if (!aiResponse.ok) {
        throw new Error(`AI API Error: ${aiResponse.statusText}`);
    }

    const data = await aiResponse.json();
    let responseText = data.choices[0]?.message?.content || 'Извините, произошла ошибка.';

    // Extract and execute actions
    const actionResults: any[] = [];
    const actionRegex = /```action\s*\n?([\s\S]*?)\n?```/g;
    let createdBotId: string | undefined;

    // First, collect ALL matches before executing (to avoid regex iteration issues)
    const matches: { fullMatch: string; jsonContent: string }[] = [];
    let match;
    while ((match = actionRegex.exec(responseText)) !== null) {
        matches.push({ fullMatch: match[0], jsonContent: match[1] });
    }

    // Now execute all actions in order
    for (const m of matches) {
        try {
            const actionData = JSON.parse(m.jsonContent);
            // Allow create_bot even if botId is "new" or empty
            if (actionData.action && (botId || actionData.action === 'create_bot')) {
                console.log(`[Architect] Executing action: ${actionData.action}`, actionData.params);
                const result = await executeAction(actionData.action, actionData.params || {}, botId, userId);
                actionResults.push({ action: actionData.action, ...result });

                // If a bot was created, update botId for subsequent actions in this turn
                if (result.success && result.data?.createdBotId) {
                    botId = result.data.createdBotId;
                    createdBotId = botId;
                }

                // Replace the action block with the result message
                responseText = responseText.replace(m.fullMatch, result.message);
            }
        } catch (e) {
            console.error('Failed to parse/execute action:', e);
        }
    }

    // Clean up any remaining action blocks
    responseText = responseText.replace(/```action[\s\S]*?```/g, '');

    return { response: responseText.trim(), actionResults, createdBotId };
}

/**
 * Initial greeting message
 */
export function getInitialGreeting(): string {
    return `Привет! 👋 Я Архитектор вашего бота. 

Расскажите что за бота хотите создать, и я задам пару уточняющих вопросов:

📱 Платформа (WhatsApp / Telegram)
🌍 Регион и валюта (₸ тенге / ₽ рубли)
💰 Ваши услуги и реальные цены

Например: "Хочу бота для барбершопа в Казахстане"`;
}
