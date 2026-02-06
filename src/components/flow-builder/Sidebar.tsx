'use client';

import Image from 'next/image';
import { Zap, MessageCircle, GitBranch, Clock, ImageIcon, List, Brain, FormInput, Globe, Send, Calendar, CalendarCheck, Key } from 'lucide-react';

// Custom icon component for WhatsApp
const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
    <Image
        src="/icon/whatsapicon.svg"
        alt="WhatsApp"
        width={size}
        height={size}
        style={{ filter: 'brightness(1.1)' }}
    />
);

const nodeCategories = [
    {
        title: 'Платформы',
        nodes: [
            { type: 'whatsappSource', label: 'WhatsApp', icon: WhatsAppIcon, color: '#25D366', hint: 'WhatsApp бот' },
            { type: 'telegramSource', label: 'Telegram', icon: Send, color: '#229ED9', hint: 'Telegram бот' },
        ],
    },
    {
        title: 'Сообщения',
        nodes: [
            { type: 'message', label: 'Сообщение', icon: MessageCircle, color: '#3b82f6', hint: 'Текст + фото' },
            { type: 'media', label: 'Медиа', icon: ImageIcon, color: '#f59e0b', hint: 'Файл, видео' },
        ],
    },
    {
        title: 'Логика',
        nodes: [
            { type: 'trigger', label: 'Триггер', icon: Zap, color: '#eab308', hint: 'Старт сценария' },
            { type: 'condition', label: 'Условие', icon: GitBranch, color: '#f97316', hint: 'Проверка текста' },
            { type: 'buttons', label: 'Меню', icon: List, color: '#ec4899', hint: 'Кнопки выбора' },
            { type: 'delay', label: 'Задержка', icon: Clock, color: '#06b6d4', hint: 'Пауза' },
        ],
    },
    {
        title: 'Данные',
        nodes: [
            { type: 'input', label: 'Ввод данных', icon: FormInput, color: '#6366f1', hint: 'Сохранить ответ' },
            { type: 'http', label: 'HTTP Запрос', icon: Globe, color: '#10b981', hint: 'API интеграция' },
        ],
    },
    {
        title: 'AI',
        nodes: [
            { type: 'ai', label: 'AI Ответ', icon: Brain, color: '#8b5cf6', hint: 'Умный ответ' },
            { type: 'aiApi', label: 'AI API', icon: Key, color: '#f59e0b', hint: 'Свой API ключ' },
        ],
    },
    {
        title: 'Записи',
        nodes: [
            { type: 'showSlots', label: 'Слоты', icon: Calendar, color: '#14b8a6', hint: 'Свободные окошки' },
            { type: 'bookAppointment', label: 'Записать', icon: CalendarCheck, color: '#8b5cf6', hint: 'Создать запись' },
        ],
    },
];

export function Sidebar() {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="flow-sidebar-premium">
            <div className="sidebar-header-premium">
                <h3>Блоки</h3>
                <span>Перетащите на холст</span>
            </div>
            <div className="sidebar-content-premium">
                {nodeCategories.map((category) => (
                    <div key={category.title} className="node-category-premium">
                        <div className="category-title">{category.title}</div>
                        <div className="node-grid">
                            {category.nodes.map((node) => (
                                <div
                                    key={node.type}
                                    className="draggable-node-premium"
                                    draggable
                                    onDragStart={(e) => onDragStart(e, node.type)}
                                    style={{ '--node-color': node.color } as React.CSSProperties}
                                    title={node.hint}
                                >
                                    <div className="node-icon-wrapper">
                                        <node.icon size={20} />
                                    </div>
                                    <span className="node-name">{node.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
