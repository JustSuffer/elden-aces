import { useState, useEffect } from "react";
import { MessageCircleMore, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClassName } from "@/types/game";
import { MASTER_CLASSES } from "@/data/gameData";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
    className: string; // The CSS class for positioning? No, probably the player's ClassName.
    playerClass: ClassName;
}

export const ChatInterface = ({ playerClass, className }: ChatInterfaceProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeMessage, setActiveMessage] = useState<string | null>(null);
    const [isFading, setIsFading] = useState(false);

    const classData = MASTER_CLASSES[playerClass];

    const chatOptions = [
        { label: "Thank you", text: "Thank you" },
        { label: "Well Played", text: "Well Played" },
        { label: "What a game", text: "What a game" },
        { label: "Sorry", text: "Sorry" },
        { label: "Absolute Cinema", text: "Absolute Cinema" },
        { label: "Threaten", text: classData?.threatenQuote || "I will crush you!" }
    ];

    const handleSelectMessage = (text: string) => {
        setActiveMessage(text);
        setIsOpen(false);
        setIsFading(false);
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            setIsFading(true);
            setTimeout(() => {
                setActiveMessage(null);
                setIsFading(false);
            }, 500); // Wait for fade out animation
        }, 3000);
    };

    return (
        <div className={cn("relative flex items-center", className)}>
            
            {/* The Chat Bubble Display */}
            {activeMessage && (
                <div className={cn(
                    "absolute right-[120%] bottom-0 mb-2 whitespace-nowrap bg-white text-black px-4 py-2 rounded-2xl rounded-tr-none border-2 border-slate-300 shadow-lg z-50 animate-in slide-in-from-right-5 fade-in duration-300",
                    isFading && "animate-out fade-out duration-500"
                )}>
                    <p className="font-bold text-sm md:text-base">{activeMessage}</p>
                    {/* Tiny triangle for speech bubble tail */}
                    <div className="absolute top-0 -right-2 w-0 h-0 
                        border-t-[10px] border-t-white
                        border-r-[10px] border-r-transparent
                        border-b-[0px] border-b-transparent
                        border-l-[0px] border-l-transparent 
                        drop-shadow-sm filter" 
                        style={{ filter: "drop-shadow(2px 0px 0px #cbd5e1)" }}
                    />
                </div>
            )}

            {/* Toggle Button */}
            <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:text-primary/80 hover:bg-primary/20 rounded-full w-10 h-10 border border-primary/30 bg-black/40 backdrop-blur-sm"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="w-5 h-5" /> : <MessageCircleMore className="w-5 h-5" />}
            </Button>

            {/* Chat Menu Overlay */}
            {isOpen && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-[300px] bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl z-50 animate-in zoom-in-95 fade-in duration-200">
                    <div className="grid grid-cols-2 gap-2">
                        {chatOptions.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelectMessage(option.text)}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-100 p-2 rounded-lg text-sm font-semibold transition-colors border border-slate-700/50 hover:border-slate-500"
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    {/* Arrow at bottom */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-r border-b border-slate-700 rotate-45" />
                </div>
            )}
        </div>
    );
};
