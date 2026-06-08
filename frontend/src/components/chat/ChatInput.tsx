import React from 'react';
import { RetroButton } from '../ui/RetroButton';

interface ChatInputProps {
  concept: string;
  setConcept: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  variant?: 'large' | 'compact';
}

export const ChatInput: React.FC<ChatInputProps> = ({
  concept,
  setConcept,
  onSubmit,
  loading,
  variant = 'large',
}) => {
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (concept.trim() && !loading) {
        onSubmit({ preventDefault: () => {} } as React.FormEvent);
      }
    }
  };

  if (variant === 'compact') {
    return (
      <div className="w-full max-w-2xl flex flex-col gap-2 font-mono">
        <form onSubmit={onSubmit} className="w-full">
          <div className="bevel-sunken chat-input-pill rounded-full bg-surface-container-lowest py-2 px-4 flex items-center gap-3 focus-within:border-primary-fixed-dim/40 transition-colors border border-transparent">
            {/* Mock Add Icon */}
            <button
              type="button"
              className="w-7 h-7 rounded-full flex items-center justify-center bg-surface-container-high text-on-surface-variant hover:text-primary-fixed-dim cursor-pointer text-[16px] transition-colors font-bold select-none shrink-0"
            >
              +
            </button>

            {/* Input Field */}
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="flex-grow bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-primary-fixed-dim placeholder:text-on-secondary-container placeholder:opacity-30 text-[13px] p-0"
              placeholder="Ask anything..."
            />

            {/* Mic Button */}
            <button
              type="button"
              className="p-1 hover:text-primary-fixed-dim text-on-surface-variant cursor-pointer transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">mic</span>
            </button>

            {/* Exec/Send Button */}
            <button
              type="submit"
              disabled={loading || !concept.trim()}
              className="w-7 h-7 rounded-full bg-primary-fixed-dim text-on-primary-fixed flex items-center justify-center cursor-pointer transition-transform duration-75 select-none disabled:opacity-30 disabled:cursor-not-allowed text-[16px] hover:brightness-110 active:scale-95 shrink-0"
            >
              {loading ? (
                <span className="material-symbols-outlined text-[16px] animate-spin">
                  sync
                </span>
              ) : (
                <span className="material-symbols-outlined text-[16px]">
                  arrow_upward
                </span>
              )}
            </button>
          </div>
        </form>

        {loading && (
          <div className="flex items-center justify-center gap-2 text-on-surface-variant/80 text-[10px] tracking-wider font-label-caps mt-1">
            <div className="flex space-x-1">
              <div
                className="w-1.5 h-1.5 bg-primary-fixed-dim rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              ></div>
              <div
                className="w-1.5 h-1.5 bg-[#ffb000] rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              ></div>
              <div
                className="w-1.5 h-1.5 bg-[#00bfff] rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              ></div>
            </div>
            <span>FORGING MATRIX...</span>
          </div>
        )}
      </div>
    );
  }

  // Large rendering (Original welcome screen input)
  return (
    <div className="w-full max-w-3xl flex flex-col gap-6 fade-in-slide font-mono">
      <form onSubmit={onSubmit} className="relative w-full">
        <div className="bevel-sunken chat-input-large-panel bg-surface-container-lowest p-4 md:p-6 shadow-inner border border-transparent focus-within:border-primary-fixed-dim/50 transition-colors group">
          <textarea
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-primary-fixed-dim font-body-lg text-body-lg placeholder:text-on-secondary-container placeholder:opacity-40 resize-none h-24 outline-none border-0"
            placeholder="Type your command or question here... (e.g. OAuth, Kubernetes, ThreadPoolExecutor)"
          />
          <div className="flex justify-between items-center mt-2 border-t border-[#1a1a1a] pt-4">
            <div className="flex gap-2">
              <button
                type="button"
                className="p-2 hover:bg-surface-container-high text-on-surface-variant transition-colors hover:text-primary-fixed-dim cursor-pointer"
                title="Voice input"
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>
            </div>
            <RetroButton
              type="submit"
              disabled={loading || !concept.trim()}
              pulseGlow={!loading && concept.trim().length > 0}
            >
              {loading ? (
                <>
                  FORGING
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    sync
                  </span>
                </>
              ) : (
                <>
                  EXECUTE
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </>
              )}
            </RetroButton>
          </div>
        </div>
      </form>

      {/* Loading Bouncer */}
      {loading && (
        <div className="flex flex-col items-center text-on-surface-variant/85 py-4 gap-2">
          <div className="flex space-x-2">
            <div
              className="w-2.5 h-2.5 bg-primary-fixed-dim rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className="w-2.5 h-2.5 bg-[#ffb000] rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            ></div>
            <div
              className="w-2.5 h-2.5 bg-[#00bfff] rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
          <p className="text-[12px] font-label-caps text-center tracking-wider pulse-glow">
            FORGING LEARNING EXPERIENCE MATRIX...
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
