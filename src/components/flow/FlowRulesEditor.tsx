"use client";

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Loader2, MessageSquare, Zap, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface FlowRule {
    id: string;
    trigger: {
        type: 'keyword' | 'contains' | 'starts_with' | 'exact';
        value: string;
    };
    action: {
        type: 'reply';
        message: string;
    };
    enabled: boolean;
}

interface Flow {
    id: string;
    name: string;
    nodes: FlowRule[];
}

interface FlowRulesEditorProps {
    botId: string;
}

const TRIGGER_TYPES = [
    { value: 'contains', label: 'Содержит', labelEn: 'Contains' },
    { value: 'exact', label: 'Точное совпадение', labelEn: 'Exact match' },
    { value: 'starts_with', label: 'Начинается с', labelEn: 'Starts with' },
    { value: 'keyword', label: 'Ключевое слово', labelEn: 'Keyword' },
];

export default function FlowRulesEditor({ botId }: FlowRulesEditorProps) {
    const [flows, setFlows] = useState<Flow[]>([]);
    const [rules, setRules] = useState<FlowRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
    const { language } = useLanguage();

    useEffect(() => {
        fetchFlows();
    }, [botId]);

    const fetchFlows = async () => {
        try {
            const res = await fetch(`/api/bots/${botId}/flows`);
            if (res.ok) {
                const data = await res.json();
                setFlows(data);
                if (data.length > 0) {
                    setActiveFlowId(data[0].id);
                    setRules(data[0].nodes || []);
                }
            }
        } catch (error) {
            console.error('Failed to fetch flows:', error);
        } finally {
            setLoading(false);
        }
    };

    const createFlow = async () => {
        try {
            const res = await fetch(`/api/bots/${botId}/flows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: language === 'ru' ? 'Новый сценарий' : 'New Flow',
                    rules: []
                })
            });
            if (res.ok) {
                const flow = await res.json();
                setFlows([flow, ...flows]);
                setActiveFlowId(flow.id);
                setRules([]);
            }
        } catch (error) {
            console.error('Failed to create flow:', error);
        }
    };

    const saveRules = async () => {
        if (!activeFlowId) return;

        setSaving(true);
        setSaved(false);

        try {
            const res = await fetch(`/api/bots/${botId}/flows`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ flowId: activeFlowId, rules })
            });
            if (res.ok) {
                // Update local flows state
                setFlows(flows.map(f =>
                    f.id === activeFlowId ? { ...f, nodes: rules } : f
                ));

                // Hot-reload rules into active WhatsApp session
                await fetch('/api/whatsapp/refresh-rules', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ botId })
                });

                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch (error) {
            console.error('Failed to save rules:', error);
        } finally {
            setSaving(false);
        }
    };

    const addRule = () => {
        const newRule: FlowRule = {
            id: crypto.randomUUID(),
            trigger: { type: 'contains', value: '' },
            action: { type: 'reply', message: '' },
            enabled: true
        };
        setRules([...rules, newRule]);
    };

    const updateRule = (id: string, updates: Partial<FlowRule>) => {
        setRules(rules.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    const deleteRule = (id: string) => {
        setRules(rules.filter(r => r.id !== id));
    };

    const selectFlow = (flowId: string) => {
        const flow = flows.find(f => f.id === flowId);
        if (flow) {
            setActiveFlowId(flowId);
            setRules(flow.nodes || []);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white">
                        {language === 'ru' ? 'Сценарии автоответов' : 'Auto-reply Flows'}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {language === 'ru'
                            ? 'Создайте правила: если сообщение содержит X → ответить Y'
                            : 'Create rules: if message contains X → reply with Y'}
                    </p>
                </div>
                <button
                    onClick={createFlow}
                    className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
                >
                    <Plus className="w-4 h-4" />
                    {language === 'ru' ? 'Новый сценарий' : 'New Flow'}
                </button>
            </div>

            {flows.length === 0 ? (
                <div className="dark-card p-12 text-center">
                    <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h4 className="text-white font-medium mb-2">
                        {language === 'ru' ? 'Нет сценариев' : 'No flows yet'}
                    </h4>
                    <p className="text-gray-500 text-sm mb-6">
                        {language === 'ru'
                            ? 'Создайте первый сценарий для автоматических ответов'
                            : 'Create your first flow for automatic responses'}
                    </p>
                    <button
                        onClick={createFlow}
                        className="btn-primary px-6 py-2"
                    >
                        {language === 'ru' ? 'Создать сценарий' : 'Create Flow'}
                    </button>
                </div>
            ) : (
                <>
                    {/* Flow Selector */}
                    {flows.length > 1 && (
                        <div className="flex gap-2 flex-wrap">
                            {flows.map(flow => (
                                <button
                                    key={flow.id}
                                    onClick={() => selectFlow(flow.id)}
                                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${activeFlowId === flow.id
                                        ? 'bg-accent text-black font-medium'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    {flow.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Rules Editor */}
                    <div className="space-y-4">
                        {rules.length === 0 ? (
                            <div className="dark-card p-8 text-center border-dashed">
                                <MessageSquare className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm mb-4">
                                    {language === 'ru'
                                        ? 'Добавьте первое правило'
                                        : 'Add your first rule'}
                                </p>
                                <button
                                    onClick={addRule}
                                    className="text-accent hover:underline text-sm"
                                >
                                    + {language === 'ru' ? 'Добавить правило' : 'Add Rule'}
                                </button>
                            </div>
                        ) : (
                            rules.map((rule, index) => (
                                <div key={rule.id} className="dark-card p-5">
                                    <div className="flex items-start gap-4">
                                        {/* Rule Number */}
                                        <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold flex-shrink-0">
                                            {index + 1}
                                        </div>

                                        {/* Rule Content */}
                                        <div className="flex-1 space-y-4">
                                            {/* Trigger */}
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider">
                                                    {language === 'ru' ? 'Если сообщение' : 'If message'}
                                                </label>
                                                <div className="flex gap-3">
                                                    <select
                                                        value={rule.trigger.type}
                                                        onChange={(e) => updateRule(rule.id, {
                                                            trigger: { ...rule.trigger, type: e.target.value as any }
                                                        })}
                                                        className="search-input w-48"
                                                    >
                                                        {TRIGGER_TYPES.map(t => (
                                                            <option key={t.value} value={t.value}>
                                                                {language === 'ru' ? t.label : t.labelEn}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        type="text"
                                                        value={rule.trigger.value}
                                                        onChange={(e) => updateRule(rule.id, {
                                                            trigger: { ...rule.trigger, value: e.target.value }
                                                        })}
                                                        placeholder={language === 'ru' ? 'текст...' : 'text...'}
                                                        className="search-input flex-1"
                                                    />
                                                </div>
                                            </div>

                                            {/* Arrow */}
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <div className="h-px bg-gray-700 flex-1"></div>
                                                <ChevronDown className="w-4 h-4" />
                                                <div className="h-px bg-gray-700 flex-1"></div>
                                            </div>

                                            {/* Action */}
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider">
                                                    {language === 'ru' ? 'Ответить' : 'Reply with'}
                                                </label>
                                                <textarea
                                                    value={rule.action.message}
                                                    onChange={(e) => updateRule(rule.id, {
                                                        action: { ...rule.action, message: e.target.value }
                                                    })}
                                                    placeholder={language === 'ru' ? 'Текст ответа...' : 'Reply message...'}
                                                    className="search-input w-full h-24 resize-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => updateRule(rule.id, { enabled: !rule.enabled })}
                                                className={`p-2 rounded-lg transition-colors ${rule.enabled
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-gray-700 text-gray-500'
                                                    }`}
                                                title={rule.enabled ? 'Enabled' : 'Disabled'}
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteRule(rule.id)}
                                                className="p-2 rounded-lg bg-transparent hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                                                title={language === 'ru' ? 'Удалить' : 'Delete'}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Add Rule Button */}
                        {rules.length > 0 && (
                            <button
                                onClick={addRule}
                                className="w-full py-3 border border-dashed border-card-border rounded-xl text-gray-500 hover:text-white hover:border-accent transition-colors"
                            >
                                + {language === 'ru' ? 'Добавить правило' : 'Add Rule'}
                            </button>
                        )}
                    </div>

                    {/* Save Button */}
                    {rules.length > 0 && (
                        <button
                            onClick={saveRules}
                            disabled={saving}
                            className="btn-primary flex items-center gap-2 px-6 py-3"
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : saved ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {saving
                                ? (language === 'ru' ? 'Сохранение...' : 'Saving...')
                                : saved
                                    ? (language === 'ru' ? 'Сохранено!' : 'Saved!')
                                    : (language === 'ru' ? 'Сохранить правила' : 'Save Rules')}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
