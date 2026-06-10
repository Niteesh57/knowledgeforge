import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameLevel } from '../../../types/chat';
import { useGraphicsEra } from '../../../hooks/useGraphicsEra';

interface Props { level: GameLevel; onWin: () => void; }

export default function SequenceSortGame({ level, onWin }: Props) {
  const era = useGraphicsEra();
  const sourceItems = (level.items as { order: number; label: string }[]).sort(() => Math.random() - 0.5);
  const [bank, setBank] = useState(sourceItems);
  const [placed, setPlaced] = useState<typeof sourceItems>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [won, setWon] = useState(false);

  const sorted = [...level.items as { order: number; label: string }[]].sort((a, b) => a.order - b.order);

  const addToSequence = (item: typeof sourceItems[0]) => {
    const expectedNext = sorted[placed.length];
    if (item.order === expectedNext.order) {
      const newPlaced = [...placed, item];
      setPlaced(newPlaced);
      setBank(bank.filter(b => b.order !== item.order));
      if (newPlaced.length === sorted.length) {
        setWon(true);
        setTimeout(onWin, 1200);
      }
    } else {
      setWrong(item.order);
      setTimeout(() => setWrong(null), 700);
    }
  };

  const removeFromSequence = (item: typeof placed[0]) => {
    if (won) return;
    setPlaced(placed.filter(p => p.order !== item.order));
    setBank(prev => [...prev, item].sort(() => Math.random() - 0.5));
  };

  const handleRevealAnswer = () => {
    if (won) return;
    const expectedNext = sorted[placed.length];
    if (!expectedNext) return;
    
    // Find it in the bank
    const itemInBank = bank.find(b => b.order === expectedNext.order);
    if (itemInBank) {
      addToSequence(itemInBank);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-4 font-mono h-full">
      <div className="flex justify-between text-[12px] w-full items-center">
        <p className="opacity-60 text-center">Tap the steps in the CORRECT order ↓</p>
        <button type="button" onClick={handleRevealAnswer} disabled={won} className="text-[11px] text-[#ff0055] opacity-70 hover:opacity-100 font-bold transition-opacity">
          [REVEAL ANSWER]
        </button>
      </div>

      {/* Sequence slots (target) */}
      <div className="flex flex-col gap-2">
        {sorted.map((slot, i) => {
          const placedItem = placed[i];
          return (
            <motion.div
              key={slot.order}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded border text-[13px] cursor-pointer transition-all ${
                placedItem
                  ? era === '2026s' ? 'bg-[#a855f7]/15 border-[#a855f7]/50 text-[#d8b4fe]'
                    : era === '2000s' ? 'bg-[#e0e0ff] border-[#000080] text-[#000080] font-bold'
                    : 'bg-primary-fixed-dim/10 border-primary-fixed-dim text-primary-fixed-dim'
                  : era === '2000s' ? 'bg-white border-[#808080] text-[#808080]'
                  : 'bg-transparent border-[#2a2a2a] text-on-surface-variant/40'
              }`}
              onClick={() => placedItem && removeFromSequence(placedItem)}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                placedItem ? 'bg-primary-fixed-dim text-on-primary' : 'bg-[#1a1a1a] text-on-surface-variant/40'
              }`}>
                {i + 1}
              </span>
              <span className="flex-1">{placedItem?.label ?? '— tap a step below —'}</span>
              {placedItem && <span className="text-[10px] opacity-40">click to remove</span>}
            </motion.div>
          );
        })}
      </div>

      <div className={`border-t pt-4 ${era === '2000s' ? 'border-[#808080]' : 'border-[#2a2a2a]'}`}>
        <p className="text-[10px] opacity-40 mb-2 text-center">STEP BANK</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <AnimatePresence>
            {bank.map(item => (
              <motion.button
                key={item.order}
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: wrong === item.order ? [1, 0.3, 1] : 1, scale: wrong === item.order ? [1, 0.95, 1] : 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => addToSequence(item)}
                className={`px-4 py-2 rounded text-[12px] font-bold border transition-all cursor-pointer ${
                  wrong === item.order
                    ? 'border-red-500 text-red-400 bg-red-900/20'
                    : era === '2026s' ? 'border-[#a855f7]/40 text-[#d8b4fe] bg-[#a855f7]/10 hover:bg-[#a855f7]/20'
                    : era === '2000s' ? 'win95-raised text-[#000080] hover:bg-[#e0e0ff]'
                    : 'border-[#2a2a2a] text-on-surface hover:border-primary-fixed-dim hover:text-primary-fixed-dim'
                }`}
              >
                {item.label}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {won && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-green-400 font-bold text-[14px]"
        >
          🎉 Perfect sequence!
        </motion.div>
      )}
    </div>
  );
}
