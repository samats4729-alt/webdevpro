
import React from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

interface AnimatedPricingCardProps {
    name: string;
    price: string;
    monthText: string;
    features: string[];
    popular?: boolean;
    popularText?: string;
    getStartedText: string;
    includedText: string;
}

const AnimatedPricingCard: React.FC<AnimatedPricingCardProps> = ({
    name,
    price,
    monthText,
    features,
    popular,
    popularText,
    getStartedText,
    includedText
}) => {
    return (
        <div className="group w-full h-[420px] [perspective:1000px]">
            <div className="relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">

                {/* --- FRONT SIDE --- */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden]">
                    {/* Background with Glow */}
                    <div className="absolute inset-0 bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden flex flex-col items-center justify-center p-8 gap-8 shadow-2xl shadow-black/80">
                        {/* Subtle Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-30`} />

                        {/* Refined Neon Circle (Smaller, subtler) */}
                        <div className="absolute w-32 h-32 bg-accent/10 rounded-full blur-[50px] -top-10 -left-10 animate-pulse-slow" />

                        {popular && (
                            <div className="absolute top-6 right-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                                </span>
                            </div>
                        )}

                        <div className="relative z-10 text-center flex flex-col items-center justify-center h-full">
                            {/* Minimalist Title */}
                            <h3 className="text-white/60 text-sm font-medium tracking-[0.2em] uppercase mb-6">{name}</h3>

                            {/* Price with "Air" */}
                            <div className="flex flex-col items-center mb-6">
                                <span className="text-5xl font-thin text-white tracking-tight">{price}</span>
                                <span className="text-white/30 font-light text-sm mt-2 tracking-widest uppercase text-[10px]">{monthText}</span>
                            </div>

                            {/* Decorative Line */}
                            <div className="w-8 h-[1px] bg-accent/30 rounded-full" />
                        </div>

                        <div className="absolute bottom-8 text-white/20 text-[10px] uppercase tracking-widest font-medium transition-colors group-hover:text-accent/50">
                            View Details
                        </div>
                    </div>
                </div>

                {/* --- BACK SIDE --- */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <div className="absolute inset-0 bg-[#0a0a0a] rounded-2xl overflow-hidden flex flex-col p-[1px]">
                        {/* Thin Moving Line Border */}
                        <div className="absolute inset-[-50%] w-[200%] h-[200%] bg-[conic-gradient(transparent_0deg,transparent_90deg,#4ade80_180deg,transparent_270deg)] animate-spin-slow opacity-80" />

                        {/* Inner Content Background */}
                        <div className="relative w-full h-full bg-[#0a0a0a] rounded-[15px] p-8 flex flex-col z-10 overflow-hidden">
                            <div className="relative z-10 flex flex-col h-full">
                                <h4 className="text-sm font-medium text-accent tracking-[0.2em] uppercase mb-8 text-center ml-1">{includedText}</h4>

                                <ul className="space-y-4 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                                    {features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-4 text-white/70 text-sm font-light leading-relaxed">
                                            <div className="w-1 h-1 rounded-full bg-accent/50 mt-2 flex-shrink-0 shadow-[0_0_5px_rgba(74,222,128,0.5)]" />
                                            <span className="tracking-wide">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href="/signup"
                                    className="mt-8 block w-full border border-accent/20 text-accent hover:bg-accent hover:text-black font-medium text-sm tracking-widest uppercase text-center py-4 rounded-lg transition-all duration-300"
                                >
                                    {getStartedText}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AnimatedPricingCard;
