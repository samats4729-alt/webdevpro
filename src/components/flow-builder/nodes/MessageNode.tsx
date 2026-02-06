'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import { MessageCircle } from 'lucide-react';

export function MessageNode({ data, selected }: NodeProps) {
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
            className={`node-minimal node-message ${selected ? 'selected' : ''}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transformStyle: 'preserve-3d', transition: 'transform 0.1s ease-out' }}
        >
            <Handle type="target" position={Position.Top} className="flow-handle" />

            <div className="node-icon">
                <MessageCircle size={48} strokeWidth={1.5} />
            </div>
            <span className="node-label">MSG</span>

            <Handle type="source" position={Position.Bottom} className="flow-handle" />
        </div>
    );
}

