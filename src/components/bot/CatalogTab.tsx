'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, Edit2, X, Check, DollarSign, Clock, Upload, Sparkles, FileText, Package } from 'lucide-react';

interface Service {
    id: string;
    bot_id: string;
    name: string;
    description?: string;
    duration_minutes: number;
    price?: number;
    currency?: string;
    is_active: boolean;
    created_at: string;
}

const CURRENCIES = [
    { code: 'RUB', symbol: '₽' },
    { code: 'KZT', symbol: '₸' },
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'UZS', symbol: 'сум' },
    { code: 'UAH', symbol: '₴' },
];

interface CatalogTabProps {
    botId: string;
}

export default function CatalogTab({ botId }: CatalogTabProps) {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration_minutes: 60,
        price: '',
        currency: 'RUB'
    });

    // Import state
    const [importText, setImportText] = useState('');
    const [parsedItems, setParsedItems] = useState<any[]>([]);
    const [parsing, setParsing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchServices();
    }, [botId]);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/services?bot_id=${botId}`);
            const data = await res.json();
            setServices(data.services || []);
        } catch (e) {
            console.error('Failed to fetch services:', e);
        } finally {
            setLoading(false);
        }
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = async () => {
        if (!formData.name) return;

        const res = await fetch('/api/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bot_id: botId,
                ...formData,
                price: formData.price ? parseFloat(formData.price) : null
            })
        });

        const data = await res.json();
        if (data.service) {
            setServices([...services, data.service]);
            setFormData({ name: '', description: '', duration_minutes: 60, price: '', currency: 'RUB' });
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

        let text = '';
        const fileName = file.name.toLowerCase();

        // Check if it's an Excel file
        if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
            try {
                const XLSX = (await import('xlsx')).default;
                const buffer = await file.arrayBuffer();
                const workbook = XLSX.read(buffer, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                text = XLSX.utils.sheet_to_csv(firstSheet);
            } catch (err) {
                console.error('Failed to parse Excel:', err);
                alert('Не удалось прочитать Excel файл');
                return;
            }
        } else {
            // Text-based files (CSV, TXT)
            text = await file.text();
        }

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
                body: JSON.stringify({ content: text, bot_id: botId })
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
        if (parsedItems.length === 0) return;

        for (const item of parsedItems) {
            await fetch('/api/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bot_id: botId,
                    name: item.name,
                    description: item.description,
                    duration_minutes: item.duration_minutes || 60,
                    price: item.price
                })
            });
        }

        await fetchServices();
        setShowImportModal(false);
        setParsedItems([]);
        setImportText('');
    };

    return (
        <div className="catalog-tab">
            <style jsx>{`
                .catalog-tab {
                    padding: 0;
                }

                .header-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    gap: 12px;
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
                    border: 1px solid var(--border-color, #333);
                    background: var(--bg-secondary, #1a1a1a);
                    color: white;
                    font-size: 14px;
                }

                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #666;
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
                    background: #2a2a2a;
                    color: white;
                    border: 1px solid #333;
                }

                .btn-secondary:hover {
                    background: #333;
                }

                .btn-icon {
                    padding: 8px;
                    border-radius: 6px;
                }

                .services-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 16px;
                }

                .service-card {
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 16px;
                    transition: all 0.2s;
                }

                .service-card:hover {
                    border-color: #22c55e;
                }

                .service-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 8px;
                }

                .service-name {
                    font-size: 15px;
                    font-weight: 600;
                    color: white;
                }

                .service-name input {
                    font-size: 15px;
                    font-weight: 600;
                    background: #0a0a0a;
                    border: 1px solid #333;
                    border-radius: 4px;
                    padding: 4px 8px;
                    color: white;
                    width: 100%;
                }

                .service-actions {
                    display: flex;
                    gap: 4px;
                }

                .service-description {
                    font-size: 13px;
                    color: #888;
                    margin-bottom: 12px;
                    line-height: 1.4;
                }

                .service-description textarea {
                    width: 100%;
                    font-size: 13px;
                    background: #0a0a0a;
                    border: 1px solid #333;
                    border-radius: 4px;
                    padding: 8px;
                    color: white;
                    resize: vertical;
                    min-height: 50px;
                }

                .service-footer {
                    display: flex;
                    gap: 16px;
                    padding-top: 10px;
                    border-top: 1px solid #333;
                }

                .service-meta {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    color: #888;
                }

                .service-meta input {
                    width: 70px;
                    font-size: 13px;
                    background: #0a0a0a;
                    border: 1px solid #333;
                    border-radius: 4px;
                    padding: 4px 8px;
                    color: white;
                }

                .price-tag {
                    color: #22c55e;
                    font-weight: 600;
                }

                .empty-state {
                    text-align: center;
                    padding: 40px 20px;
                    color: #888;
                }

                .empty-state h3 {
                    font-size: 16px;
                    margin-bottom: 8px;
                    color: white;
                }

                .add-form {
                    background: #1a1a1a;
                    border: 2px dashed #333;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 20px;
                }

                .form-row {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 12px;
                    flex-wrap: wrap;
                }

                .form-row input, .form-row textarea {
                    flex: 1;
                    min-width: 140px;
                    padding: 10px 12px;
                    border-radius: 8px;
                    border: 1px solid #333;
                    background: #0a0a0a;
                    color: white;
                    font-size: 14px;
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
                    background: rgba(0,0,0,0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .modal {
                    background: #0a0a0a;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 500px;
                    max-height: 80vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    border: 1px solid #333;
                }

                .modal-header {
                    padding: 16px 20px;
                    border-bottom: 1px solid #333;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-header h2 {
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: white;
                }

                .modal-body {
                    padding: 20px;
                    overflow-y: auto;
                    flex: 1;
                }

                .modal-footer {
                    padding: 16px 20px;
                    border-top: 1px solid #333;
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }

                .drop-zone {
                    border: 2px dashed #333;
                    border-radius: 12px;
                    padding: 30px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-bottom: 16px;
                }

                .drop-zone:hover {
                    border-color: #22c55e;
                    background: rgba(34, 197, 94, 0.05);
                }

                .drop-zone p {
                    color: #888;
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
                    color: #888;
                    margin-bottom: 8px;
                }

                .text-input-area textarea {
                    width: 100%;
                    min-height: 80px;
                    padding: 12px;
                    border-radius: 8px;
                    border: 1px solid #333;
                    background: #1a1a1a;
                    color: white;
                    font-size: 14px;
                    resize: vertical;
                }

                .parsed-items {
                    margin-top: 16px;
                }

                .parsed-items h4 {
                    font-size: 13px;
                    margin-bottom: 10px;
                    color: white;
                }

                .parsed-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px;
                    background: #1a1a1a;
                    border-radius: 8px;
                    margin-bottom: 6px;
                    font-size: 13px;
                }

                .parsed-item-name {
                    font-weight: 500;
                    color: white;
                }

                .parsed-item-price {
                    color: #22c55e;
                }
            `}</style>

            <div className="header-bar">
                <div className="search-box">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Поиск..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>
                    <Upload size={14} />
                    Импорт
                </button>
                <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                    <Plus size={14} />
                    Добавить
                </button>
            </div>

            {showAddForm && (
                <div className="add-form">
                    <div className="form-row">
                        <input
                            placeholder="Название *"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Цена"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            style={{ maxWidth: 100 }}
                        />
                        <select
                            value={formData.currency}
                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                            style={{ maxWidth: 80, padding: '10px 8px', borderRadius: 8, border: '1px solid #333', background: '#0a0a0a', color: 'white', fontSize: 14 }}
                        >
                            {CURRENCIES.map(c => (
                                <option key={c.code} value={c.code}>{c.symbol}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Мин"
                            value={formData.duration_minutes}
                            onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
                            style={{ maxWidth: 80 }}
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
                            <Plus size={14} />
                            Добавить
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="empty-state">Загрузка...</div>
            ) : filteredServices.length === 0 ? (
                <div className="empty-state">
                    <Package size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                    <h3>Нет товаров или услуг</h3>
                    <p>Добавьте вручную или импортируйте из файла</p>
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
                                                <Check size={12} />
                                            </button>
                                            <button className="btn btn-icon btn-secondary" onClick={() => setEditingId(null)}>
                                                <X size={12} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="btn btn-icon btn-secondary" onClick={() => setEditingId(service.id)}>
                                                <Edit2 size={12} />
                                            </button>
                                            <button className="btn btn-icon btn-secondary" onClick={() => handleDelete(service.id)}>
                                                <Trash2 size={12} />
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
                                            <DollarSign size={12} />
                                            <input
                                                type="number"
                                                value={service.price || ''}
                                                onChange={(e) => setServices(services.map(s =>
                                                    s.id === service.id ? { ...s, price: parseFloat(e.target.value) || undefined } : s
                                                ))}
                                            />
                                        </div>
                                        <div className="service-meta">
                                            <Clock size={12} />
                                            <input
                                                type="number"
                                                value={service.duration_minutes}
                                                onChange={(e) => setServices(services.map(s =>
                                                    s.id === service.id ? { ...s, duration_minutes: parseInt(e.target.value) || 60 } : s
                                                ))}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {service.price && (
                                            <div className="service-meta price-tag">
                                                {service.price.toLocaleString()}{CURRENCIES.find(c => c.code === (service.currency || 'KZT'))?.symbol || '₸'}
                                            </div>
                                        )}
                                        <div className="service-meta">
                                            <Clock size={12} />
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
                                <Sparkles size={18} />
                                Импорт товаров
                            </h2>
                            <button className="btn btn-icon btn-secondary" onClick={() => setShowImportModal(false)}>
                                <X size={16} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div
                                className="drop-zone"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <FileText size={32} style={{ color: '#666', marginBottom: 8 }} />
                                <p>
                                    Перетащите или <span>выберите файл</span>
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
                                <label>Или вставьте текст с прайсом:</label>
                                <textarea
                                    placeholder="Стрижка - 500₽ (30 мин)
Маникюр - 800₽"
                                    value={importText}
                                    onChange={(e) => setImportText(e.target.value)}
                                />
                                <button
                                    className="btn btn-secondary"
                                    style={{ marginTop: 8, width: '100%' }}
                                    onClick={() => parseWithAI(importText)}
                                    disabled={!importText.trim() || parsing}
                                >
                                    <Sparkles size={14} />
                                    {parsing ? 'Распознаю...' : 'Распознать с AI'}
                                </button>
                            </div>

                            {parsedItems.length > 0 && (
                                <div className="parsed-items">
                                    <h4>Распознано ({parsedItems.length}):</h4>
                                    {parsedItems.map((item, idx) => (
                                        <div key={idx} className="parsed-item">
                                            <span className="parsed-item-name">{item.name}</span>
                                            <span className="parsed-item-price">
                                                {item.price ? `${item.price}₽` : '—'}
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
                                <Plus size={14} />
                                Добавить ({parsedItems.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
