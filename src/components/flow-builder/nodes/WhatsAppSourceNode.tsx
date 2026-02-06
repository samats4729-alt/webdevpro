'use client';

import { Handle, Position } from 'reactflow';
import Image from 'next/image';

interface WhatsAppSourceNodeProps {
    data: {
        label: string;
    };
    selected: boolean;
}

export function WhatsAppSourceNode({ data, selected }: WhatsAppSourceNodeProps) {
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
            className={`node-minimal node-whatsapp ${selected ? 'selected' : ''}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transformStyle: 'preserve-3d', transition: 'transform 0.1s ease-out' }}
        >
            <div className="node-icon whatsapp-icon">
                <Image
                    src="/icon/whatsapicon.svg"
                    alt="WhatsApp"
                    width={48}
                    height={48}
                    style={{ filter: 'drop-shadow(0 0 12px rgba(37, 211, 102, 0.7))' }}
                />
            </div>
            <span className="node-label">WA</span>

            <Handle type="source" position={Position.Right} className="flow-handle" />
        </div>
    );
}
