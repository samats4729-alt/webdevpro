'use client';

import { useState, useEffect, useRef } from 'react';
import { Package, Plus, Upload, Sparkles, Search, Trash2, Edit2, X, Check, FileText, DollarSign, Clock, Filter } from 'lucide-react';

interface Service {
    id: string;
    bot_id: string;
    name: string;
    description?: string;
    duration_minutes: number;
    price?: number;
    is_active: boolean;
    created_at: string;
}

export default function CatalogPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [bots, setBots] = useState<any[]>([]);
    const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration_minutes: 60,
        price: ''
    });

    // Import state
    const [importText, setImportText] = useState('');
    const [parsedItems, setParsedItems] = useState<any[]>([]);
    const [parsing, setParsing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load bots
    useEffect(() => {
        fetch('/api/bots')
            .then(res => res.json())
            .then(data => {
                setBots(data.bots || []);
                if (data.bots?.length > 0) {
                    setSelectedBotId(data.bots[0].id);
                }
            });
    }, []);

    // Load services when bot changes
    useEffect(() => {
        if (!selectedBotId) return;
        setLoading(true);
        fetch(`/api/services?bot_id=${selectedBotId}`)
            .then(res => res.json())
            .then(data => {
                setServices(data.services || []);
                setLoading(false);
            });
    }, [selectedBotId]);

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = async () => {
        if (!formData.name || !selectedBotId) return;

        const res = await fetch('/api/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bot_id: selectedBotId,
                ...formData,
                price: formData.price ? parseFloat(formData.price) : null
            })
        });

        const data = await res.json();
        if (data.service) {
            setServices([...services, data.service]);
            setFormData({ name: '', description: '', duration_minutes: 60, price: '' });
            setShowAddForm(false);
        }
    };

    const handleUpdate = async (id: string) => {
        const service = services.find(s => s.id === id);
        if (!service) return;

        await fetch('/api/services', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(service)
        });

        setEditingId(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить этот товар/услугу?')) return;

        await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
        setServices(services.filter(s => s.id !== id));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const text = await file.text();
        setImportText(text);
        parseWithAI(text);
    };

    const parseWithAI = async (text: string) => {
        if (!text.trim()) return;
        setParsing(true);

        try {
            const res = await fetch('/api/services/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: text, bot_id: selectedBotId })
            });

            const data = await res.json();
            setParsedItems(data.parsed || []);
        } catch (e) {
            console.error('Parse error:', e);
        } finally {
            setParsing(false);
        }
    };

    const importParsedItems = async () => {
        if (!selectedBotId || parsedItems.length === 0) return;

        for (const item of parsedItems) {
            await fetch('/api/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bot_id: selectedBotId,
                    name: item.name,
                    description: item.description,
                    duration_minutes: item.duration_minutes || 60,
                    price: item.price
                })
            });
        }

        // Refresh
        const res = await fetch(`/api/services?bot_id=${selectedBotId}`);
        const data = await res.json();
        setServices(data.services || []);

        setShowImportModal(false);
        setParsedItems([]);
        setImportText('');
    };

    return (
        <div className="catalog-page">
            <style jsx>{`
                .catalog-page {
                    padding: 24px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .page-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .page-title {
                    font-size: 24px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .header-actions {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .btn-primary {
                    background: #22c55e;
                    color: white;
                }

                .btn-primary:hover {
                    background: #16a34a;
                }

                .btn-secondary {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    border: 1px solid var(--border-color);
                }

                .btn-secondary:hover {
                    background: var(--bg-tertiary);
                }

                .btn-icon {
                    padding: 8px;
                    border-radius: 6px;
                }

                .controls-bar {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                }

                .search-box {
                    flex: 1;
                    min-width: 200px;
                    position: relative;
                }

                .search-box input {
                    width: 100%;
                    padding: 10px 16px 10px 40px;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    font-size: 14px;
                }

                .search-box input:focus {
                    outline: none;
                    border-color: #22c55e;
                }

                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-secondary);
                }

                .bot-select {
                    padding: 10px 16px;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    font-size: 14px;
                    min-width: 180px;
                }

                .services-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 16px;
                }

                .service-card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 20px;
                    transition: all 0.2s;
                }

                .service-card:hover {
                    border-color: #22c55e;
                }

                .service-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 12px;
                }

                .service-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .service-name input {
                    font-size: 16px;
                    font-weight: 600;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 4px;
                    padding: 4px 8px;
                    color: var(--text-primary);
                    width: 100%;
                }

                .service-actions {
                    display: flex;
                    gap: 4px;
                }

                .service-description {
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin-bottom: 16px;
                    line-height: 1.5;
                }

                .service-description textarea {
                    width: 100%;
                    font-size: 13px;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 4px;
                    padding: 8px;
                    color: var(--text-primary);
                    resize: vertical;
                    min-height: 60px;
                }

                .service-footer {
                    display: flex;
                    gap: 16px;
                    padding-top: 12px;
                    border-top: 1px solid var(--border-color);
                }

                .service-meta {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    color: var(--text-secondary);
                }

                .service-meta input {
                    width: 80px;
                    font-size: 13px;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 4px;
                    padding: 4px 8px;
                    color: var(--text-primary);
                }

                .price-tag {
                    color: #22c55e;
                    font-weight: 600;
                }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--text-secondary);
                }

                .empty-state h3 {
                    font-size: 18px;
                    margin-bottom: 8px;
                    color: var(--text-primary);
                }

                /* Add Form */
                .add-form {
                    background: var(--bg-secondary);
                    border: 2px dashed var(--border-color);
                    border-radius: 12px;
                    padding: 20px;
                }

                .form-row {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 12px;
                    flex-wrap: wrap;
                }

                .form-row input, .form-row textarea {
                    flex: 1;
                    min-width: 150px;
                    padding: 10px 12px;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 14px;
                }

                .form-row input:focus, .form-row textarea:focus {
                    outline: none;
                    border-color: #22c55e;
                }

                .form-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .modal {
                    background: var(--bg-primary);
                    border-radius: 16px;
                    width: 100%;
                    max-width: 600px;
                    max-height: 80vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .modal-header {
                    padding: 20px;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-header h2 {
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .modal-body {
                    padding: 20px;
                    overflow-y: auto;
                    flex: 1;
                }

                .modal-footer {
                    padding: 16px 20px;
                    border-top: 1px solid var(--border-color);
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }

                .drop-zone {
                    border: 2px dashed var(--border-color);
                    border-radius: 12px;
                    padding: 40px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-bottom: 16px;
                }

                .drop-zone:hover {
                    border-color: #22c55e;
                    background: rgba(34, 197, 94, 0.05);
                }

                .drop-zone-icon {
                    color: var(--text-secondary);
                    margin-bottom: 12px;
                }

                .drop-zone p {
                    color: var(--text-secondary);
                    font-size: 14px;
                }

                .drop-zone span {
                    color: #22c55e;
                    font-weight: 500;
                }

                .text-input-area {
                    margin-top: 16px;
                }

                .text-input-area label {
                    display: block;
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin-bottom: 8px;
                }

                .text-input-area textarea {
                    width: 100%;
                    min-height: 100px;
                    padding: 12px;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    font-size: 14px;
                    resize: vertical;
                }

                .parsed-items {
                    margin-top: 20px;
                }

                .parsed-items h4 {
                    font-size: 14px;
                    margin-bottom: 12px;
                    color: var(--text-primary);
                }

                .parsed-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px;
                    background: var(--bg-secondary);
                    border-radius: 8px;
                    margin-bottom: 8px;
                }

                .parsed-item-name {
                    font-weight: 500;
                }

                .parsed-item-price {
                    color: #22c55e;
                }

                .parsing-indicator {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 16px;
                    background: var(--bg-secondary);
                    border-radius: 8px;
                    color: var(--text-secondary);
                }
            `}</style>

            <div className="page-header">
                <h1 className="page-title">
                    <Package size={24} />
                    Каталог товаров и услуг
                </h1>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>
                        <Upload size={16} />
                        Импорт
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                        <Plus size={16} />
                        Добавить
                    </button>
                </div>
            </div>

            <div className="controls-bar">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Поиск по названию..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="bot-select"
                    value={selectedBotId || ''}
                    onChange={(e) => setSelectedBotId(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                >
                    {bots.map(bot => (
                        <option key={bot.id} value={bot.id}>{bot.name}</option>
                    ))}
                </select>
            </div>

            {showAddForm && (
                <div className="add-form" style={{ marginBottom: 24 }}>
                    <div className="form-row">
                        <input
                            placeholder="Название товара/услуги *"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Цена"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            style={{ maxWidth: 120 }}
                        />
                        <input
                            type="number"
                            placeholder="Время (мин)"
                            value={formData.duration_minutes}
                            onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
                            style={{ maxWidth: 120 }}
                        />
                    </div>
                    <div className="form-row">
                        <textarea
                            placeholder="Описание (опционально)"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                        />
                    </div>
                    <div className="form-actions">
                        <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                            Отмена
                        </button>
                        <button className="btn btn-primary" onClick={handleAdd}>
                            <Plus size={16} />
                            Добавить
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="empty-state">
                    <p>Загрузка...</p>
                </div>
            ) : filteredServices.length === 0 ? (
                <div className="empty-state">
                    <Package size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <h3>Нет товаров или услуг</h3>
                    <p>Добавьте товары вручную или импортируйте из файла</p>
                </div>
            ) : (
                <div className="services-grid">
                    {filteredServices.map(service => (
                        <div key={service.id} className="service-card">
                            <div className="service-header">
                                {editingId === service.id ? (
                                    <input
                                        className="service-name"
                                        value={service.name}
                                        onChange={(e) => setServices(services.map(s =>
                                            s.id === service.id ? { ...s, name: e.target.value } : s
                                        ))}
                                    />
                                ) : (
                                    <div className="service-name">{service.name}</div>
                                )}
                                <div className="service-actions">
                                    {editingId === service.id ? (
                                        <>
                                            <button className="btn btn-icon btn-primary" onClick={() => handleUpdate(service.id)}>
                                                <Check size={14} />
                                            </button>
                                            <button className="btn btn-icon btn-secondary" onClick={() => setEditingId(null)}>
                                                <X size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="btn btn-icon btn-secondary" onClick={() => setEditingId(service.id)}>
                                                <Edit2 size={14} />
                                            </button>
                                            <button className="btn btn-icon btn-secondary" onClick={() => handleDelete(service.id)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {editingId === service.id ? (
                                <textarea
                                    className="service-description"
                                    value={service.description || ''}
                                    onChange={(e) => setServices(services.map(s =>
                                        s.id === service.id ? { ...s, description: e.target.value } : s
                                    ))}
                                    placeholder="Описание..."
                                />
                            ) : service.description ? (
                                <div className="service-description">{service.description}</div>
                            ) : null}

                            <div className="service-footer">
                                {editingId === service.id ? (
                                    <>
                                        <div className="service-meta">
                                            <DollarSign size={14} />
                                            <input
                                                type="number"
                                                value={service.price || ''}
                                                onChange={(e) => setServices(services.map(s =>
                                                    s.id === service.id ? { ...s, price: parseFloat(e.target.value) || undefined } : s
                                                ))}
                                                placeholder="Цена"
                                            />
                                        </div>
                                        <div className="service-meta">
                                            <Clock size={14} />
                                            <input
                                                type="number"
                                                value={service.duration_minutes}
                                                onChange={(e) => setServices(services.map(s =>
                                                    s.id === service.id ? { ...s, duration_minutes: parseInt(e.target.value) || 60 } : s
                                                ))}
                                            />
                                            мин
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {service.price && (
                                            <div className="service-meta price-tag">
                                                <DollarSign size={14} />
                                                {service.price}₽
                                            </div>
                                        )}
                                        <div className="service-meta">
                                            <Clock size={14} />
                                            {service.duration_minutes} мин
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Import Modal */}
            {showImportModal && (
                <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <Sparkles size={20} />
                                Импорт товаров
                            </h2>
                            <button className="btn btn-icon btn-secondary" onClick={() => setShowImportModal(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div
                                className="drop-zone"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="drop-zone-icon">
                                    <FileText size={40} />
                                </div>
                                <p>
                                    Перетащите файл или <span>нажмите для выбора</span>
                                </p>
                                <p style={{ fontSize: 12, marginTop: 8 }}>
                                    CSV, Excel, TXT с прайсом
                                </p>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.xlsx,.xls,.txt"
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                            />

                            <div className="text-input-area">
                                <label>Или вставьте текст с прайсом — AI распознает товары:</label>
                                <textarea
                                    placeholder="Пример:
Стрижка мужская - 500₽ (30 мин)
Маникюр - 800₽
Окрашивание волос - от 2000₽ (2 часа)"
                                    value={importText}
                                    onChange={(e) => setImportText(e.target.value)}
                                />
                                <button
                                    className="btn btn-secondary"
                                    style={{ marginTop: 8 }}
                                    onClick={() => parseWithAI(importText)}
                                    disabled={!importText.trim() || parsing}
                                >
                                    <Sparkles size={14} />
                                    {parsing ? 'Распознаю...' : 'Распознать с AI'}
                                </button>
                            </div>

                            {parsing && (
                                <div className="parsing-indicator">
                                    <Sparkles size={16} className="animate-pulse" />
                                    AI анализирует текст...
                                </div>
                            )}

                            {parsedItems.length > 0 && (
                                <div className="parsed-items">
                                    <h4>Распознанные товары ({parsedItems.length}):</h4>
                                    {parsedItems.map((item, idx) => (
                                        <div key={idx} className="parsed-item">
                                            <span className="parsed-item-name">{item.name}</span>
                                            <span className="parsed-item-price">
                                                {item.price ? `${item.price}₽` : '—'}
                                                {item.duration_minutes ? ` · ${item.duration_minutes} мин` : ''}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowImportModal(false)}>
                                Отмена
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={importParsedItems}
                                disabled={parsedItems.length === 0}
                            >
                                <Plus size={16} />
                                Добавить {parsedItems.length} товаров
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
