// Template data for blueprints - Russian language, WhatsApp-focused

export interface TemplateData {
    nodes: any[];
    edges: any[];
}

export const TEMPLATES: Record<string, TemplateData> = {
    'ai-consultant': {
        nodes: [
            { id: '0', type: 'whatsappSource', position: { x: 250, y: 0 }, data: { label: 'WhatsApp' } },
            { id: '1', type: 'trigger', position: { x: 250, y: 120 }, data: { label: 'Старт', triggerType: 'any', triggerValue: '' } },
            { id: '2', type: 'ai', position: { x: 250, y: 280 }, data: { label: 'AI Консультант', systemPrompt: 'Ты умный AI-консультант компании. Отвечай на вопросы клиентов вежливо и профессионально. Используй базу знаний для точных ответов. Если не знаешь ответа - предложи связаться с оператором.', model: 'deepseek-chat', useKnowledgeBase: true } }
        ],
        edges: [
            { id: 'e0-1', source: '0', target: '1', type: 'smoothstep', animated: true },
            { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true }
        ]
    },
    'beauty-salon': {
        nodes: [
            { id: '0', type: 'whatsappSource', position: { x: 250, y: 0 }, data: { label: 'WhatsApp' } },
            { id: '1', type: 'trigger', position: { x: 250, y: 120 }, data: { label: 'Старт', triggerType: 'any', triggerValue: '' } },
            { id: '2', type: 'message', position: { x: 250, y: 240 }, data: { label: 'Приветствие', message: '👋 Добро пожаловать в наш салон красоты!\n\nМы рады вас видеть. Чем можем помочь?' } },
            { id: '3', type: 'buttons', position: { x: 250, y: 400 }, data: { label: 'Меню', menuText: 'Выберите действие:', buttons: [{ text: '📅 Записаться' }, { text: '💅 Наши услуги' }, { text: '💰 Прайс-лист' }, { text: '📍 Как добраться' }] } },
            { id: '4', type: 'ai', position: { x: -50, y: 600 }, data: { label: 'AI Запись', systemPrompt: 'Ты ассистент салона красоты. Помоги клиенту записаться на услугу. Спроси какую услугу хочет, на какую дату и время. Будь вежлив и профессионален.', model: 'deepseek-chat', useKnowledgeBase: true } },
            { id: '5', type: 'message', position: { x: 250, y: 600 }, data: { label: 'Услуги', message: '💅 Наши услуги:\n\n• Стрижка женская — от 5000₸\n• Стрижка мужская — от 3000₸\n• Маникюр — 4000₸\n• Педикюр — 5000₸\n• Окрашивание — от 15000₸\n• Укладка — от 3000₸\n\nНапишите название услуги для записи!' } },
            { id: '6', type: 'message', position: { x: 550, y: 600 }, data: { label: 'Прайс', message: '💰 Прайс-лист:\n\n📋 Полный прайс: [ссылка]\n\nИли напишите название услуги — я подскажу цену!' } },
            { id: '7', type: 'message', position: { x: 850, y: 600 }, data: { label: 'Адрес', message: '📍 Наш адрес:\nул. Примерная, 123\n\n🕐 Режим работы:\nПн-Сб: 10:00 - 20:00\nВс: выходной\n\n📞 Телефон: +7 (777) 123-45-67' } }
        ],
        edges: [
            { id: 'e0-1', source: '0', target: '1', type: 'smoothstep', animated: true },
            { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true },
            { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', animated: true },
            { id: 'e3-4', source: '3', target: '4', sourceHandle: 'btn-0', type: 'smoothstep', label: 'Записаться' },
            { id: 'e3-5', source: '3', target: '5', sourceHandle: 'btn-1', type: 'smoothstep', label: 'Услуги' },
            { id: 'e3-6', source: '3', target: '6', sourceHandle: 'btn-2', type: 'smoothstep', label: 'Прайс' },
            { id: 'e3-7', source: '3', target: '7', sourceHandle: 'btn-3', type: 'smoothstep', label: 'Адрес' }
        ]
    },
    'customer-support': {
        nodes: [
            { id: '0', type: 'whatsappSource', position: { x: 250, y: 0 }, data: { label: 'WhatsApp' } },
            { id: '1', type: 'trigger', position: { x: 250, y: 120 }, data: { label: 'Старт', triggerType: 'any', triggerValue: '' } },
            { id: '2', type: 'message', position: { x: 250, y: 240 }, data: { label: 'Приветствие', message: '👋 Здравствуйте!\n\nДобро пожаловать в службу поддержки. Чем можем помочь?' } },
            { id: '3', type: 'buttons', position: { x: 250, y: 400 }, data: { label: 'Меню', menuText: 'Выберите тему обращения:', buttons: [{ text: '❓ Частые вопросы' }, { text: '🐞 Сообщить о проблеме' }, { text: '👤 Связаться с оператором' }] } },
            { id: '4', type: 'message', position: { x: -50, y: 600 }, data: { label: 'FAQ', message: '❓ Частые вопросы:\n\n1️⃣ Как изменить пароль?\n→ Настройки → Безопасность → Сменить пароль\n\n2️⃣ Где мой заказ?\n→ Напишите номер заказа, и я проверю статус\n\n3️⃣ Как связаться с поддержкой?\n→ Нажмите "Связаться с оператором"' } },
            { id: '5', type: 'ai', position: { x: 250, y: 600 }, data: { label: 'AI Поддержка', systemPrompt: 'Ты агент технической поддержки. Выясни проблему клиента, задай уточняющие вопросы, попробуй помочь решить проблему. Если не можешь - предложи связаться с оператором.', model: 'deepseek-chat', useKnowledgeBase: true } },
            { id: '6', type: 'message', position: { x: 550, y: 600 }, data: { label: 'Оператор', message: '👤 Переключаю на оператора...\n\nОжидайте, пожалуйста. Среднее время ответа: 5 минут.\n\nРежим работы операторов:\nПн-Пт: 9:00 - 18:00' } }
        ],
        edges: [
            { id: 'e0-1', source: '0', target: '1', type: 'smoothstep', animated: true },
            { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true },
            { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', animated: true },
            { id: 'e3-4', source: '3', target: '4', sourceHandle: 'btn-0', type: 'smoothstep', label: 'FAQ' },
            { id: 'e3-5', source: '3', target: '5', sourceHandle: 'btn-1', type: 'smoothstep', label: 'Проблема' },
            { id: 'e3-6', source: '3', target: '6', sourceHandle: 'btn-2', type: 'smoothstep', label: 'Оператор' }
        ]
    },
    'appointment-booking': {
        nodes: [
            { id: '0', type: 'whatsappSource', position: { x: 250, y: 0 }, data: { label: 'WhatsApp' } },
            { id: '1', type: 'trigger', position: { x: 250, y: 120 }, data: { label: 'Старт', triggerType: 'any', triggerValue: '' } },
            { id: '2', type: 'message', position: { x: 250, y: 240 }, data: { label: 'Приветствие', message: '👋 Здравствуйте!\n\nГотовы записать вас на приём. Что вы хотите сделать?' } },
            { id: '3', type: 'buttons', position: { x: 250, y: 400 }, data: { label: 'Меню', menuText: 'Выберите действие:', buttons: [{ text: '📅 Записаться' }, { text: '🔄 Перенести запись' }, { text: '❌ Отменить запись' }] } },
            { id: '4', type: 'ai', position: { x: -50, y: 600 }, data: { label: 'AI Запись', systemPrompt: 'Ты ассистент по записи. Помоги клиенту выбрать удобное время. Спроси на какую дату и время хотят записаться. Предложи доступные слоты. Подтверди запись.', model: 'deepseek-chat', useKnowledgeBase: true } },
            { id: '5', type: 'ai', position: { x: 250, y: 600 }, data: { label: 'AI Перенос', systemPrompt: 'Клиент хочет перенести запись. Спроси номер записи или дату существующей записи, затем предложи новые варианты времени.', model: 'deepseek-chat', useKnowledgeBase: true } },
            { id: '6', type: 'message', position: { x: 550, y: 600 }, data: { label: 'Отмена', message: '❌ Для отмены записи напишите:\n\n• Номер записи\n• Или дату и время записи\n\nПример: "Отмена 15 февраля 14:00"' } }
        ],
        edges: [
            { id: 'e0-1', source: '0', target: '1', type: 'smoothstep', animated: true },
            { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true },
            { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', animated: true },
            { id: 'e3-4', source: '3', target: '4', sourceHandle: 'btn-0', type: 'smoothstep', label: 'Записаться' },
            { id: 'e3-5', source: '3', target: '5', sourceHandle: 'btn-1', type: 'smoothstep', label: 'Перенести' },
            { id: 'e3-6', source: '3', target: '6', sourceHandle: 'btn-2', type: 'smoothstep', label: 'Отменить' }
        ]
    },
    'lead-quantification': {
        nodes: [
            { id: '0', type: 'whatsappSource', position: { x: 250, y: 0 }, data: { label: 'WhatsApp' } },
            { id: '1', type: 'trigger', position: { x: 250, y: 120 }, data: { label: 'Старт', triggerType: 'any', triggerValue: '' } },
            { id: '2', type: 'message', position: { x: 250, y: 240 }, data: { label: 'Приветствие', message: '👋 Здравствуйте!\n\nСпасибо за интерес к нашим услугам. Давайте подберём оптимальное решение для вас.' } },
            { id: '3', type: 'buttons', position: { x: 250, y: 400 }, data: { label: 'Бюджет', menuText: 'Какой у вас примерный бюджет?', buttons: [{ text: '💰 До 500 000 ₸' }, { text: '💎 500 000 - 2 000 000 ₸' }, { text: '🏆 Более 2 000 000 ₸' }] } },
            { id: '4', type: 'message', position: { x: -50, y: 600 }, data: { label: 'Стандарт', message: '👍 Отличный выбор!\n\nДля этого бюджета рекомендуем наш стандартный пакет.\n\n📩 Оставьте ваш номер телефона, и менеджер свяжется с вами в течение часа.' } },
            { id: '5', type: 'ai', position: { x: 250, y: 600 }, data: { label: 'AI Консультант', systemPrompt: 'Клиент заинтересован в среднем ценовом сегменте. Выясни его потребности, спроси контактные данные (имя, телефон, email). Предложи назначить звонок с менеджером.', model: 'deepseek-chat', useKnowledgeBase: true } },
            { id: '6', type: 'message', position: { x: 550, y: 600 }, data: { label: 'VIP', message: '🏆 Благодарим за интерес к премиум-решениям!\n\nНаш старший менеджер свяжется с вами в течение 15 минут для персональной консультации.\n\n📞 Укажите удобный номер телефона.' } }
        ],
        edges: [
            { id: 'e0-1', source: '0', target: '1', type: 'smoothstep', animated: true },
            { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true },
            { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', animated: true },
            { id: 'e3-4', source: '3', target: '4', sourceHandle: 'btn-0', type: 'smoothstep', label: 'Стандарт' },
            { id: 'e3-5', source: '3', target: '5', sourceHandle: 'btn-1', type: 'smoothstep', label: 'Средний' },
            { id: 'e3-6', source: '3', target: '6', sourceHandle: 'btn-2', type: 'smoothstep', label: 'VIP' }
        ]
    },
    'ecommerce-assistant': {
        nodes: [
            { id: '0', type: 'whatsappSource', position: { x: 250, y: 0 }, data: { label: 'WhatsApp' } },
            { id: '1', type: 'trigger', position: { x: 250, y: 120 }, data: { label: 'Старт', triggerType: 'any', triggerValue: '' } },
            { id: '2', type: 'message', position: { x: 250, y: 240 }, data: { label: 'Приветствие', message: '👋 Добро пожаловать в наш магазин!\n\n🛍️ У нас вы найдёте лучшие товары по отличным ценам. Чем могу помочь?' } },
            { id: '3', type: 'buttons', position: { x: 250, y: 400 }, data: { label: 'Меню', menuText: 'Выберите раздел:', buttons: [{ text: '📦 Статус заказа' }, { text: '🔥 Новинки' }, { text: '🏷️ Акции' }, { text: '📞 Поддержка' }] } },
            { id: '4', type: 'ai', position: { x: -50, y: 600 }, data: { label: 'AI Заказы', systemPrompt: 'Помоги клиенту узнать статус заказа. Спроси номер заказа, затем сообщи примерный статус. Если не знаешь точно - предложи связаться с поддержкой.', model: 'deepseek-chat', useKnowledgeBase: true } },
            { id: '5', type: 'message', position: { x: 250, y: 600 }, data: { label: 'Новинки', message: '🔥 Новинки этой недели:\n\n• Товар 1 — 15 000 ₸\n• Товар 2 — 25 000 ₸\n• Товар 3 — 10 000 ₸\n\n📲 Отправьте название товара для заказа!' } },
            { id: '6', type: 'message', position: { x: 550, y: 600 }, data: { label: 'Акции', message: '🏷️ Текущие акции:\n\n🎉 -20% на весь ассортимент по промокоду SALE20\n🎁 Бесплатная доставка от 20 000 ₸\n\nАкции действуют до конца месяца!' } },
            { id: '7', type: 'message', position: { x: 850, y: 600 }, data: { label: 'Поддержка', message: '📞 Поддержка:\n\n☎️ +7 (777) 123-45-67\n📧 support@example.com\n\n🕐 Время работы:\nПн-Пт: 9:00 - 18:00' } }
        ],
        edges: [
            { id: 'e0-1', source: '0', target: '1', type: 'smoothstep', animated: true },
            { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true },
            { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', animated: true },
            { id: 'e3-4', source: '3', target: '4', sourceHandle: 'btn-0', type: 'smoothstep', label: 'Заказ' },
            { id: 'e3-5', source: '3', target: '5', sourceHandle: 'btn-1', type: 'smoothstep', label: 'Новинки' },
            { id: 'e3-6', source: '3', target: '6', sourceHandle: 'btn-2', type: 'smoothstep', label: 'Акции' },
            { id: 'e3-7', source: '3', target: '7', sourceHandle: 'btn-3', type: 'smoothstep', label: 'Поддержка' }
        ]
    }
};
