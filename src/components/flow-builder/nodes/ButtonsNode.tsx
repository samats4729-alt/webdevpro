'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { List } from 'lucide-react';

function ButtonsNodeComponent({ data, selected }: NodeProps) {
    const buttons = data.buttons || [];

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
            className={`node-minimal node-buttons ${selected ? 'selected' : ''} ${buttons.length > 0 ? 'with-buttons' : ''}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transformStyle: 'preserve-3d',
                transition: 'transform 0.1s ease-out',
                height: buttons.length > 0 ? 'auto' : '100px',
                minHeight: '100px'
            }}
        >
            <Handle type="target" position={Position.Top} className="flow-handle" />

            <div className="node-icon">
                <List size={buttons.length > 0 ? 32 : 48} strokeWidth={1.5} />
            </div>
            <span className="node-label">MENU</span>

            {/* Button outputs */}
            {buttons.length > 0 && (
                <div className="buttons-outputs">
                    {buttons.map((btn: any, index: number) => (
                        <div key={index} className="button-output">
                            <span className="button-output-num">{index + 1}</span>
                            <span className="button-output-text">{btn.text || `Опция ${index + 1}`}</span>
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`button-${index}`}
                                className="flow-handle button-handle"
                                style={{ top: `${((index + 1) / (buttons.length + 1)) * 100}%` }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Default output if no buttons */}
            {buttons.length === 0 && (
                <Handle type="source" position={Position.Bottom} className="flow-handle" />
            )}
        </div>
    );
}

export const ButtonsNode = memo(ButtonsNodeComponent);
