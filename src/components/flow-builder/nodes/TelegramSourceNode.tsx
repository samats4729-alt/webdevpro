'use client';

import { Handle, Position } from 'reactflow';
import { Send } from 'lucide-react';

interface TelegramSourceNodeProps {
    data: {
        label: string;
    };
    selected: boolean;
}

export function TelegramSourceNode({ data, selected }: TelegramSourceNodeProps) {
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = (rect.height / 2 - y) / 8;
        const rotateY = (x - rect.width / 2) / 8;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
    };

    return (
        <div
            className={`node-minimal node-telegram ${selected ? 'selected' : ''}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transformStyle: 'preserve-3d', transition: 'transform 0.1s ease-out' }}
        >
            <div className="node-icon">
                <Send size={48} strokeWidth={1.5} />
            </div>
            <span className="node-label">TG</span>

            <Handle type="source" position={Position.Right} className="flow-handle" />
        </div>
    );
}
