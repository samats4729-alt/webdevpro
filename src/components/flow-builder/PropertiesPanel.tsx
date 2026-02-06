'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Node } from 'reactflow';
import { Trash2, Upload, Loader2, GripVertical, X, Brain, MessageCircle, Zap, GitBranch, Clock, List, Image, FormInput, Globe, Key } from 'lucide-react';

interface PropertiesPanelProps {
    selectedNode: Node | null;
    onUpdateNode: (nodeId: string, data: any) => void;
    onDeleteNode: (nodeId: string) => void;
    botId: string;
}

const NODE_ICONS: Record<string, any> = {
    ai: Brain,
    message: MessageCircle,
    trigger: Zap,
    condition: GitBranch,
    delay: Clock,
    buttons: List,
    media: Image,
    input: FormInput,
    http: Globe,
    aiApi: Key,
};

const NODE_LABELS: Record<string, string> = {
    ai: 'AI Ответ',
    message: 'Сообщение',
    trigger: 'Триггер',
    condition: 'Условие',
    delay: 'Задержка',
    buttons: 'Меню',
    media: 'Медиа',
    input: 'Ввод',
    http: 'HTTP',
    aiApi: 'AI API',
};

export function PropertiesPanel({ selectedNode, onUpdateNode, onDeleteNode, botId }: PropertiesPanelProps) {
    const [panelWidth, setPanelWidth] = useState(320);
    const [isResizing, setIsResizing] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            const newWidth = window.innerWidth - e.clientX;
            setPanelWidth(Math.max(280, Math.min(600, newWidth)));
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing]);

    if (!selectedNode) {
        return (
            <div className="properties-panel-modern empty" style={{ width: panelWidth }} ref={panelRef}>
                <div className="resize-handle" onMouseDown={handleMouseDown}>
                    <GripVertical size={12} />
                </div>
                <div className="empty-state-modern">
                    <div className="empty-icon">
                        <Brain size={32} />
                    </div>
                    <p>Выберите ноду</p>
                    <span>для настройки свойств</span>
                </div>
            </div>
        );
    }

    const NodeIcon = NODE_ICONS[selectedNode.type || ''] || Brain;
    const nodeLabel = NODE_LABELS[selectedNode.type || ''] || 'Нода';

    const handleChange = (field: string, value: any) => {
        onUpdateNode(selectedNode.id, { [field]: value });
    };

    return (
        <div className="properties-panel-modern" style={{ width: panelWidth }} ref={panelRef}>
            <div className="resize-handle" onMouseDown={handleMouseDown}>
                <GripVertical size={12} />
            </div>

            <div className="panel-header-modern">
                <div className="node-type-badge">
                    <NodeIcon size={16} />
                    <span>{nodeLabel}</span>
                </div>
                <button
                    className="delete-btn-modern"
                    onClick={() => onDeleteNode(selectedNode.id)}
                    title="Удалить"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <div className="panel-content-modern">
                {selectedNode.type === 'trigger' && (
                    <TriggerProperties
                        data={selectedNode.data}
                        onChange={handleChange}
                    />
                )}
                {selectedNode.type === 'message' && (
                    <MessageProperties
                        data={selectedNode.data}
                        onChange={handleChange}
                        botId={botId}
                    />
                )}
                {selectedNode.type === 'condition' && (
                    <ConditionProperties
                        data={selectedNode.data}
                        onChange={handleChange}
                    />
                )}
                {selectedNode.type === 'delay' && (
                    <DelayProperties
                        data={selectedNode.data}
                        onChange={handleChange}
                    />
                )}
                {selectedNode.type === 'media' && (
                    <MediaProperties
                        data={selectedNode.data}
                        onChange={handleChange}
                        botId={botId}
                    />
                )}
                {selectedNode.type === 'buttons' && (
                    <ButtonsProperties
                        data={selectedNode.data}
                        onChange={handleChange}
                        onUpdateNode={onUpdateNode}
                        nodeId={selectedNode.id}
                    />
                )}
                {selectedNode.type === 'ai' && (
                    <AIProperties
                        data={selectedNode.data}
                        onChange={handleChange}
                    />
                )}
                {selectedNode.type === 'aiApi' && (
                    <AIApiProperties
                        data={selectedNode.data}
                        onChange={handleChange}
                    />
                )}
                {selectedNode.type === 'input' && (
                    <InputProperties
                        data={selectedNode.data}
                        onChange={handleChange}
                    />
                )}
                {selectedNode.type === 'http' && (
                    <HttpProperties
                        data={selectedNode.data}
                        onChange={handleChange}
                    />
                )}
            </div>
        </div>
    );
}

function TriggerProperties({ data, onChange }: { data: any; onChange: (field: string, value: any) => void }) {
    return (
        <>
            <div className="property-group">
                <label>Тип триггера</label>
                <select
                    value={data.triggerType || 'contains'}
                    onChange={(e) => onChange('triggerType', e.target.value)}
                >
                    <option value="contains">Содержит</option>
                    <option value="exact">Точно равно</option>
                    <option value="starts_with">Начинается с</option>
                    <option value="keyword">Ключевое слово</option>
                    <option value="any">Любое сообщение</option>
                </select>
            </div>
            {data.triggerType !== 'any' && (
                <div className="property-group">
                    <label>Значение</label>
                    <input
                        type="text"
                        value={data.triggerValue || ''}
                        onChange={(e) => onChange('triggerValue', e.target.value)}
                        placeholder="Введите текст..."
                    />
                </div>
            )}
        </>
    );
}

function MessageProperties({ data, onChange, botId }: { data: any; onChange: (field: string, value: any) => void; botId: string }) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('botId', botId);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success && result.url) {
                onChange('mediaUrl', result.url);
            } else {
                alert('Ошибка загрузки: ' + (result.error || 'Неизвестная ошибка'));
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            alert('Ошибка загрузки файла');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <>
            <div className="property-group">
                <label>Текст сообщения</label>
                <textarea
                    value={data.message || ''}
                    onChange={(e) => onChange('message', e.target.value)}
                    placeholder="Введите сообщение..."
                    rows={5}
                />
                <p className="helper-text">
                    Поддерживаются переменные: {'{{name}}'}, {'{{phone}}'}
                </p>
            </div>

            <div className="property-group">
                <label>Прикрепить фото (необязательно)</label>

                {data.mediaUrl ? (
                    <div className="attached-media-preview">
                        <img src={data.mediaUrl} alt="Preview" style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '8px' }} />
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="remove-button" onClick={() => onChange('mediaUrl', '')} style={{ width: '100%' }}>
                                Удалить фото
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                        <button
                            className="upload-button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 size={16} className="spin" />
                                    Загрузка...
                                </>
                            ) : (
                                <>
                                    <Upload size={16} />
                                    Загрузить фото
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>
        </>
    );
}

function ConditionProperties({ data, onChange }: { data: any; onChange: (field: string, value: any) => void }) {
    return (
        <>
            <div className="property-group">
                <label>Как использовать</label>
                <p className="helper-text" style={{ marginTop: 0 }}>
                    Условие проверяет входящее сообщение и направляет поток по одному из двух путей.
                </p>
            </div>
            <div className="property-group">
                <label>Проверка сообщения</label>
                <select
                    value={data.conditionType || 'contains'}
                    onChange={(e) => onChange('conditionType', e.target.value)}
                >
                    <option value="contains">Содержит текст</option>
                    <option value="not_contains">НЕ содержит текст</option>
                    <option value="exact">Точно равно</option>
                    <option value="starts_with">Начинается с</option>
                </select>
            </div>
            <div className="property-group">
                <label>Искомый текст</label>
                <input
                    type="text"
                    value={data.conditionValue || ''}
                    onChange={(e) => onChange('conditionValue', e.target.value)}
                    placeholder="Например: да, заказ, купить..."
                />
            </div>
            <div className="property-group">
                <label>Выходы</label>
                <p className="helper-text" style={{ marginTop: 0 }}>
                    <span style={{ color: '#4ade80' }}>● Да</span> — условие выполнено, текст найден<br />
                    <span style={{ color: '#f87171' }}>● Нет</span> — условие НЕ выполнено<br /><br />
                    Соедините каждый выход с нужным действием (Сообщение или другое Условие).
                </p>
            </div>
        </>
    );
}

function DelayProperties({ data, onChange }: { data: any; onChange: (field: string, value: any) => void }) {
    const presets = [
        { label: '1 сек', value: 1 },
        { label: '5 сек', value: 5 },
        { label: '30 сек', value: 30 },
        { label: '1 мин', value: 60 },
        { label: '5 мин', value: 300 },
        { label: '1 час', value: 3600 },
    ];

    return (
        <>
            <div className="property-group">
                <label>Длительность задержки</label>
                <div className="delay-presets">
                    {presets.map((preset) => (
                        <button
                            key={preset.value}
                            className={`preset-button ${data.delaySeconds === preset.value ? 'active' : ''}`}
                            onClick={() => onChange('delaySeconds', preset.value)}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="property-group">
                <label>Или укажите вручную (секунды)</label>
                <input
                    type="number"
                    min={1}
                    max={86400}
                    value={data.delaySeconds || 1}
                    onChange={(e) => onChange('delaySeconds', parseInt(e.target.value) || 1)}
                />
            </div>
        </>
    );
}

function MediaProperties({ data, onChange, botId }: { data: any; onChange: (field: string, value: any) => void; botId: string }) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('botId', botId);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success && result.url) {
                onChange('mediaUrl', result.url);
            } else {
                alert('Ошибка загрузки: ' + (result.error || 'Неизвестная ошибка'));
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            alert('Ошибка загрузки файла');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <>
            <div className="property-group">
                <label>Тип медиа</label>
                <select
                    value={data.mediaType || 'image'}
                    onChange={(e) => onChange('mediaType', e.target.value)}
                >
                    <option value="image">🖼️ Изображение</option>
                    <option value="video">🎥 Видео</option>
                    <option value="audio">🎵 Аудио</option>
                    <option value="document">📄 Документ</option>
                </select>
            </div>
            <div className="property-group">
                <label>Загрузить файл</label>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
                <button
                    className="upload-button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                >
                    {uploading ? (
                        <>
                            <Loader2 size={16} className="spin" />
                            Загрузка...
                        </>
                    ) : (
                        <>
                            <Upload size={16} />
                            Выбрать файл
                        </>
                    )}
                </button>
            </div>
            <div className="property-group">
                <label>Или укажите URL</label>
                <input
                    type="url"
                    value={data.mediaUrl || ''}
                    onChange={(e) => onChange('mediaUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                />
                {data.mediaUrl && (
                    <span className="hint success">✓ URL установлен</span>
                )}
            </div>
            <div className="property-group">
                <label>Подпись (необязательно)</label>
                <textarea
                    value={data.caption || ''}
                    onChange={(e) => onChange('caption', e.target.value)}
                    placeholder="Описание к медиа..."
                    rows={2}
                />
            </div>
        </>
    );
}

function ButtonsProperties({
    data,
    onChange,
    onUpdateNode,
    nodeId
}: {
    data: any;
    onChange: (field: string, value: any) => void;
    onUpdateNode: (nodeId: string, data: any) => void;
    nodeId: string;
}) {
    const buttons = data.buttons || [];

    const addButton = () => {
        const newButtons = [...buttons, { text: '', triggerValue: '' }];
        onUpdateNode(nodeId, { buttons: newButtons });
    };

    const updateButton = (index: number, field: string, value: string) => {
        const newButtons = [...buttons];
        newButtons[index] = { ...newButtons[index], [field]: value };
        onUpdateNode(nodeId, { buttons: newButtons });
    };

    const removeButton = (index: number) => {
        const newButtons = buttons.filter((_: any, i: number) => i !== index);
        onUpdateNode(nodeId, { buttons: newButtons });
    };

    return (
        <>
            <div className="property-group">
                <label>Текст меню</label>
                <textarea
                    value={data.menuText || ''}
                    onChange={(e) => onChange('menuText', e.target.value)}
                    placeholder="Выберите опцию:"
                    rows={2}
                />
                <span className="hint">Текст перед кнопками</span>
            </div>

            <div className="property-group">
                <label>Кнопки</label>
                <div className="buttons-list">
                    {buttons.map((btn: any, index: number) => (
                        <div key={index} className="button-item">
                            <span className="button-index">{index + 1}</span>
                            <input
                                type="text"
                                value={btn.text || ''}
                                onChange={(e) => updateButton(index, 'text', e.target.value)}
                                placeholder={`Опция ${index + 1}`}
                            />
                            <button
                                className="remove-button"
                                onClick={() => removeButton(index)}
                                title="Удалить"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
                <button className="add-button-btn" onClick={addButton}>
                    + Добавить кнопку
                </button>
            </div>

            <div className="property-group">
                <div className="helper-text">
                    💡 Бот отправит нумерованное меню. Когда пользователь ответит цифрой,
                    бот продолжит по соответствующей ветке.
                </div>
            </div>
        </>
    );
}

function AIProperties({ data, onChange }: { data: any; onChange: (field: string, value: any) => void }) {
    return (
        <>
            <div className="property-group">
                <label>Системный промпт</label>
                <textarea
                    value={data.systemPrompt || ''}
                    onChange={(e) => onChange('systemPrompt', e.target.value)}
                    placeholder="Ты вежливый помощник компании..."
                    className="property-textarea"
                    rows={4}
                />
                <div className="helper-text">
                    Инструкции для AI: как общаться, какой тон использовать
                </div>
            </div>

            <div className="property-group">
                <label>Модель</label>
                <select
                    value={data.model || 'deepseek-chat'}
                    onChange={(e) => onChange('model', e.target.value)}
                    className="property-select"
                >
                    <option value="deepseek-chat">DeepSeek Chat</option>
                    <option value="deepseek-reasoner">DeepSeek Reasoner</option>
                </select>
            </div>

            <div className="property-group">
                <label>Температура: {data.temperature || 0.7}</label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={data.temperature || 0.7}
                    onChange={(e) => onChange('temperature', parseFloat(e.target.value))}
                    className="property-range"
                />
                <div className="range-labels">
                    <span>Точный</span>
                    <span>Креативный</span>
                </div>
            </div>

            <div className="property-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={data.useKnowledgeBase !== false}
                        onChange={(e) => onChange('useKnowledgeBase', e.target.checked)}
                    />
                    Использовать базу знаний
                </label>
                <div className="helper-text">
                    AI будет использовать информацию о товарах/услугах для ответов
                </div>
            </div>

            <div className="property-group">
                <div className="helper-text ai-hint">
                    🤖 AI ответит на сообщение пользователя, используя контекст из базы знаний и системного промпта
                </div>
            </div>
        </>
    );
}

function InputProperties({ data, onChange }: { data: any; onChange: (field: string, value: any) => void }) {
    const variablePresets = [
        { value: 'name', label: '👤 Имя', hint: 'Имя пользователя' },
        { value: 'email', label: '📧 Email', hint: 'Электронная почта' },
        { value: 'phone', label: '📱 Телефон', hint: 'Номер телефона' },
        { value: 'custom', label: '✏️ Своё', hint: 'Произвольная переменная' },
    ];

    return (
        <>
            <div className="property-group">
                <label>Как использовать</label>
                <p className="helper-text" style={{ marginTop: 0 }}>
                    Эта нода ждёт ответ пользователя и сохраняет его в переменную.
                    Используйте переменную <code>{`{{${data.customVariableName || 'data'}}}`}</code> в следующих сообщениях.
                </p>
            </div>

            <div className="property-group">
                <label>Сообщение-подсказка</label>
                <textarea
                    value={data.promptMessage || ''}
                    onChange={(e) => onChange('promptMessage', e.target.value)}
                    placeholder="Введите ваше имя..."
                    rows={2}
                />
                <span className="hint">Это сообщение отправится пользователю перед ожиданием ввода</span>
            </div>

            <div className="property-group">
                <label>Сохранить в переменную</label>
                <div className="variable-presets">
                    {variablePresets.map((preset) => (
                        <button
                            key={preset.value}
                            className={`preset-button ${data.variableName === preset.value ? 'active' : ''}`}
                            onClick={() => onChange('variableName', preset.value)}
                            title={preset.hint}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>

            {data.variableName === 'custom' && (
                <div className="property-group">
                    <label>Имя переменной</label>
                    <input
                        type="text"
                        value={data.customVariableName || ''}
                        onChange={(e) => onChange('customVariableName', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                        placeholder="my_variable"
                    />
                    <span className="hint">Только латинские буквы, цифры и _</span>
                </div>
            )}

            <div className="property-group">
                <label>Валидация</label>
                <select
                    value={data.validationType || 'none'}
                    onChange={(e) => onChange('validationType', e.target.value)}
                >
                    <option value="none">Без проверки</option>
                    <option value="email">Email (проверка формата)</option>
                    <option value="phone">Телефон (только цифры)</option>
                    <option value="number">Число</option>
                </select>
            </div>

            {data.validationType !== 'none' && (
                <div className="property-group">
                    <label>Сообщение при ошибке</label>
                    <input
                        type="text"
                        value={data.errorMessage || ''}
                        onChange={(e) => onChange('errorMessage', e.target.value)}
                        placeholder="Пожалуйста, введите корректные данные"
                    />
                </div>
            )}
        </>
    );
}

function HttpProperties({ data, onChange }: { data: any; onChange: (field: string, value: any) => void }) {
    return (
        <>
            <div className="property-group">
                <label>Как использовать</label>
                <p className="helper-text" style={{ marginTop: 0 }}>
                    Отправляет HTTP-запрос на внешний сервис (например, CRM или API).
                    Можно использовать переменные типа <code>{`{{name}}`}</code> в URL и теле запроса.
                </p>
            </div>

            <div className="property-group">
                <label>Метод</label>
                <div className="method-buttons">
                    {['GET', 'POST', 'PUT', 'DELETE'].map((method) => (
                        <button
                            key={method}
                            className={`method-button ${data.method === method ? 'active' : ''} method-${method.toLowerCase()}`}
                            onClick={() => onChange('method', method)}
                        >
                            {method}
                        </button>
                    ))}
                </div>
            </div>

            <div className="property-group">
                <label>URL</label>
                <input
                    type="url"
                    value={data.url || ''}
                    onChange={(e) => onChange('url', e.target.value)}
                    placeholder="https://api.example.com/webhook"
                />
                <span className="hint">Поддерживает переменные: {`{{phone}}`}, {`{{name}}`}</span>
            </div>

            <div className="property-group">
                <label>Заголовки (JSON)</label>
                <textarea
                    value={data.headers || '{}'}
                    onChange={(e) => onChange('headers', e.target.value)}
                    placeholder='{"Content-Type": "application/json"}'
                    rows={2}
                    className="code-textarea"
                />
            </div>

            {data.method !== 'GET' && (
                <div className="property-group">
                    <label>Тело запроса (JSON)</label>
                    <textarea
                        value={data.body || '{}'}
                        onChange={(e) => onChange('body', e.target.value)}
                        placeholder={'{\n  "phone": "{{phone}}",\n  "name": "{{name}}"\n}'}
                        rows={4}
                        className="code-textarea"
                    />
                </div>
            )}

            <div className="property-group">
                <label>Сохранить ответ в переменную (опционально)</label>
                <input
                    type="text"
                    value={data.saveResponseTo || ''}
                    onChange={(e) => onChange('saveResponseTo', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    placeholder="api_response"
                />
                <span className="hint">Если нужно использовать ответ API позже</span>
            </div>

            <div className="property-group">
                <div className="helper-text">
                    ✅ <strong>Успех</strong> — статус 2xx, поток идёт по зелёной ветке<br />
                    ❌ <strong>Ошибка</strong> — любой другой статус, поток идёт по красной ветке
                </div>
            </div>
        </>
    );
}

function AIApiProperties({ data, onChange }: { data: any; onChange: (field: string, value: any) => void }) {
    return (
        <>
            <div className="property-group">
                <label>🔑 API Ключ</label>
                <input
                    type="password"
                    value={data.apiKey || ''}
                    onChange={(e) => onChange('apiKey', e.target.value)}
                    placeholder="sk-..."
                />
                <span className="hint">Ваш собственный API ключ (OpenAI, DeepSeek и др.)</span>
            </div>

            <div className="property-group">
                <label>🌐 Base URL</label>
                <select
                    value={data.baseUrl || 'https://api.openai.com/v1'}
                    onChange={(e) => onChange('baseUrl', e.target.value)}
                >
                    <option value="https://api.openai.com/v1">OpenAI</option>
                    <option value="https://api.deepseek.com">DeepSeek</option>
                    <option value="https://api.anthropic.com">Anthropic</option>
                    <option value="https://api.groq.com/openai/v1">Groq</option>
                    <option value="custom">Свой URL...</option>
                </select>
                {data.baseUrl === 'custom' && (
                    <input
                        type="text"
                        value={data.customBaseUrl || ''}
                        onChange={(e) => onChange('customBaseUrl', e.target.value)}
                        placeholder="https://your-api-url.com/v1"
                        style={{ marginTop: '8px' }}
                    />
                )}
            </div>

            <div className="property-group">
                <label>🤖 Модель</label>
                <input
                    type="text"
                    value={data.model || 'gpt-4'}
                    onChange={(e) => onChange('model', e.target.value)}
                    placeholder="gpt-4, deepseek-chat, claude-3-opus..."
                />
            </div>

            <div className="property-group">
                <label>💬 Системный промпт</label>
                <textarea
                    value={data.systemPrompt || ''}
                    onChange={(e) => onChange('systemPrompt', e.target.value)}
                    placeholder="Ты вежливый помощник..."
                    rows={4}
                />
            </div>

            <div className="property-group">
                <label>🌡️ Temperature ({data.temperature || 0.7})</label>
                <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={data.temperature || 0.7}
                    onChange={(e) => onChange('temperature', parseFloat(e.target.value))}
                />
                <span className="hint">0 = точные ответы, 2 = творческие ответы</span>
            </div>
        </>
    );
}
