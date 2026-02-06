import { NextRequest, NextResponse } from 'next/server';

/**
 * AI-powered product/service parser
 * Extracts products from any text (price list, menu, etc.)
 */

const PARSE_PROMPT = `
Ты — парсер прайс-листов. Извлеки товары/услуги из текста.

ПРАВИЛА:
1. Найди все товары/услуги с ценами
2. Извлеки название, описание (если есть), цену, длительность (если указана)
3. Цену приводи к числу (убери ₽, руб, р и т.д.)
4. Длительность в минутах (1 час = 60, 2 часа = 120)
5. Если "от" перед ценой — бери минимальную цену

ФОРМАТ ОТВЕТА (строго JSON, без markdown):
{
  "parsed": [
    {
      "name": "Название товара/услуги",
      "description": "Описание если есть",
      "price": 500,
      "duration_minutes": 30
    }
  ],
  "confidence": 0.95
}

Если поле неизвестно — не включай его.
`;

export async function POST(request: NextRequest) {
    try {
        const { content, bot_id } = await request.json();

        if (!content) {
            return NextResponse.json({ error: 'content required' }, { status: 400 });
        }

        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: PARSE_PROMPT },
                    { role: 'user', content: `Распарси этот прайс-лист:\n\n${content}` }
                ],
                temperature: 0.3,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            throw new Error(`AI API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.choices[0]?.message?.content || '{"parsed":[]}';

        try {
            let cleanJson = text.trim();
            // Clean markdown if present
            if (cleanJson.startsWith('```')) {
                cleanJson = cleanJson.replace(/^```json?\s*/, '').replace(/\s*```$/, '');
            }

            const result = JSON.parse(cleanJson);
            return NextResponse.json({
                parsed: result.parsed || [],
                confidence: result.confidence || 0.8
            });

        } catch (parseError) {
            console.error('Parse error:', parseError, 'Raw:', text);
            return NextResponse.json({ parsed: [], error: 'Failed to parse AI response' });
        }

    } catch (error: any) {
        console.error('Parse API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to parse content' },
            { status: 500 }
        );
    }
}
