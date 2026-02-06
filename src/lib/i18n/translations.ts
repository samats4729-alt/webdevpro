


export type Language = 'ru' | 'en';

export interface Translations {
    // Sidebar
    sidebar: {
        main: string;
        overview: string;
        liveChat: string;
        botManagement: string;
        myBots: string;
        flows: string;
        blueprints: string;
        channels: string;
        aiEngine: string;
        knowledgeBase: string;
        prompts: string;
        createWithAI: string;
        analytics: string;
        leads: string;
        catalog: string;
        appointments: string;
        broadcasts: string;
        aiStats: string;
        settings: string;
        billing: string;
        integrations: string;
        help: string;
        search: string;
        logout: string;
    };
    // Landing Page
    landing: {
        login: string;
        startFreeTrial: string;
        hero: {
            badge: string;
            title: string;
            subtitle: string;
            startTrial: string;
            viewDemo: string;
            trialNote: string;
        };
        features: {
            title: string;
            multiChannel: {
                title: string;
                description: string;
            };
            flowBuilder: {
                title: string;
                description: string;
            };
            analytics: {
                title: string;
                description: string;
            };
        };
        pricing: {
            title: string;
            subtitle: string;
            month: string;
            included: string;
            starter: {
                name: string;
                price: string;
                features: string[];
            };
            pro: {
                name: string;
                price: string;
                features: string[];
                popular: string;
            };
            enterprise: {
                name: string;
                price: string;
                features: string[];
            };
            getStarted: string;
        };
        cta: {
            title: string;
            subtitle: string;
            button: string;
        };
        footer: {
            rights: string;
        };
    };
    // Auth
    auth: {
        common: {
            email: string;
            password: string;
            orContinue: string;
            google: string;
        };
        login: {
            title: string;
            subtitle: string;
            rememberMe: string;
            forgotPassword: string;
            submit: string;
            submitting: string;
            noAccount: string;
            signup: string;
        };
        signup: {
            title: string;
            subtitle: string;
            fullName: string;
            passwordHint: string;
            agree: string;
            terms: string;
            and: string;
            privacy: string;
            submit: string;
            submitting: string;
            hasAccount: string;
            signin: string;
        };

        forgotPassword: {
            title: string;
            subtitle: string;
            submit: string;
            submitting: string;
            backToLogin: string;
            checkEmail: string;
            checkEmailDescription: string;
        };
        updatePassword: {
            title: string;
            subtitle: string;
            passwordLabel: string;
            placeholder: string;
            submit: string;
            submitting: string;
            success: string;
            successDescription: string;
            backToLogin: string;
        };
    };
    // Common
    common: {
        save: string;
        saving: string;
        saved: string;
        cancel: string;
        delete: string;
        confirm: string;
        loading: string;
        error: string;
        success: string;
    };
    // Dashboard
    dashboard: {
        title: string;
        subtitle: string;
        stats: {
            messages: string;
            leads: string;
            automation: string;
            tokens: string;
        };
        recentActivity: string;
        noActivity: string;
    };
    // Flows
    flows: {
        title: string;
        subtitle: string;
        newFlow: string;
        nodes: string;
        edited: string;
        delete: string;
    };
    // Billing
    billing: {
        title: string;
        subtitle: string;
        managePayment: string;
        paymentMethod: string;
        plans: {
            starter: string;
            pro: string;
            enterprise: string;
            current: string;
            upgrade: string;
            contact: string;
            popular: string;
        };
    };
    // Live Chat
    liveChat: {
        title: string;
        subtitle: string;
        search: string;
        today: string;
        typeMessage: string;
        enterToSend: string;
        takeOver: string;
    };
    // Channels
    channels: {
        title: string;
        subtitle: string;
        notConnected: string;
        connect: string;
        connected: string;
    };
    // AI Persona
    aiPersona: {
        title: string;
        subtitle: string;
        systemPrompt: string;
        systemPromptPlaceholder: string;
        save: string;
        testSandbox: string;
        preview: string;
    };
    // Integrations
    integrations: {
        title: string;
        subtitle: string;
        connect: string;
        connected: string;
        notConnected: string;
        configure: string;
        apiKeys: string;
        copy: string;
        revoke: string;
        warning: string;
        copySuccess: string;
    };
    // Bots
    bots: {
        myBots: string;
        newBot: string;
        createBot: string;
        deleteBot: string;
        confirmDelete: string;
        noBots: string;
        online: string;
        offline: string;
        settings: string;
        botName: string;
        welcomeMessage: string;
        autoReply: string;
        autoReplyEnabled: string;
        autoReplyMessage: string;
        autoReplyDescription: string;
        saveSettings: string;
    };
    // WhatsApp
    whatsapp: {
        connect: string;
        connected: string;
        disconnect: string;
        generateQR: string;
        scanQR: string;
        waitingScan: string;
        initializing: string;
        connectedAs: string;
    };
}

export const translations: Record<Language, Translations> = {
    ru: {
        sidebar: {
            main: 'Главная',
            overview: 'Обзор',
            liveChat: 'Чат',
            botManagement: 'Управление ботами',
            myBots: 'Мои боты',
            flows: 'Сценарии',
            blueprints: 'Шаблоны',
            channels: 'Каналы',
            aiEngine: 'AI Движок',
            knowledgeBase: 'База знаний',
            prompts: 'Промпты и персона',
            createWithAI: 'Создать с ИИ',
            analytics: 'Аналитика и CRM',
            leads: 'Лиды / Клиенты',
            catalog: 'Каталог',
            appointments: 'Записи',
            broadcasts: 'Рассылки',
            aiStats: 'AI Статистика',
            settings: 'Настройки',
            billing: 'Тарифы',
            integrations: 'Интеграции',
            help: 'Помощь',
            search: 'Поиск...',
            logout: 'Выйти',
        },
        landing: {
            login: 'Войти',
            startFreeTrial: 'Начать',
            hero: {
                badge: 'AI-Powered Messaging',
                title: 'Автоматизируйте поддержку клиентов',
                subtitle: 'Создавайте AI-ассистентов для WhatsApp, Telegram и Instagram за минуты. Без кода. Масштабируйте сервис 24/7.',
                startTrial: 'Начать',
                viewDemo: 'Смотреть демо',
                trialNote: '',
            },
            features: {
                title: 'Почему выбирают WebDevPro?',
                multiChannel: {
                    title: 'Мультиканальность',
                    description: 'Подключите WhatsApp, Telegram и Instagram в одной панели.',
                },
                flowBuilder: {
                    title: 'No-Code Конструктор',
                    description: 'Визуальный редактор для сложных сценариев диалога.',
                },
                analytics: {
                    title: 'Аналитика в реальном времени',
                    description: 'Отслеживайте эффективность, лидов и использование токенов.',
                },
            },
            pricing: {
                title: 'Простые и прозрачные тарифы',
                subtitle: 'Выберите план, который подходит вашему бизнесу',
                month: '/мес',
                included: 'Включено',
                starter: {
                    name: 'Стартовый',
                    price: '7 000 ₸',
                    features: ['1 AI Бот', '1,000 Сообщений/мес', 'Только WhatsApp', 'Email Поддержка'],
                },
                pro: {
                    name: 'Про',
                    price: '10 000 ₸',
                    features: ['3 AI Бота', '10,000 Сообщений/мес', 'Все каналы', 'Приоритетная поддержка', 'CRM Интеграция'],
                    popular: 'ПОПУЛЯРНЫЙ',
                },
                enterprise: {
                    name: 'Корпоративный',
                    price: '30 000 ₸',
                    features: ['Безлимит ботов', 'Безлимит сообщений', 'Кастомное обучение', 'Личный менеджер', 'API Доступ'],
                },
                getStarted: 'Начать сейчас',
            },
            cta: {
                title: 'Готовы трансформировать поддержку?',
                subtitle: 'Присоединяйтесь к сотням бизнесов, автоматизирующих общение.',
                button: 'Начать сейчас',
            },
            footer: {
                rights: '© 2026 WebDevPro AI. Все права защищены.',
            },
        },
        auth: {
            common: {
                email: 'Email',
                password: 'Пароль',
                orContinue: 'Или через',
                google: 'Google',
            },
            login: {
                title: 'С возвращением',
                subtitle: 'Войдите в аккаунт, чтобы продолжить',
                rememberMe: 'Запомнить меня',
                forgotPassword: 'Забыли пароль?',
                submit: 'Войти',
                submitting: 'Вход...',
                noAccount: 'Нет аккаунта?',
                signup: 'Регистрация',
            },
            signup: {
                title: 'Начать бесплатно',
                subtitle: 'Создайте аккаунт за минуту. Карта не требуется.',
                fullName: 'Полное имя',
                passwordHint: 'Минимум 8 символов',
                agree: 'Я согласен с',
                terms: 'Условиями использования',
                and: 'и',
                privacy: 'Политикой конфиденциальности',
                submit: 'Создать аккаунт',
                submitting: 'Регистрация...',
                hasAccount: 'Уже есть аккаунт?',
                signin: 'Войти',
            },
            forgotPassword: {
                title: 'Восстановление пароля',
                subtitle: 'Введите ваш email, и мы отправим инструкции по сбросу пароля.',
                submit: 'Отправить',
                submitting: 'Отправка...',
                backToLogin: 'Вернуться ко входу',
                checkEmail: 'Проверьте ваш email',
                checkEmailDescription: 'Мы отправили ссылку для сброса пароля на',
            },
            updatePassword: {
                title: 'Новый пароль',
                subtitle: 'Придумайте новый надежный пароль для вашего аккаунта.',
                passwordLabel: 'Новый пароль',
                placeholder: 'Минимум 8 символов',
                submit: 'Обновить пароль',
                submitting: 'Обновление...',
                success: 'Пароль успешно обновлен',
                successDescription: 'Теперь вы можете войти с новым паролем.',
                backToLogin: 'Перейти ко входу',
            },
        },
        common: {
            save: 'Сохранить',
            saving: 'Сохранение...',
            saved: 'Сохранено!',
            cancel: 'Отмена',
            delete: 'Удалить',
            confirm: 'Подтвердить',
            loading: 'Загрузка...',
            error: 'Ошибка',
            success: 'Успешно',
        },
        dashboard: {
            title: 'Обзор',
            subtitle: 'Добро пожаловать! Вот что происходит с вашими ботами.',
            stats: {
                messages: 'Сообщения',
                leads: 'Активные лиды',
                automation: 'Автоматизация',
                tokens: 'AI Токены',
            },
            recentActivity: 'Недавняя активность',
            noActivity: 'Активность ботов появится здесь...',
        },
        flows: {
            title: 'Сценарии',
            subtitle: 'Управляйте диалогами для всех ваших ботов.',
            newFlow: 'Новый сценарий',
            nodes: 'узлов',
            edited: 'Изменено',
            delete: 'Удалить',
        },
        billing: {
            title: 'Тарифы и Планы',
            subtitle: 'Выберите план, который подходит вашему бизнесу.',
            managePayment: 'Управление оплатой',
            paymentMethod: 'Способ оплаты',
            plans: {
                starter: 'Стартовый',
                pro: 'Про',
                enterprise: 'Корпоративный',
                current: 'Текущий план',
                upgrade: 'Перейти на Pro',
                contact: 'Связаться',
                popular: 'ПОПУЛЯРНЫЙ',
            },
        },
        liveChat: {
            title: 'Чат',
            subtitle: 'Общайтесь с вашими клиентами в реальном времени.',
            search: 'Поиск чатов...',
            today: 'Сегодня',
            typeMessage: 'Введите сообщение...',
            enterToSend: 'Enter чтобы отправить',
            takeOver: 'Перехватить диалог',
        },
        channels: {
            title: 'Каналы',
            subtitle: 'Подключите AI к вашим любимым мессенджерам.',
            notConnected: 'Не подключено',
            connect: 'Подключить',
            connected: 'Подключено',
        },
        aiPersona: {
            title: 'AI Персона',
            subtitle: 'Настройте, как ваш бот говорит и ведет себя.',
            systemPrompt: 'Системный Промпт',
            systemPromptPlaceholder: 'Вы полезный ассистент поддержки для [Название Компании]. Ваш тон профессиональный, дружелюбный и краткий...',
            save: 'Сохранить конфигурацию',
            testSandbox: 'Тестовая песочница',
            preview: 'Предпросмотр чата появится здесь',
        },
        integrations: {
            title: 'Интеграции и API',
            subtitle: 'Подключите WebDevPro к вашим инструментам.',
            connect: 'Подключить',
            connected: 'Подключено',
            notConnected: 'Не подключено',
            configure: 'Настроить',
            apiKeys: 'API Ключи',
            copy: 'Копировать',
            revoke: 'Отозвать',
            warning: 'Никогда не делитесь вашими API ключами.',
            copySuccess: 'Скопировано!',
        },
        bots: {
            myBots: 'Мои боты',
            newBot: 'Новый бот',
            createBot: 'Создать бота',
            deleteBot: 'Удалить бота',
            confirmDelete: 'Удалить бота? Это действие нельзя отменить.',
            noBots: 'Нет ботов. Создайте первого!',
            online: 'ОНЛАЙН',
            offline: 'ОФЛАЙН',
            settings: 'Настройки',
            botName: 'Название бота',
            welcomeMessage: 'Приветственное сообщение',
            autoReply: 'Автоответ',
            autoReplyEnabled: 'Автоответ включён',
            autoReplyMessage: 'Текст автоответа',
            autoReplyDescription: 'Когда включено, бот автоматически отвечает на все входящие сообщения.',
            saveSettings: 'Сохранить настройки',
        },
        whatsapp: {
            connect: 'Подключить WhatsApp',
            connected: 'WhatsApp подключён',
            disconnect: 'Отключить',
            generateQR: 'Сгенерировать QR код',
            scanQR: 'Отсканируйте QR код телефоном',
            waitingScan: 'Ожидание сканирования...',
            initializing: 'Инициализация...',
            connectedAs: 'Подключён как',
        },
    },
    en: {
        sidebar: {
            main: 'Main',
            overview: 'Overview',
            liveChat: 'Live Chat',
            botManagement: 'Bot Management',
            myBots: 'My Bots',
            flows: 'Flows',
            blueprints: 'Blueprints',
            channels: 'Channels',
            aiEngine: 'AI Engine',
            knowledgeBase: 'Knowledge Base',
            prompts: 'Prompts & Persona',
            createWithAI: 'Create with AI',
            analytics: 'Analytics & CRM',
            leads: 'Leads / Customers',
            catalog: 'Catalog',
            appointments: 'Appointments',
            broadcasts: 'Broadcasts',
            aiStats: 'AI Statistics',
            settings: 'Settings',
            billing: 'Billing',
            integrations: 'Integrations',
            help: 'Help & Support',
            search: 'Search...',
            logout: 'Logout',
        },
        landing: {
            login: 'Login',
            startFreeTrial: 'Get Started',
            hero: {
                badge: 'AI-Powered Messaging',
                title: 'Automate Your Customer Support',
                subtitle: 'Create AI assistants for WhatsApp, Telegram, and Instagram in minutes. No coding required. Scale your customer service 24/7.',
                startTrial: 'Get Started',
                viewDemo: 'View Demo',
                trialNote: '',
            },
            features: {
                title: 'Why Choose WebDevPro?',
                multiChannel: {
                    title: 'Multi-Channel Support',
                    description: 'Connect WhatsApp, Telegram, and Instagram from one dashboard.',
                },
                flowBuilder: {
                    title: 'No-Code Flow Builder',
                    description: 'Visual drag-and-drop editor for complex conversation flows.',
                },
                analytics: {
                    title: 'Real-Time Analytics',
                    description: 'Track performance, leads, and AI token usage in real-time.',
                },
            },
            pricing: {
                title: 'Simple, Transparent Pricing',
                subtitle: 'Choose the plan that fits your business needs',
                month: '/mo',
                included: 'Included',
                starter: {
                    name: 'Starter',
                    price: '7 000 ₸',
                    features: ['1 AI Bot', '1,000 Messages/mo', 'WhatsApp Only', 'Email Support'],
                },
                pro: {
                    name: 'Pro',
                    price: '10 000 ₸',
                    features: ['3 AI Bots', '10,000 Messages/mo', 'All Channels', 'Priority Support', 'CRM Integration'],
                    popular: 'POPULAR',
                },
                enterprise: {
                    name: 'Enterprise',
                    price: '30 000 ₸',
                    features: ['Unlimited Bots', 'Unlimited Messages', 'Custom Training', 'Dedicated Manager', 'API Access'],
                },
                getStarted: 'Get Started',
            },
            cta: {
                title: 'Ready to Transform Your Customer Support?',
                subtitle: 'Join hundreds of businesses automating their messaging.',
                button: 'Get Started Now',
            },
            footer: {
                rights: '© 2026 WebDevPro. All rights reserved.',
            },
        },
        auth: {
            common: {
                email: 'Email',
                password: 'Password',
                orContinue: 'Or continue with',
                google: 'Google',
            },
            login: {
                title: 'Welcome back',
                subtitle: 'Login to your account to continue',
                rememberMe: 'Remember me',
                forgotPassword: 'Forgot password?',
                submit: 'Sign In',
                submitting: 'Signing in...',
                noAccount: 'Don\'t have an account?',
                signup: 'Sign up',
            },
            signup: {
                title: 'Get started for free',
                subtitle: 'Start your free account. No credit card required.',
                fullName: 'Full Name',
                passwordHint: 'Must be at least 8 characters',
                agree: 'I agree to the',
                terms: 'Terms of Service',
                and: 'and',
                privacy: 'Privacy Policy',
                submit: 'Create Account',
                submitting: 'Creating account...',
                hasAccount: 'Already have an account?',
                signin: 'Sign in',
            },
            forgotPassword: {
                title: 'Reset Password',
                subtitle: 'Enter your email and we\'ll send you instructions to reset your password.',
                submit: 'Send Instructions',
                submitting: 'Sending...',
                backToLogin: 'Back to Login',
                checkEmail: 'Check your email',
                checkEmailDescription: 'We sent a password reset link to',
            },
            updatePassword: {
                title: 'New Password',
                subtitle: 'Enter a new secure password for your account.',
                passwordLabel: 'New Password',
                placeholder: 'Min 8 characters',
                submit: 'Update Password',
                submitting: 'Updating...',
                success: 'Password Updated',
                successDescription: 'You can now login with your new password.',
                backToLogin: 'Go to Login',
            },
        },
        common: {
            save: 'Save',
            saving: 'Saving...',
            saved: 'Saved!',
            cancel: 'Cancel',
            delete: 'Delete',
            confirm: 'Confirm',
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
        },
        dashboard: {
            title: 'Dashboard',
            subtitle: 'Welcome back! Here\'s what\'s happening with your bots.',
            stats: {
                messages: 'Messages Today',
                leads: 'Active Leads',
                automation: 'Automation Rate',
                tokens: 'AI Tokens Used',
            },
            recentActivity: 'Recent Activity',
            noActivity: 'Your bot activity will appear here...',
        },
        flows: {
            title: 'Flows',
            subtitle: 'Manage conversation flows for all your bots.',
            newFlow: 'New Flow',
            nodes: 'nodes',
            edited: 'Edited',
            delete: 'Delete',
        },
        billing: {
            title: 'Billing & Plans',
            subtitle: 'Choose the plan that fits your business needs.',
            managePayment: 'Manage Payment Methods',
            paymentMethod: 'Payment Method',
            plans: {
                starter: 'Starter',
                pro: 'Pro',
                enterprise: 'Enterprise',
                current: 'Current Plan',
                upgrade: 'Upgrade to Pro',
                contact: 'Contact Sales',
                popular: 'POPULAR',
            },
        },
        liveChat: {
            title: 'Live Chat',
            subtitle: 'Chat with your leads and customers in real-time.',
            search: 'Search chats...',
            today: 'Today',
            typeMessage: 'Type a message...',
            enterToSend: 'Enter to send',
            takeOver: 'Take over conversation',
        },
        channels: {
            title: 'Channels',
            subtitle: 'Connect your AI to your favorite messaging platforms.',
            notConnected: 'Not Connected',
            connect: 'Connect',
            connected: 'Connected',
        },
        aiPersona: {
            title: 'AI Persona',
            subtitle: 'Define how your bot speaks and behaves.',
            systemPrompt: 'System Prompt',
            systemPromptPlaceholder: 'You are a helpful support assistant for [Company Name]. Your tone is professional, friendly, and concise...',
            save: 'Save Configuration',
            testSandbox: 'Test Sandbox',
            preview: 'Chat preview will appear here',
        },
        integrations: {
            title: 'Integrations & API',
            subtitle: 'Connect WebDevPro with your existing tools.',
            connect: 'Connect',
            connected: 'Connected',
            notConnected: 'Not Connected',
            configure: 'Configure',
            apiKeys: 'API Keys',
            copy: 'Copy',
            revoke: 'Revoke',
            warning: 'Never share your API keys with anyone.',
            copySuccess: 'Copied!',
        },
        bots: {
            myBots: 'My Bots',
            newBot: 'New Bot',
            createBot: 'Create Bot',
            deleteBot: 'Delete Bot',
            confirmDelete: 'Delete this bot? This action cannot be undone.',
            noBots: 'No bots found. Create one to get started!',
            online: 'ONLINE',
            offline: 'OFFLINE',
            settings: 'Settings',
            botName: 'Bot Name',
            welcomeMessage: 'Welcome Message',
            autoReply: 'Auto Reply',
            autoReplyEnabled: 'Auto reply enabled',
            autoReplyMessage: 'Auto reply message',
            autoReplyDescription: 'When enabled, the bot will automatically respond to all incoming messages.',
            saveSettings: 'Save Settings',
        },
        whatsapp: {
            connect: 'Connect WhatsApp',
            connected: 'WhatsApp Connected',
            disconnect: 'Disconnect',
            generateQR: 'Generate QR Code',
            scanQR: 'Scan QR code with your phone',
            waitingScan: 'Waiting for scan...',
            initializing: 'Initializing...',
            connectedAs: 'Connected as',
        },
    },
};
