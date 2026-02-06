"use client";

import { useState, useRef, useCallback } from "react";
import { Plus, MessageSquare, GitBranch, Zap, Play } from "lucide-react";

type NodeType = 'trigger' | 'message' | 'condition' | 'action';

interface FlowNode {
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    data: {
        label: string;
        content?: string;
    };
}

const INITIAL_NODES: FlowNode[] = [
    {
        id: 'start',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Start', content: 'When user writes "hello"' }
    },
    {
        id: 'msg1',
        type: 'message',
        position: { x: 100, y: 250 },
        data: { label: 'Welcome Message', content: 'Hi! How can I help you?' }
    },
    {
        id: 'cond1',
        type: 'condition',
        position: { x: 100, y: 400 },
        data: { label: 'Check Intent', content: 'If contains "price"' }
    }
];

export default function FlowCanvas() {
    const [nodes, setNodes] = useState<FlowNode[]>(INITIAL_NODES);
    const [draggingNode, setDraggingNode] = useState<string | null>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);

    const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        const rect = e.currentTarget.getBoundingClientRect();
        setOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        setDraggingNode(nodeId);
    };

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!draggingNode || !canvasRef.current) return;

        const canvasRect = canvasRef.current.getBoundingClientRect();
        const newX = e.clientX - canvasRect.left - offset.x;
        const newY = e.clientY - canvasRect.top - offset.y;

        setNodes(prev => prev.map(node =>
            node.id === draggingNode
                ? { ...node, position: { x: newX, y: newY } }
                : node
        ));
    }, [draggingNode, offset]);

    const handleMouseUp = () => {
        setDraggingNode(null);
    };

    return (
        <div className="flex gap-4 h-[calc(100vh-16rem)]">
            {/* Node Palette */}
            <div className="w-64 dark-card p-4 space-y-3 overflow-y-auto">
                <h3 className="font-semibold text-white text-sm mb-4">Add Blocks</h3>
                <PaletteItem icon={Play} label="Trigger" color="purple" />
                <PaletteItem icon={MessageSquare} label="Message" color="blue" />
                <PaletteItem icon={GitBranch} label="Condition" color="orange" />
                <PaletteItem icon={Zap} label="Action" color="green" />
            </div>

            {/* Canvas */}
            <div
                ref={canvasRef}
                className="flex-1 relative bg-[#0a0a0a] rounded-xl border border-card-border overflow-hidden"
                style={{
                    backgroundImage: 'radial-gradient(circle, #ffffff08 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                {/* Render Nodes */}
                {nodes.map(node => (
                    <FlowNodeComponent
                        key={node.id}
                        node={node}
                        onMouseDown={(e: React.MouseEvent) => handleNodeMouseDown(e, node.id)}
                        isDragging={draggingNode === node.id}
                    />
                ))}

                {/* Zoom Controls */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                    <button className="w-8 h-8 rounded-lg bg-dark-card border border-card-border flex items-center justify-center text-gray-400 hover:text-white hover:border-accent/50 transition-colors">
                        <Plus className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-dark-card border border-card-border flex items-center justify-center text-gray-400 hover:text-white hover:border-accent/50 transition-colors">
                        <span className="text-xs">−</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function PaletteItem({ icon: Icon, label, color }: any) {
    const colorMap: any = {
        purple: 'from-purple-500 to-pink-500',
        blue: 'from-blue-500 to-cyan-500',
        orange: 'from-orange-500 to-red-500',
        green: 'from-green-500 to-emerald-500'
    };

    return (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-card-border hover:border-accent/50 cursor-grab active:cursor-grabbing transition-colors group">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorMap[color]} p-0.5 group-hover:scale-110 transition-transform`}>
                <div className="w-full h-full bg-dark-card rounded-md flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                </div>
            </div>
            <span className="text-sm text-gray-300 font-medium">{label}</span>
        </div>
    );
}

function FlowNodeComponent({ node, onMouseDown, isDragging }: any) {
    const getNodeColor = (type: NodeType) => {
        switch (type) {
            case 'trigger': return 'from-purple-500 to-pink-500';
            case 'message': return 'from-blue-500 to-cyan-500';
            case 'condition': return 'from-orange-500 to-red-500';
            case 'action': return 'from-green-500 to-emerald-500';
        }
    };

    const getIcon = (type: NodeType) => {
        switch (type) {
            case 'trigger': return Play;
            case 'message': return MessageSquare;
            case 'condition': return GitBranch;
            case 'action': return Zap;
        }
    };

    const Icon = getIcon(node.type);

    return (
        <div
            className={`absolute cursor-move select-none ${isDragging ? 'z-50 opacity-80' : 'z-10'}`}
            style={{
                left: node.position.x,
                top: node.position.y,
                transition: isDragging ? 'none' : 'all 0.1s ease'
            }}
            onMouseDown={onMouseDown}
        >
            <div className="w-56 dark-card p-4 border border-accent/30 hover:border-accent/60 transition-colors shadow-xl">
                <div className="flex items-start gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getNodeColor(node.type)} p-0.5 flex-shrink-0`}>
                        <div className="w-full h-full bg-dark-card rounded-md flex items-center justify-center">
                            <Icon className="w-4 h-4 text-white" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white text-sm truncate">{node.data.label}</h4>
                        {node.data.content && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{node.data.content}</p>
                        )}
                    </div>
                </div>

                {/* Connection Points */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-accent bg-dark-card"></div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-accent bg-dark-card"></div>
            </div>
        </div>
    );
}
