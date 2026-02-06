'use client';

import { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    ReactFlowProvider,
    ReactFlowInstance,
    BackgroundVariant,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { TriggerNode } from './nodes/TriggerNode';
import { MessageNode } from './nodes/MessageNode';
import { ConditionNode } from './nodes/ConditionNode';
import { DelayNode } from './nodes/DelayNode';
import { MediaNode } from './nodes/MediaNode';
import { ButtonsNode } from './nodes/ButtonsNode';
import AINode from './nodes/AINode';
import AIApiNode from './nodes/AIApiNode';
import { InputNode } from './nodes/InputNode';
import { HttpNode } from './nodes/HttpNode';
import { WhatsAppSourceNode } from './nodes/WhatsAppSourceNode';
import { TelegramSourceNode } from './nodes/TelegramSourceNode';
import { ShowSlotsNode, BookAppointmentNode } from './nodes/AppointmentNodes';
import { Sidebar } from './Sidebar';
import { PropertiesPanel } from './PropertiesPanel';
import './styles.css';

// Custom node types
const nodeTypes = {
    trigger: TriggerNode,
    message: MessageNode,
    condition: ConditionNode,
    delay: DelayNode,
    media: MediaNode,
    buttons: ButtonsNode,
    ai: AINode,
    aiApi: AIApiNode,
    input: InputNode,
    http: HttpNode,
    whatsappSource: WhatsAppSourceNode,
    telegramSource: TelegramSourceNode,
    showSlots: ShowSlotsNode,
    bookAppointment: BookAppointmentNode,
};

interface FlowBuilderProps {
    botId: string;
    initialNodes?: Node[];
    initialEdges?: Edge[];
    onSave?: (nodes: Node[], edges: Edge[]) => void;
}

// Generate unique node ID using timestamp + random
const getId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

export default function FlowBuilder({ botId, initialNodes = [], initialEdges = [], onSave }: FlowBuilderProps) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Update selected node when nodes change
    useEffect(() => {
        if (selectedNode) {
            const updated = nodes.find(n => n.id === selectedNode.id);
            if (updated) {
                setSelectedNode(updated);
            }
        }
    }, [nodes, selectedNode]);

    // Sync state with props when they change (e.g. on hot reload)
    useEffect(() => {
        if (initialNodes.length > 0 || initialEdges.length > 0) {
            setNodes(initialNodes);
            setEdges(initialEdges);
        }
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    const onConnect = useCallback(
        (params: Connection) => {
            setEdges((eds) => {
                // Remove existing edges from the same source handle to prevent loops
                const filteredEdges = eds.filter(
                    (e) => !(e.source === params.source && e.sourceHandle === params.sourceHandle)
                );

                return addEdge(
                    {
                        ...params,
                        type: 'smoothstep',
                        animated: true,
                        style: { stroke: '#6366f1', strokeWidth: 2 },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: '#6366f1',
                        },
                    },
                    filteredEdges
                );
            });
        },
        [setEdges]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (!type || !reactFlowInstance || !reactFlowWrapper.current) return;

            const bounds = reactFlowWrapper.current.getBoundingClientRect();
            const position = reactFlowInstance.project({
                x: event.clientX - bounds.left,
                y: event.clientY - bounds.top,
            });

            const newNode: Node = {
                id: getId(),
                type,
                position,
                data: getDefaultNodeData(type),
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes]
    );

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    const updateNodeData = useCallback((nodeId: string, data: any) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return { ...node, data: { ...node.data, ...data } };
                }
                return node;
            })
        );
    }, [setNodes]);

    const deleteNode = useCallback((nodeId: string) => {
        setNodes((nds) => nds.filter((node) => node.id !== nodeId));
        setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
        setSelectedNode(null);
    }, [setNodes, setEdges]);

    // Clipboard for copy/paste
    const clipboardRef = useRef<Node[]>([]);

    // Keyboard event handler for copy/paste
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if focus is on input/textarea
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
                return;
            }

            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'c') {
                    // Copy
                    e.preventDefault();
                    const selectedNodes = nodes.filter(n => n.selected);
                    if (selectedNodes.length > 0) {
                        clipboardRef.current = JSON.parse(JSON.stringify(selectedNodes));
                        console.log('Copied', selectedNodes.length, 'nodes');
                    } else if (selectedNode) {
                        clipboardRef.current = [JSON.parse(JSON.stringify(selectedNode))];
                        console.log('Copied 1 node');
                    }
                } else if (e.key === 'v') {
                    // Paste
                    e.preventDefault();
                    if (clipboardRef.current.length === 0) {
                        console.log('Clipboard empty');
                        return;
                    }

                    const newNodes = clipboardRef.current.map((node, index) => ({
                        ...node,
                        id: getId(),
                        position: {
                            x: node.position.x + 50 + (index * 20),
                            y: node.position.y + 50 + (index * 20),
                        },
                        selected: false,
                    }));

                    console.log('Pasting', newNodes.length, 'nodes');
                    setNodes((nds) => [...nds, ...newNodes]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nodes, selectedNode, setNodes]);

    const handleSave = async () => {
        if (!onSave) return;
        setIsSaving(true);
        try {
            await onSave(nodes, edges);
        } finally {
            setIsSaving(false);
        }
    };

    // Copy/paste functions for buttons
    const handleCopyClick = () => {
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length > 0) {
            clipboardRef.current = JSON.parse(JSON.stringify(selectedNodes));
            alert(`Скопировано ${selectedNodes.length} узлов`);
        } else if (selectedNode) {
            clipboardRef.current = [JSON.parse(JSON.stringify(selectedNode))];
            alert('Скопирован 1 узел');
        } else {
            alert('Сначала выделите узлы');
        }
    };

    const handlePasteClick = () => {
        if (clipboardRef.current.length === 0) {
            alert('Буфер пуст. Сначала скопируйте узлы.');
            return;
        }
        const newNodes = clipboardRef.current.map((node, index) => ({
            ...node,
            id: getId(),
            position: {
                x: node.position.x + 50 + (index * 20),
                y: node.position.y + 50 + (index * 20),
            },
            selected: false,
        }));
        setNodes((nds) => [...nds, ...newNodes]);
        alert(`Вставлено ${newNodes.length} узлов`);
    };

    return (
        <div className="flow-builder">
            <div className="flow-builder-header">
                <h2>Визуальный редактор сценариев</h2>
                <div className="header-actions">
                    <button className="action-button" onClick={handleCopyClick} title="Копировать (Ctrl+C)">
                        Копировать
                    </button>
                    <button className="action-button" onClick={handlePasteClick} title="Вставить (Ctrl+V)">
                        Вставить
                    </button>
                    <button
                        className="save-button"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </div>
            </div>
            <div className="flow-builder-content">
                <Sidebar />
                <div
                    className="flow-canvas"
                    ref={reactFlowWrapper}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.ctrlKey || e.metaKey) {
                            if (e.key === 'c') {
                                e.preventDefault();
                                const selectedNodes = nodes.filter(n => n.selected);
                                if (selectedNodes.length > 0) {
                                    clipboardRef.current = JSON.parse(JSON.stringify(selectedNodes));
                                    alert(`Скопировано ${selectedNodes.length} узлов`);
                                } else if (selectedNode) {
                                    clipboardRef.current = [JSON.parse(JSON.stringify(selectedNode))];
                                    alert('Скопирован 1 узел');
                                }
                            } else if (e.key === 'v') {
                                e.preventDefault();
                                if (clipboardRef.current.length === 0) {
                                    alert('Буфер пуст');
                                    return;
                                }
                                const newNodes = clipboardRef.current.map((node, index) => ({
                                    ...node,
                                    id: getId(),
                                    position: {
                                        x: node.position.x + 50 + (index * 20),
                                        y: node.position.y + 50 + (index * 20),
                                    },
                                    selected: false,
                                }));
                                setNodes((nds) => [...nds, ...newNodes]);
                                alert(`Вставлено ${newNodes.length} узлов`);
                            }
                        }
                    }}
                >
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        nodeTypes={nodeTypes}
                        connectOnClick={false}
                        nodesDraggable={true}
                        nodesConnectable={true}
                        elementsSelectable={true}
                        autoPanOnConnect={false}
                        autoPanOnNodeDrag={false}
                        selectNodesOnDrag={false}
                        snapToGrid
                        snapGrid={[16, 16]}
                        defaultEdgeOptions={{
                            type: 'smoothstep',
                            animated: true,
                        }}
                        deleteKeyCode={['Backspace', 'Delete']}
                        multiSelectionKeyCode="Shift"
                        selectionKeyCode="Shift"
                    >
                        <Controls className="flow-controls" />
                        <Background
                            variant={BackgroundVariant.Dots}
                            gap={16}
                            size={1}
                            color="#374151"
                        />
                        {/* SVG Gradient for premium edge lines */}
                        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                            <defs>
                                <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="50%" stopColor="#a78bfa" />
                                    <stop offset="100%" stopColor="#6366f1" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </ReactFlow>
                </div>
                <PropertiesPanel
                    selectedNode={selectedNode}
                    onUpdateNode={updateNodeData}
                    onDeleteNode={deleteNode}
                    botId={botId}
                />
            </div>
        </div>
    );
}

function getDefaultNodeData(type: string) {
    switch (type) {
        case 'trigger':
            return {
                label: 'Триггер',
                triggerType: 'contains',
                triggerValue: '',
            };
        case 'message':
            return {
                label: 'Сообщение',
                message: '',
            };
        case 'condition':
            return {
                label: 'Условие',
                conditionType: 'contains',
                conditionValue: '',
            };
        case 'delay':
            return {
                label: 'Задержка',
                delaySeconds: 1,
            };
        case 'media':
            return {
                label: 'Медиа',
                mediaType: 'image',
                mediaUrl: '',
                caption: '',
            };
        case 'buttons':
            return {
                label: 'Меню',
                menuText: 'Выберите опцию:',
                buttons: [],
            };
        case 'ai':
            return {
                label: 'AI Ответ',
                systemPrompt: 'Ты вежливый помощник компании. Отвечай на вопросы клиентов кратко и полезно.',
                model: 'deepseek-chat',
                temperature: 0.7,
                useKnowledgeBase: true,
            };
        case 'input':
            return {
                label: 'Ввод данных',
                variableName: 'custom',
                customVariableName: 'data',
                validationType: 'none',
                promptMessage: '',
                errorMessage: 'Пожалуйста, введите корректные данные',
            };
        case 'http':
            return {
                label: 'HTTP Запрос',
                method: 'POST',
                url: '',
                headers: '{}',
                body: '{}',
                saveResponseTo: '',
            };
        case 'whatsappSource':
            return {
                label: 'WhatsApp',
            };
        case 'telegramSource':
            return {
                label: 'Telegram',
            };
        case 'aiApi':
            return {
                label: 'AI API',
                apiKey: '',
                baseUrl: 'https://api.openai.com/v1',
                model: 'gpt-4',
                systemPrompt: 'Ты вежливый помощник. Отвечай кратко и полезно.',
                temperature: 0.7,
            };
        case 'showSlots':
            return {
                label: 'Показать слоты',
                daysAhead: 7,
                serviceId: '',
            };
        case 'bookAppointment':
            return {
                label: 'Записать',
                reminderMinutes: 60,
                confirmationMessage: '✅ Вы записаны на {date} в {time}! Напомню за час.',
            };
        default:
            return { label: 'Узел' };
    }
}

export function FlowBuilderWrapper(props: FlowBuilderProps) {
    return (
        <ReactFlowProvider>
            <FlowBuilder {...props} />
        </ReactFlowProvider>
    );
}
