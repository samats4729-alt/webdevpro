
"use client";

import React from 'react';
import Link from 'next/link';
import './neon-button.css';

interface NeonButtonProps {
    href: string;
    text: string;
}

const NeonButton: React.FC<NeonButtonProps> = ({ href, text }) => {
    return (
        <Link href={href}>
            <div className="neon-button-wrapper">
                <div className="neon-button-wrap">
                    <button className="neon-button">
                        <div className="glow" />
                        <div className="bg">
                            <div className="shine" />
                        </div>
                        <div className="wave" />
                        <div className="wrap">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 974 367" height={367} width={974} className="circuit">
                                {/* Circuit paths adapted for green theme */}
                                <g className="circuit-path circuit-path-2">
                                    <g className="circuit-side">
                                        <path strokeWidth={2} stroke="url(#paint0_linear_73_31)" d="M0 1H185.5" style={{ '--i': 1 } as any} />
                                        <path strokeWidth={2} stroke="url(#paint1_linear_73_31)" d="M0 33H185.5" style={{ '--i': 2 } as any} />
                                        <path strokeWidth={2} stroke="url(#paint2_linear_73_31)" d="M10 84.5L50.6881 62.7689C52.8625 61.6075 55.2896 61 57.7547 61H185.5" style={{ '--i': 3 } as any} />

                                        <path strokeWidth={2} stroke="url(#paint3_linear_73_31)" d="M973.5 1H788" style={{ '--i': 4 } as any} />
                                        <path strokeWidth={2} stroke="url(#paint4_linear_73_31)" d="M973.5 33H788" style={{ '--i': 5 } as any} />
                                        <path strokeWidth={2} stroke="url(#paint5_linear_73_31)" d="M963.5 84.5L922.812 62.7689C920.638 61.6075 918.21 61 915.745 61H788" style={{ '--i': 6 } as any} />
                                    </g>
                                </g>
                                <defs>
                                    <linearGradient gradientUnits="userSpaceOnUse" y2="1.5" x2={265} y1="1.5" x1={0} id="paint0_linear_73_31">
                                        <stop stopOpacity={0} stopColor="#00ff66" offset="0.155" />
                                        <stop stopColor="#00ff66" offset={1} />
                                    </linearGradient>
                                    <linearGradient gradientUnits="userSpaceOnUse" y2="33.5" x2={265} y1="33.5" x1={0} id="paint1_linear_73_31">
                                        <stop stopOpacity={0} stopColor="#00ff66" />
                                        <stop stopColor="#00ff66" offset={1} />
                                    </linearGradient>
                                    <linearGradient gradientUnits="userSpaceOnUse" y2="72.75" x2={265} y1="72.75" x1={10} id="paint2_linear_73_31">
                                        <stop stopOpacity={0} stopColor="#00ff66" />
                                        <stop stopColor="#00ff66" offset={1} />
                                    </linearGradient>
                                    <linearGradient gradientUnits="userSpaceOnUse" y2="1.5" x2="708.5" y1="1.5" x1="973.5" id="paint3_linear_73_31">
                                        <stop stopOpacity={0} stopColor="#00ff66" offset="0.155" />
                                        <stop stopColor="#00ff66" offset={1} />
                                    </linearGradient>
                                    <linearGradient gradientUnits="userSpaceOnUse" y2="33.5" x2="708.5" y1="33.5" x1="973.5" id="paint4_linear_73_31">
                                        <stop stopOpacity={0} stopColor="#00ff66" />
                                        <stop stopColor="#00ff66" offset={1} />
                                    </linearGradient>
                                    <linearGradient gradientUnits="userSpaceOnUse" y2="72.75" x2="708.5" y1="72.75" x1="963.5" id="paint5_linear_73_31">
                                        <stop stopOpacity={0} stopColor="#00ff66" />
                                        <stop stopColor="#00ff66" offset={1} />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="wrap-content">
                                <div className="content">
                                    <div className="outline" />
                                    <div className="glyphs">
                                        <span className="text">
                                            {text.split('').map((char, i) => (
                                                <span key={i} data-label={char} style={{ '--i': i } as any}>{char}</span>
                                            ))}
                                        </span>
                                        <div className="icon-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 63 91" height={91} width={63}>
                                                <path fill="black" d="M9.3662 51.0001H21.9999V74.8271C21.9999 77.5581 25.352 78.8687 27.2043 76.862L53.3523 48.5349C55.1262 46.6132 53.7632 43.5001 51.1479 43.5001H39.9999V18.1557C39.9999 15.427 36.6525 14.1153 34.7986 16.1175L7.16492 45.9619C5.38659 47.8824 6.74874 51.0001 9.3662 51.0001Z" />
                                                <g className="strokes">
                                                    <path strokeWidth={2} stroke="white" d="M9.3662 51.0001H21.9999V74.8271C21.9999 77.5581 25.352 78.8687 27.2043 76.862L53.3523 48.5349C55.1262 46.6132 53.7632 43.5001 51.1479 43.5001H39.9999V18.1557C39.9999 15.427 36.6525 14.1153 34.7986 16.1175L7.16492 45.9619C5.38659 47.8824 6.74874 51.0001 9.3662 51.0001Z" className="stroke" />
                                                    <path strokeWidth={2} stroke="white" d="M9.3662 51.0001H21.9999V74.8271C21.9999 77.5581 25.352 78.8687 27.2043 76.862L53.3523 48.5349C55.1262 46.6132 53.7632 43.5001 51.1479 43.5001H39.9999V18.1557C39.9999 15.427 36.6525 14.1153 34.7986 16.1175L7.16492 45.9619C5.38659 47.8824 6.74874 51.0001 9.3662 51.0001Z" className="stroke" />
                                                </g>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </Link>
    );
}

export default NeonButton;
