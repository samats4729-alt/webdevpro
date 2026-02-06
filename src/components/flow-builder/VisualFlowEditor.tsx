'use client';

import { useState, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { Loader2 } from 'lucide-react';
import { FlowBuilderWrapper } from './FlowBuilder';

interface FlowData {
    id: string;
    name: string;
    nodes: any; // Can be array (legacy) or { _nodes, _edges } (new format)
    edges?: any[];
}

interface VisualFlowEditorProps {
    botId: string;
}

export default function VisualFlowEditor({ botId }: VisualFlowEditorProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [flowId, setFlowId] = useState<string | null>(null);
    const [initialNodes, setInitialNodes] = useState<Node[]>([]);
    const [initialEdges, setInitialEdges] = useState<Edge[]>([]);

    useEffect(() => {
        fetchFlow();

        const handleRefresh = () => {
            console.log('🔄 VisualFlowEditor received refresh signal');
            fetchFlow();
        };

        window.addEventListener('refresh-flow-data', handleRefresh);
        return () => window.removeEventListener('refresh-flow-data', handleRefresh);
    }, [botId]);

    const fetchFlow = async () => {
        try {
            const res = await fetch(`/api/bots/${botId}/flows?t=${Date.now()}`, {
                cache: 'no-store',
                headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
            });
            if (!res.ok) throw new Error('Failed to fetch flows');

            const flows: FlowData[] = await res.json();

            if (flows.length > 0) {
                const flow = flows[0];
                setFlowId(flow.id);

                // Handle new format: { _nodes: [...], _edges: [...] }
                if (flow.nodes && flow.nodes._nodes) {
                    setInitialNodes(flow.nodes._nodes);
                    setInitialEdges(flow.nodes._edges || []);
                }
                // Handle old array format
                else if (flow.nodes && Array.isArray(flow.nodes) && flow.nodes.length > 0) {
                    // Check if it's React Flow format (has position)
                    if (flow.nodes[0].position) {
                        setInitialNodes(flow.nodes);
                        setInitialEdges(flow.edges || []);
                    } else {
                        // Convert old FlowRule format to React Flow nodes
                        const convertedNodes = convertLegacyNodes(flow.nodes);
                        setInitialNodes(convertedNodes);
                        setInitialEdges([]);
                    }
                }
            } else {
                // Create new flow
                const createRes = await fetch(`/api/bots/${botId}/flows`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: 'Main Flow',
                        nodes: [],
                        edges: []
                    })
                });
                if (createRes.ok) {
                    const newFlow = await createRes.json();
                    setFlowId(newFlow.id);
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (nodes: Node[], edges: Edge[]) => {
        if (!flowId) return;

        try {
            const res = await fetch(`/api/bots/${botId}/flows`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    flowId,
                    nodes,
                    edges
                })
            });

            if (!res.ok) throw new Error('Failed to save flow');

            // Hot-reload rules into active WhatsApp session
            await fetch('/api/whatsapp/refresh-rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ botId })
            });

        } catch (err: any) {
            console.error('Save error:', err);
            throw err;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="dark-card p-6 text-center">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <FlowBuilderWrapper
            botId={botId}
            initialNodes={initialNodes}
            initialEdges={initialEdges}
            onSave={handleSave}
        />
    );
}

// Convert legacy FlowRule format to React Flow nodes
function convertLegacyNodes(legacyNodes: any[]): Node[] {
    const nodes: Node[] = [];
    let yPosition = 50;

    legacyNodes.forEach((rule) => {
        // Create trigger node
        const triggerId = `trigger_${rule.id}`;
        nodes.push({
            id: triggerId,
            type: 'trigger',
            position: { x: 250, y: yPosition },
            data: {
                label: 'Триггер',
                triggerType: rule.trigger?.type || 'contains',
                triggerValue: rule.trigger?.value || '',
            }
        });

        // Create message node
        const messageId = `message_${rule.id}`;
        nodes.push({
            id: messageId,
            type: 'message',
            position: { x: 250, y: yPosition + 150 },
            data: {
                label: 'Сообщение',
                message: rule.action?.message || '',
            }
        });

        yPosition += 350;
    });

    return nodes;
}
