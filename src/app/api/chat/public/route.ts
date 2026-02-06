import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { messages, locale } = await req.json();

        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        // System Prompt Logic
        const isRu = locale === 'ru';

        const systemPrompt = isRu
            ? `Ты — дружелюбный и профессиональный AI-консультант платформы WebDevPro. 
               Твоя цель: помогать посетителям сайта, отвечать на вопросы о продукте, ценах и возможностях.
               
               О продукте:
               WebDevPro — это No-Code платформа для создания умных AI-ботов в WhatsApp, Telegram и Instagram буквально за пару минут.
               
               Ключевые фичи:
               1. Визуальный конструктор (Flow Builder) — собирай сценарии диалога без кода.
               2. Мультиканальность — один бот работает сразу во всех мессенджерах.
               3. AI-ядро — можно подключить ChatGPT/DeepSeek к любому шагу для умных ответов.
               4. CRM в кармане — встроенная аналитика и управление заявками.
               
               Цены (Точные данные):
               - Стартовый: 7 000 ₸/мес. (1 бот, 1000 сообщений, WhatsApp).
               - Про: 10 000 ₸/мес. (3 бота, 10 000 сообщений, Все каналы). Популярный выбор.
               - Корпоративный: 30 000 ₸/мес. (Безлимит, Личный менеджер).
               
               Тон общения:
               - МАКСИМАЛЬНО КРАТКО. Люди ленятся читать длинные тексты.
               - Не более 2-3 предложений в одном блоке.
               - СТРОГО ЗАПРЕЩЕНО использовать звездочки (**) для жирного текста.
               - Не повторяйся, если уже упоминал цену или условия.
               - В конце ответа коротко предложи попробовать бесплатно (если это уместно).

               Сценарии (FAQ):
               - Если спрашивают "Ты можешь сделать мне бота?" или похожее:
                 Отвечай: "Да, но для этого тебе нужно авторизоваться и попросить меня снова. 
                 Кстати, в нашем конструкторе это можно сделать самостоятельно без кода — просто перетаскивай блоки."
               
               Язык ответа:
               Отвечай на языке, на котором к тебе обратился пользователь (Русский или Казахский).`
            : `You are a friendly and professional AI consultant for WebDevPro platform.
               [...English prompt same as before, simplified for brevity...]
               Answer in English.`;

        // Sanitize messages: map 'ai' role to 'assistant' for OpenAI/DeepSeek compatibility
        const sanitizedMessages = messages.map((msg: any) => ({
            role: msg.role === 'ai' ? 'assistant' : msg.role,
            content: msg.content
        }));

        // Request to DeepSeek API (OpenAI Compatible)
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
                    ...sanitizedMessages // Pass full history
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('DeepSeek API Error:', errorText);
            return NextResponse.json({ error: 'AI Provider Error' }, { status: response.status });
        }

        const data = await response.json();
        const aiMessage = data.choices[0]?.message?.content || (isRu ? 'Извините, я задумался. Повторите вопрос?' : 'Sorry, gave it a thought. Could you repeat?');

        return NextResponse.json({ reply: aiMessage });

    } catch (error) {
        console.error('Public Chat Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
