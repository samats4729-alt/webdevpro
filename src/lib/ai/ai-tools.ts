/**
 * AI Function Calling / Tools System
 * Allows AI to interact with real business APIs
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Create direct Supabase client (not server client with cookies)
// This works outside HTTP request context (WebSocket, etc.)
const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Tool definitions for DeepSeek API
export const AI_TOOLS = [
    {
        type: 'function',
        function: {
            name: 'getServices',
            description: 'Получить список услуг с ценами. Используй когда клиент спрашивает про услуги, цены, что можете предложить.',
            parameters: {
                type: 'object',
                properties: {},
                required: []
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'getAvailableSlots',
            description: 'Получить свободные слоты для записи. Используй когда клиент хочет узнать свободное время или записаться.',
            parameters: {
                type: 'object',
                properties: {
                    date: {
                        type: 'string',
                        description: 'Дата в формате YYYY-MM-DD. Если не указана - ближайшие дни.'
                    },
                    serviceId: {
                        type: 'string',
                        description: 'ID услуги для фильтрации по длительности'
                    }
                },
                required: []
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'bookAppointment',
            description: 'Записать клиента на услугу. Используй когда клиент подтвердил время и услугу.',
            parameters: {
                type: 'object',
                properties: {
                    clientName: {
                        type: 'string',
                        description: 'Имя клиента'
                    },
                    clientPhone: {
                        type: 'string',
                        description: 'Телефон клиента'
                    },
                    dateTime: {
                        type: 'string',
                        description: 'Дата и время записи в формате YYYY-MM-DD HH:MM'
                    },
                    serviceId: {
                        type: 'string',
                        description: 'ID услуги'
                    },
                    serviceName: {
                        type: 'string',
                        description: 'Название услуги (если ID неизвестен)'
                    }
                },
                required: ['clientName', 'dateTime']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'saveLead',
            description: 'Сохранить контакт клиента в базу лидов. Используй когда узнал имя и/или телефон клиента.',
            parameters: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'Имя клиента'
                    },
                    phone: {
                        type: 'string',
                        description: 'Телефон клиента'
                    },
                    notes: {
                        type: 'string',
                        description: 'Заметки о клиенте (марка авто, предпочтения и т.д.)'
                    }
                },
                required: []
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'getSchedule',
            description: 'Получить график работы. Используй когда клиент спрашивает о часах работы.',
            parameters: {
                type: 'object',
                properties: {},
                required: []
            }
        }
    }
];

// Tool executors
export async function executeToolCall(
    toolName: string,
    args: any,
    botId: string,
    leadId?: string | null  // Optional: ID of the current lead from chat context
): Promise<string> {
    try {
        switch (toolName) {
            case 'getServices': {
                console.log('[getServices] Starting - botId:', botId);

                // Get all services, including those where is_active is null (not explicitly set to false)
                const { data: services, error } = await supabase
                    .from('services')
                    .select('id, name, price, duration_minutes, description, currency, is_active')
                    .eq('bot_id', botId);

                console.log('[getServices] Query result:', {
                    count: services?.length || 0,
                    error: error?.message,
                    services: services?.map(s => ({ id: s.id, name: s.name, is_active: s.is_active }))
                });

                if (error) {
                    console.error('[getServices] Database error:', error);
                    return JSON.stringify({ message: 'Ошибка загрузки услуг: ' + error.message });
                }

                if (!services || services.length === 0) {
                    console.log('[getServices] No services found for bot:', botId);
                    return JSON.stringify({ message: 'Услуги пока не настроены. Добавьте услуги в разделе Каталог.' });
                }

                const currencySymbols: Record<string, string> = {
                    'KZT': '₸', 'RUB': '₽', 'USD': '$', 'EUR': '€', 'UZS': 'сум', 'UAH': '₴'
                };

                const result = {
                    services: services.map(s => {
                        const symbol = currencySymbols[s.currency] || '₸';
                        return {
                            id: s.id,
                            name: s.name,
                            price: s.price ? `${s.price.toLocaleString()}${symbol}` : 'Цена по запросу',
                            duration: s.duration_minutes ? `${s.duration_minutes} мин` : null,
                            description: s.description
                        };
                    })
                };

                console.log('[getServices] Returning:', result.services.length, 'services');
                return JSON.stringify(result);
            }

            case 'getAvailableSlots': {
                const { date } = args;

                // Get schedule settings
                const { data: schedule } = await supabase
                    .from('working_schedule')
                    .select('*')
                    .eq('bot_id', botId)
                    .single();

                if (!schedule) {
                    return JSON.stringify({ message: 'График работы не настроен' });
                }

                // Get schedule hours
                const { data: hours } = await supabase
                    .from('working_hours')
                    .select('*')
                    .eq('bot_id', botId);

                // Get existing appointments for the date range
                const startDate = date || new Date().toISOString().split('T')[0];
                const endDate = new Date(new Date(startDate).getTime() + 7 * 24 * 60 * 60 * 1000)
                    .toISOString().split('T')[0];

                const { data: appointments } = await supabase
                    .from('appointments')
                    .select('start_time, end_time')
                    .eq('bot_id', botId)
                    .gte('start_time', startDate)
                    .lte('start_time', endDate)
                    .in('status', ['pending', 'confirmed']);

                // Generate available slots
                const slots: { date: string; times: string[] }[] = [];

                for (let i = 0; i < 7; i++) {
                    const checkDate = new Date(startDate);
                    checkDate.setDate(checkDate.getDate() + i);
                    const dayOfWeek = checkDate.getDay(); // 0=Sunday, 1=Monday, etc.

                    // Find hours for this day - compare as number
                    const dayHours = hours?.find(h => h.day_of_week === dayOfWeek);

                    if (dayHours && dayHours.is_working) {
                        const dateStr = checkDate.toISOString().split('T')[0];
                        const daySlots: string[] = [];

                        // Generate hourly slots
                        const startHour = parseInt(dayHours.start_time.split(':')[0]);
                        const endHour = parseInt(dayHours.end_time.split(':')[0]);

                        for (let hour = startHour; hour < endHour; hour++) {
                            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                            const fullDateTime = `${dateStr}T${timeStr}`;

                            // Check if slot is taken
                            const isTaken = appointments?.some(a => {
                                const aptTime = new Date(a.start_time);
                                return aptTime.toISOString().startsWith(fullDateTime);
                            });

                            if (!isTaken) {
                                daySlots.push(timeStr);
                            }
                        }

                        if (daySlots.length > 0) {
                            slots.push({
                                date: dateStr,
                                times: daySlots
                            });
                        }
                    }
                }

                return JSON.stringify({ slots });
            }

            case 'bookAppointment': {
                const { clientName, clientPhone, dateTime, serviceId, serviceName } = args;

                // Get bot's timezone from schedule settings
                let timezone = 'Asia/Almaty'; // Default UTC+5
                const { data: scheduleSettings } = await supabase
                    .from('working_schedule')
                    .select('timezone')
                    .eq('bot_id', botId)
                    .single();
                if (scheduleSettings?.timezone) {
                    timezone = scheduleSettings.timezone;
                }

                // Parse dateTime - AI sends it in the format "YYYY-MM-DD HH:MM"
                // We store it as-is in local time (the time user said)
                let [datePart, timePart] = ['', ''];

                if (dateTime.includes('T')) {
                    [datePart, timePart] = dateTime.split('T');
                    timePart = timePart.split(':').slice(0, 2).join(':');
                } else if (dateTime.includes(' ')) {
                    [datePart, timePart] = dateTime.split(' ');
                } else {
                    datePart = dateTime;
                    timePart = '12:00';
                }

                // Create date as local time - don't adjust timezone
                // Store the exact time the user requested
                const startTime = new Date(`${datePart}T${timePart}:00`);

                // Get or find service
                let service = null;
                if (serviceId) {
                    const { data } = await supabase
                        .from('services')
                        .select('*')
                        .eq('id', serviceId)
                        .single();
                    service = data;
                } else if (serviceName) {
                    const { data } = await supabase
                        .from('services')
                        .select('*')
                        .eq('bot_id', botId)
                        .ilike('name', `%${serviceName}%`)
                        .limit(1)
                        .single();
                    service = data;
                }

                const duration = service?.duration_minutes || 60;
                const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

                // Create appointment
                const { data: appointment, error } = await supabase
                    .from('appointments')
                    .insert({
                        bot_id: botId,
                        client_name: clientName,
                        client_phone: clientPhone || null,
                        service_id: service?.id || null,
                        start_time: startTime.toISOString(),
                        end_time: endTime.toISOString(),
                        status: 'pending',
                        notes: `Записано через AI бота. Услуга: ${service?.name || serviceName || 'не указана'}`
                    })
                    .select()
                    .single();

                if (error) {
                    console.error('Booking error:', error);
                    return JSON.stringify({ success: false, message: 'Ошибка при записи' });
                }

                // Format response - show the time user requested (datePart, timePart)
                const displayDate = datePart.split('-').reverse().join('.');

                return JSON.stringify({
                    success: true,
                    message: `Записано! ${clientName} на ${displayDate} в ${timePart}`,
                    appointmentId: appointment.id
                });
            }

            case 'saveLead': {
                const { name, phone, notes } = args;

                // Priority 1: If we have a leadId from chat context, update that lead
                if (leadId) {
                    await supabase
                        .from('leads')
                        .update({
                            name: name || undefined,
                            phone: phone || undefined,  // Update with real phone if provided
                            notes: notes ? `${notes}` : undefined,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', leadId);

                    console.log(`[saveLead] Updated existing lead ${leadId} with phone: ${phone}`);
                    return JSON.stringify({ success: true, leadId, updated: true });
                }

                // Priority 2: Check if lead exists by phone
                let existingLeadId = null;
                if (phone) {
                    const { data: existing } = await supabase
                        .from('leads')
                        .select('id')
                        .eq('bot_id', botId)
                        .eq('phone', phone)
                        .single();

                    if (existing) {
                        // Update existing
                        await supabase
                            .from('leads')
                            .update({
                                name: name || undefined,
                                notes: notes ? `${notes}` : undefined,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', existing.id);
                        existingLeadId = existing.id;
                    }
                }

                if (!existingLeadId) {
                    // Create new lead
                    const { data: newLead } = await supabase
                        .from('leads')
                        .insert({
                            bot_id: botId,
                            name: name || 'Неизвестный',
                            phone: phone || null,
                            source: 'ai_chat',
                            notes: notes || null,
                            status: 'new'
                        })
                        .select()
                        .single();
                    existingLeadId = newLead?.id;
                }

                return JSON.stringify({ success: true, leadId: existingLeadId });
            }

            case 'getSchedule': {
                const { data: schedule } = await supabase
                    .from('working_schedule')
                    .select('*')
                    .eq('bot_id', botId)
                    .single();

                if (!schedule) {
                    return JSON.stringify({ message: 'График работы не настроен' });
                }

                const { data: hours } = await supabase
                    .from('working_hours')
                    .select('*')
                    .eq('bot_id', botId)
                    .order('day_of_week');

                // day_of_week is 0-6 (Sunday-Saturday)
                const dayLabels: Record<number, string> = {
                    0: 'Воскресенье',
                    1: 'Понедельник',
                    2: 'Вторник',
                    3: 'Среда',
                    4: 'Четверг',
                    5: 'Пятница',
                    6: 'Суббота'
                };

                const scheduleText = hours?.map(h => {
                    const dayName = dayLabels[h.day_of_week] || `День ${h.day_of_week}`;
                    if (!h.is_working) return `${dayName}: Выходной`;
                    return `${dayName}: ${h.start_time} - ${h.end_time}`;
                }).join('\n');

                return JSON.stringify({
                    timezone: schedule.timezone,
                    schedule: scheduleText
                });
            }

            default:
                return JSON.stringify({ error: `Unknown tool: ${toolName}` });
        }
    } catch (error: any) {
        console.error(`Tool ${toolName} error:`, error);
        return JSON.stringify({ error: error.message });
    }
}
