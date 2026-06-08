import { useState } from 'react';
import type { Experience, GameProposalOption } from '../../types/chat';

interface Props {
  data: Experience;
  onSelect: (option: GameProposalOption) => void;
  isLoading?: boolean;
}

export default function GameProposalRenderer({ data, onSelect, isLoading }: Props) {
  const options = data.content.options || [];
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleSelect = (opt: GameProposalOption, idx: number) => {
    if (isLoading) return;
    setSelectedIdx(idx);
    onSelect(opt);
  };

  return (
    <div className="flex flex-col h-full bg-[#050510] p-6 text-white font-sans overflow-y-auto scrollbar">
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-[#ff0055] animate-pulse text-[28px]">
            query_stats
          </span>
          <h2 className="text-[20px] font-bold text-[#ff0055] font-label-caps tracking-widest">
            {data.title.toUpperCase()}
          </h2>
        </div>
        <p className="text-white/60 mb-8 text-[13px]">{data.description}</p>
        
        <div className="grid gap-4">
          {options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            return (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSelect(opt, idx)}
              className={`w-full text-left bg-[#0a0a20] hover:bg-[#ff0055]/10 border border-[#2a2a4a] hover:border-[#ff0055]/50 p-5 rounded-lg transition-all group flex flex-col gap-2 relative overflow-hidden ${isLoading && !isSelected ? 'opacity-30 cursor-not-allowed' : ''} ${isLoading && isSelected ? 'opacity-80 ring-2 ring-[#ff0055] cursor-wait' : ''}`}
            >
              {/* Highlight bar on left */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2a2a4a] group-hover:bg-[#ff0055] transition-colors"></div>

              <div className="flex items-center justify-between w-full pl-2">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#00ffcc] group-hover:text-[#ff0055] transition-colors text-[24px]">
                    {opt.type === 'GAME' ? 'sports_esports' : 'auto_awesome_mosaic'}
                  </span>
                  <span className="font-bold text-[14px] text-white tracking-wide">
                    {opt.title}
                    {isLoading && isSelected && <span className="ml-3 text-[#ff0055] animate-pulse text-[12px]">[GENERATING...]</span>}
                  </span>
                </div>
                <span className="text-[9px] font-label-caps px-2 py-1 bg-[#ffffff10] rounded text-white/50 group-hover:bg-[#ff0055] group-hover:text-white transition-colors">
                  {opt.type === 'GAME' ? `TEMPLATE // ${opt.template}` : `SWITCH TO // ${opt.medium}`}
                </span>
              </div>
              <p className="text-[#88aaff] text-[12px] ml-11 pr-4">
                {opt.description}
              </p>
            </button>
          )})}
        </div>
      </div>
    </div>
  );
}
