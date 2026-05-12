import React from 'react';

interface AiSuggestionBoxProps {
    onSuggest: () => void;
    isAiLoading: boolean;
    hasTitle: boolean;
}

const AiSuggestionBox: React.FC<AiSuggestionBoxProps> = ({ 
    onSuggest, 
    isAiLoading, 
    hasTitle 
}) => {
    return (
        <div className="my-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/30 rounded-xl transition-all duration-300">
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">
                        {hasTitle ? "Ready to generate!" : "Stuck on details?"}
                    </h4>
                    <p className="text-xs text-indigo-700/70 dark:text-gray-400">
                        {hasTitle 
                            ? "Click suggest to auto-fill description, budget, and more." 
                            : "Enter a title above and let AI draft your project settings."}
                    </p>
                </div>
                
                <button
                    type="button"
                    onClick={onSuggest}
                    disabled={!hasTitle || isAiLoading}
                    className={`
                        relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${isAiLoading 
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                            : "bg-white text-indigo-600 shadow-sm border border-indigo-200 hover:shadow-md hover:border-indigo-400 active:scale-95"
                        }
                        ${!hasTitle && !isAiLoading ? "opacity-50 cursor-not-allowed grayscale" : "animate-pulse-subtle"}
                    `}
                >
                    {isAiLoading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                            Thinking...
                        </>
                    ) : (
                        <>
                            <span className="text-lg">✨</span>
                            AI Suggest
                        </>
                    )}
                </button>
            </div>
            
            {!hasTitle && !isAiLoading && (
                <p className="mt-2 text-[10px] text-amber-600 font-medium italic animate-pulse">
                    * Please enter a Job Title first to enable AI features.
                </p>
            )}
        </div>
    );
};

export default AiSuggestionBox;