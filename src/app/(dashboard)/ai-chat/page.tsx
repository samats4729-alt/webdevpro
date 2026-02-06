import { FullPageChat } from "@/components/ai/FullPageChat";

export default function AIChatPage() {
    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col -m-6">
            {/* Negative margin to counteract dashboard padding if present, 
                or just ensure it takes full space. 
                Typically dashboard layouts have padding. 
                I'll assume standard flex grow behavior first. 
            */}
            <FullPageChat />
        </div>
    );
}
