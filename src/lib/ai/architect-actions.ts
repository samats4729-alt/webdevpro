import { createClient } from '@/lib/supabase/server';

/**
 * AI Architect Actions System
 * Enables the AI to execute actions like configuring schedules, adding services, etc.
 */

export interface ActionResult {
    success: boolean;
    message: string;
    data?: any;
}

export interface ArchitectAction {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, { type: string; description: string; enum?: string[] }>;
        required: string[];
    };
}

// Available actions the AI can call
export const ARCHITECT_ACTIONS: ArchitectAction[] = [
    {
        name: 'create_bot',
        description: 'Создать нового бота. ИСПОЛЬЗОВАТЬ ПЕРВЫМ, если бот еще не создан (botId="new"). ОБЯЗАТЕЛЬНО указать платформу!',
        parameters: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Название бота' },
                industry: { type: 'string', description: 'Отрасль (например, beauty, shop, service)' },
                description: { type: 'string', description: 'Краткое описание' },
                platform: { type: 'string', description: 'Платформа: whatsapp или telegram. ОБЯЗАТЕЛЬНЫЙ параметр!', enum: ['whatsapp', 'telegram'] }
            },
            required: ['name', 'platform']
        }
    },
    {
        name: 'configure_schedule',
        description: 'Настроить рабочий график бота. Поддерживает ДВА типа: 1) weekly - по дням недели (Пн-Пт), 2) shift - сменный график (2/2, 4/3 и т.д.)',
        parameters: {
            type: 'object',
            properties: {
                schedule_type: {
                    type: 'string',
                    description: 'Тип графика: weekly (по дням недели) или shift (сменный 2/2, 4/3 и т.д.)',
                    enum: ['weekly', 'shift']
                },
                working_days: {
                    type: 'array',
                    description: 'Для weekly: массив рабочих дней (0=Вс, 1=Пн, ..., 6=Сб). Например [1,2,3,4,5] для Пн-Пт'
                },
                shift_work_days: {
                    type: 'number',
                    description: 'Для shift: количество рабочих дней в цикле (например 2 для графика 2/2)'
                },
                shift_off_days: {
                    type: 'number',
                    description: 'Для shift: количество выходных дней в цикле (например 2 для графика 2/2)'
                },
                cycle_start_date: {
                    type: 'string',
                    description: 'Для shift: дата начала цикла (первый рабочий день) в формате YYYY-MM-DD'
                },
                start_time: {
                    type: 'string',
                    description: 'Время начала работы в формате HH:MM (например, 09:00)'
                },
                end_time: {
                    type: 'string',
                    description: 'Время окончания работы в формате HH:MM (например, 18:00)'
                }
            },
            required: ['schedule_type', 'start_time', 'end_time']
        }
    },
    {
        name: 'add_service',
        description: 'Добавить новую услугу. ОБЯЗАТЕЛЬНО укажи валюту: KZT для Казахстана, RUB для России!',
        parameters: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Название услуги'
                },
                duration_minutes: {
                    type: 'number',
                    description: 'Длительность в минутах'
                },
                price: {
                    type: 'number',
                    description: 'Цена услуги'
                },
                currency: {
                    type: 'string',
                    description: 'Валюта: KZT (₸ тенге), RUB (₽ рубли), USD ($), EUR (€)',
                    enum: ['KZT', 'RUB', 'USD', 'EUR', 'UZS', 'UAH']
                }
            },
            required: ['name', 'duration_minutes', 'currency']
        }
    },
    {
        name: 'get_current_settings',
        description: 'Получить текущие настройки бота (график, услуги)',
        parameters: {
            type: 'object',
            properties: {},
            required: []
        }
    },
    {
        name: 'add_exception_day',
        description: 'Добавить выходной день (праздник, отпуск)',
        parameters: {
            type: 'object',
            properties: {
                date: {
                    type: 'string',
                    description: 'Дата в формате YYYY-MM-DD'
                },
                reason: {
                    type: 'string',
                    description: 'Причина (например, Праздник, Отпуск)'
                }
            },
            required: ['date']
        }
    },
    {
        name: 'update_bot_instructions',
        description: 'Обновить инструкции (ситемный промпт) для AI-мозга бота. Используйте это, когда пользователь описывает, как бот должен себя вести, что продавать и как отвечать.',
        parameters: {
            type: 'object',
            properties: {
                instructions: { type: 'string', description: 'Полный текст инструкций для AI. Включи сюда информацию о цене, услугах, тоне общения и т.д.' }
            },
            required: ['instructions']
        }
    },
    {
        name: 'generate_complete_flow',
        description: 'Сгенерировать полный сценарий (flow) для бота на основе текстового описания. ОБЯЗАТЕЛЬНО указать платформу! Структура всегда: Платформа → Триггер → Логика',
        parameters: {
            type: 'object',
            properties: {
                description: { type: 'string', description: 'Полное описание логики бота: что он делает, какие шаги' },
                flowName: { type: 'string', description: 'Название сценария (например: Основной сценарий)' },
                platform: { type: 'string', description: 'Платформа: whatsapp или telegram. ОБЯЗАТЕЛЬНЫЙ параметр!', enum: ['whatsapp', 'telegram'] }
            },
            required: ['description', 'platform']
        }
    }
];

/**
 * Execute an action by calling the appropriate API
 */
export async function executeAction(
    actionName: string,
    params: Record<string, any>,
    botId: string,
    userId?: string
): Promise<ActionResult> {
    // Determine Base URL for API calls
    const getBaseUrl = () => {
        if (typeof window !== 'undefined') return ''; // Browser side relative
        if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
        if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
        return 'http://localhost:3000'; // Fallback for local dev
    };

    const baseUrl = getBaseUrl();

    // Guard: validation for existing bot actions
    if (actionName !== 'create_bot' && (botId === 'new' || !botId)) {
        return {
            success: false,
            message: '❌ Ошибка: Бот еще не создан. Сначала создайте бота с помощью действия `create_bot`.'
        };
    }

    try {
        switch (actionName) {
            case 'create_bot': {
                const { name, industry, description, platform } = params;

                const response = await fetch(`${baseUrl}/api/bots`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name,
                        industry,
                        description,
                        user_id: userId // Pass userId for creation
                    })
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || 'Failed to create bot');
                }

                const data = await response.json();
                const createdBotId = data.bot.id;

                // Determine platform node type
                const platformType = platform === 'telegram' ? 'telegramSource' : 'whatsappSource';
                const platformLabel = platform === 'telegram' ? 'Telegram' : 'WhatsApp';

                // Create default AI Flow with PLATFORM → TRIGGER → AI structure
                try {
                    const supabase = createClient();
                    const defaultFlow = {
                        bot_id: createdBotId,
                        name: 'AI Assistant',
                        nodes: {
                            _nodes: [
                                {
                                    id: '0',
                                    type: platformType,
                                    position: { x: 250, y: 0 },
                                    data: { label: platformLabel }
                                },
                                {
                                    id: '1',
                                    type: 'trigger',
                                    position: { x: 250, y: 150 },
                                    data: { label: 'Старт', triggerType: 'any', triggerValue: '' }
                                },
                                {
                                    id: '2',
                                    type: 'ai',
                                    position: { x: 250, y: 300 },
                                    data: {
                                        label: 'AI Ответ',
                                        systemPrompt: description ? `Ты - ассистент для бизнеса "${name}" (${industry}). ${description}` : 'Ты полезный бизнес-ассистент.',
                                        model: 'deepseek-chat',
                                        temperature: 0.7,
                                        useKnowledgeBase: true
                                    }
                                }
                            ],
                            _edges: [
                                {
                                    id: 'e0-1',
                                    source: '0',
                                    target: '1',
                                    type: 'smoothstep',
                                    animated: true
                                },
                                {
                                    id: 'e1-2',
                                    source: '1',
                                    target: '2',
                                    type: 'smoothstep',
                                    animated: true
                                }
                            ]
                        }
                    };

                    const { error: flowError } = await supabase
                        .from('flows')
                        .insert(defaultFlow);

                    if (flowError) {
                        console.error('Flow creation DB error:', flowError);
                    }
                } catch (e) {
                    console.error('Failed to create default flow', e);
                }

                return {
                    success: true,
                    message: `✅ Бот "${name}" для ${platformLabel} создан! Структура: ${platformLabel} → Триггер → AI.`,
                    data: { bot: data.bot, createdBotId: createdBotId }
                };
            }

            case 'update_bot_instructions': {
                const { instructions } = params;
                const supabase = createClient();

                // 1. Get the flow (assuming active flow)
                const { data: flows, error: fetchError } = await supabase
                    .from('flows')
                    .select('*')
                    .eq('bot_id', botId)
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (fetchError || !flows || flows.length === 0) {
                    return { success: false, message: '⚠️ Сценарий не найден. Сначала создайте бота.' };
                }

                const flow = flows[0];
                let nodes = flow.nodes;

                let nodeList: any[] = [];
                if (Array.isArray(nodes)) {
                    nodeList = nodes;
                } else if (nodes && typeof nodes === 'object' && Array.isArray(nodes._nodes)) {
                    nodeList = nodes._nodes;
                } else {
                    return { success: false, message: '⚠️ Неверный формат сценария (nodes).' };
                }

                // Find AI node
                const aiNodeIndex = nodeList.findIndex((n: any) => n.type === 'ai' || n.type === 'aiApi');

                if (aiNodeIndex === -1) {
                    return { success: false, message: '⚠️ В сценарии нет AI-узла. Некуда записать инструкции.' };
                }

                // Update prompt AND Label
                nodeList[aiNodeIndex].data.systemPrompt = instructions;
                const shortLabel = instructions.split('.')[0].substring(0, 20) + '...';
                nodeList[aiNodeIndex].data.label = `AI: ${shortLabel}`;

                // CHECK FOR MISSING EDGES (Self-healing)
                let edges: any[] = [];
                if (nodes && typeof nodes === 'object' && Array.isArray(nodes._edges)) {
                    edges = nodes._edges;
                }

                if (edges.length === 0 && nodeList.length >= 2) {
                    const triggerNode = nodeList.find((n: any) => n.type === 'trigger');
                    const aiNode = nodeList[aiNodeIndex];
                    if (triggerNode && aiNode) {
                        edges.push({
                            id: `e${triggerNode.id}-${aiNode.id}`,
                            source: triggerNode.id,
                            target: aiNode.id,
                            type: 'smoothstep',
                            animated: true
                        });
                    }
                }

                // Prepare update payload
                let newNodes: any = {};
                if (Array.isArray(nodes)) {
                    newNodes = { _nodes: nodeList, _edges: edges };
                } else {
                    newNodes = nodes;
                    newNodes._nodes = nodeList;
                    newNodes._edges = edges;
                }

                // Save back
                const { error: updateError } = await supabase
                    .from('flows')
                    .update({ nodes: newNodes })
                    .eq('id', flow.id);

                if (updateError) throw updateError;

                return {
                    success: true,
                    message: `✅ Инструкции обновлены! Обновил название карточки на "AI: ${shortLabel}" и проверил связи.`
                };
            }

            case 'configure_schedule': {
                const { schedule_type, working_days, shift_work_days, shift_off_days, cycle_start_date, start_time, end_time } = params;

                if (schedule_type === 'shift') {
                    // Shift schedule (2/2, 4/3, etc.)
                    const response = await fetch(`${baseUrl}/api/schedule`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            bot_id: botId,
                            schedule: {
                                schedule_type: 'shift',
                                shift_work_days: shift_work_days || 2,
                                shift_off_days: shift_off_days || 2,
                                cycle_start_date: cycle_start_date || new Date().toISOString().split('T')[0],
                                slot_duration_minutes: 60
                            },
                            hours: [{
                                bot_id: botId,
                                day_of_week: 0,
                                is_working: true,
                                start_time,
                                end_time
                            }]
                        })
                    });

                    if (!response.ok) throw new Error('Failed to update schedule');

                    return {
                        success: true,
                        message: `✅ Сменный график настроен! ${shift_work_days || 2}/${shift_off_days || 2}, время: ${start_time}-${end_time}`,
                        data: { schedule_type: 'shift', shift_work_days, shift_off_days, cycle_start_date }
                    };
                } else {
                    // Weekly schedule (по дням недели)
                    const days = working_days || [1, 2, 3, 4, 5]; // Default Mon-Fri

                    const hours = Array.from({ length: 7 }, (_, i) => ({
                        day_of_week: i,
                        is_working: days.includes(i),
                        start_time: start_time,
                        end_time: end_time,
                        bot_id: botId
                    }));

                    const response = await fetch(`${baseUrl}/api/schedule`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            bot_id: botId,
                            schedule: { schedule_type: 'weekly', slot_duration_minutes: 60 },
                            hours
                        })
                    });

                    if (!response.ok) throw new Error('Failed to update schedule');

                    const daysNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
                    const workingDaysText = days.map((d: number) => daysNames[d]).join(', ');

                    return {
                        success: true,
                        message: `✅ График настроен! Рабочие дни: ${workingDaysText}, время: ${start_time}-${end_time}`,
                        data: { hours }
                    };
                }
            }

            case 'add_service': {
                const { name, duration_minutes, price, currency } = params;
                const currencySymbols: Record<string, string> = {
                    'KZT': '₸', 'RUB': '₽', 'USD': '$', 'EUR': '€', 'UZS': 'сум', 'UAH': '₴'
                };
                const symbol = currencySymbols[currency] || '₸';

                const response = await fetch(`${baseUrl}/api/services`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        bot_id: botId,
                        name,
                        duration_minutes,
                        price: price || 0,
                        currency: currency || 'KZT',
                        is_active: true
                    })
                });

                if (!response.ok) throw new Error('Failed to add service');
                const data = await response.json();

                return {
                    success: true,
                    message: `✅ Услуга "${name}" добавлена! (${duration_minutes} мин${price ? `, ${price}${symbol}` : ''})`,
                    data: data.service
                };
            }

            case 'get_current_settings': {
                const response = await fetch(`${baseUrl}/api/schedule?bot_id=${botId}`);
                if (!response.ok) throw new Error('Failed to fetch settings');
                const data = await response.json();

                const daysNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
                const workingDays = data.hours
                    ?.filter((h: any) => h.is_working)
                    .map((h: any) => daysNames[h.day_of_week])
                    .join(', ') || 'не настроены';

                const servicesText = data.services?.length
                    ? data.services.map((s: any) => `• ${s.name} (${s.duration_minutes} мин)`).join('\n')
                    : 'нет услуг';

                return {
                    success: true,
                    message: `📋 Текущие настройки:\n\n**Рабочие дни:** ${workingDays}\n\n**Услуги:**\n${servicesText}`,
                    data
                };
            }

            case 'add_exception_day': {
                const { date, reason } = params;

                const response = await fetch(`${baseUrl}/api/schedule/exceptions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        bot_id: botId,
                        exception_date: date,
                        reason: reason || 'Выходной'
                    })
                });

                if (!response.ok) throw new Error('Failed to add exception');

                return {
                    success: true,
                    message: `✅ Выходной добавлен: ${date}${reason ? ` (${reason})` : ''}`,
                    data: { date, reason }
                };
            }

            case 'generate_complete_flow': {
                const { description, flowName, platform } = params;
                const supabase = createClient();

                // Determine platform node type
                const platformType = platform === 'telegram' ? 'telegramSource' : 'whatsappSource';
                const platformLabel = platform === 'telegram' ? 'Telegram' : 'WhatsApp';

                // Генерируем детальный промпт для AI на основе описания пользователя
                const apiKey = process.env.DEEPSEEK_API_KEY;
                if (!apiKey) {
                    return { success: false, message: '⚠️ API ключ не настроен' };
                }

                // Сначала просим AI сгенерировать умный системный промпт
                const promptGenResponse = await fetch('https://api.deepseek.com/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: 'deepseek-chat',
                        messages: [
                            {
                                role: 'system',
                                content: `Ты создаешь системный промпт для чат-бота.
На основе описания, создай ДЕТАЛЬНЫЙ промпт который:
1. Определяет роль бота (кто он, как общается)
2. Описывает ПОШАГОВЫЙ сценарий диалога (этап 1, этап 2...)
3. Говорит НЕ переходить к следующему этапу пока не получен ответ
4. Включает примеры фраз для каждого этапа
5. Указывает какую информацию собирать (имя, телефон и т.д.)

Ответь ТОЛЬКО текстом промпта, без markdown, без кавычек.`
                            },
                            { role: 'user', content: `Описание бота: ${description}` }
                        ],
                        temperature: 0.5,
                        max_tokens: 1000
                    })
                });

                if (!promptGenResponse.ok) {
                    console.error('Prompt generation error');
                    return { success: false, message: '⚠️ Ошибка генерации промпта' };
                }

                const promptData = await promptGenResponse.json();
                const generatedPrompt = promptData.choices?.[0]?.message?.content || description;

                // Создаём flow: PLATFORM → TRIGGER → AI
                const flowWithPlatform = {
                    _nodes: [
                        {
                            id: '0',
                            type: platformType,
                            position: { x: 250, y: 0 },
                            data: { label: platformLabel }
                        },
                        {
                            id: '1',
                            type: 'trigger',
                            position: { x: 250, y: 150 },
                            data: {
                                label: 'Старт',
                                triggerType: 'any',
                                triggerValue: ''
                            }
                        },
                        {
                            id: '2',
                            type: 'ai',
                            position: { x: 250, y: 300 },
                            data: {
                                label: 'AI Консультант',
                                systemPrompt: generatedPrompt,
                                model: 'deepseek-chat',
                                temperature: 0.7,
                                useKnowledgeBase: true
                            }
                        }
                    ],
                    _edges: [
                        {
                            id: 'e0-1',
                            source: '0',
                            target: '1',
                            type: 'smoothstep',
                            animated: true
                        },
                        {
                            id: 'e1-2',
                            source: '1',
                            target: '2',
                            type: 'smoothstep',
                            animated: true
                        }
                    ]
                };

                console.log('[generate_complete_flow] Generated prompt:', generatedPrompt.substring(0, 200) + '...');

                // Save to database
                const { data: existingFlows } = await supabase
                    .from('flows')
                    .select('id')
                    .eq('bot_id', botId)
                    .limit(1);

                if (existingFlows && existingFlows.length > 0) {
                    // Update existing flow
                    const { error } = await supabase
                        .from('flows')
                        .update({
                            nodes: flowWithPlatform,
                            name: flowName || 'AI Generated Flow',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', existingFlows[0].id);

                    if (error) throw error;
                } else {
                    // Create new flow
                    const { error } = await supabase
                        .from('flows')
                        .insert({
                            bot_id: botId,
                            name: flowName || 'AI Generated Flow',
                            nodes: flowWithPlatform
                        });

                    if (error) throw error;
                }

                return {
                    success: true,
                    message: `✅ Сценарий создан! Структура: ${platformLabel} → Триггер → AI. Откройте вкладку Flows.`
                };
            }

            default:
                return {
                    success: false,
                    message: `❌ Неизвестное действие: ${actionName}`
                };
        }
    } catch (error: any) {
        console.error(`Action ${actionName} failed:`, error);
        return {
            success: false,
            message: `❌ Ошибка: ${error.message}`
        };
    }
}

/**
 * Format actions for the AI system prompt (OpenAI function calling format)
 */
export function getActionsForPrompt(): string {
    return ARCHITECT_ACTIONS.map(action =>
        `- ${action.name}: ${action.description}\n  Параметры: ${JSON.stringify(action.parameters.properties, null, 2)}`
    ).join('\n\n');
}
