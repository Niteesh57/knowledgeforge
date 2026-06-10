import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { GameLevel } from '../../../types/chat';
import { useGraphicsEra } from '../../../hooks/useGraphicsEra';

interface Props { level: GameLevel; onWin: () => void; }

export default function WordDecodeGame({ level, onWin }: Props) {
  const era = useGraphicsEra();
  const items = level.items as { answer: string; clues: string[] }[];
  const [itemIndex, setItemIndex] = useState(0);
  const [clueIndex, setClueIndex] = useState(0);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<'none' | 'win' | 'fail'>('none');
  const [totalScore, setTotalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(level.time_limit_seconds || 30);

  const [givenUp, setGivenUp] = useState(false);
  const current = items[itemIndex];

  useEffect(() => {
    if (result !== 'none' || givenUp) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setResult('fail'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [result, itemIndex, givenUp]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (givenUp) return;
    if (input.trim().toLowerCase() === current.answer.toLowerCase()) {
      const earned = Math.max(1, current.clues.length - clueIndex);
      setTotalScore(s => s + earned);
      setResult('win');
      setTimeout(() => {
        if (itemIndex < items.length - 1) {
          setItemIndex(i => i + 1);
          setClueIndex(0);
          setInput('');
          setResult('none');
          setTimeLeft(level.time_limit_seconds || 30);
        } else {
          onWin();
        }
      }, 1000);
    } else {
      setResult('fail');
      setTimeout(() => setResult('none'), 700);
    }
  };

  const handleGiveUp = () => {
    setGivenUp(true);
    setInput(current.answer);
    setResult('fail');
    setTimeout(() => {
      setGivenUp(false);
      setResult('none');
      if (itemIndex < items.length - 1) {
        setItemIndex(i => i + 1);
        setClueIndex(0);
        setInput('');
        setTimeLeft(level.time_limit_seconds || 30);
      } else {
        onWin();
      }
    }, 2000);
  };

  const revealClue = () => {
    if (clueIndex < current.clues.length - 1) setClueIndex(i => i + 1);
  };

  // Scramble display of answer
  const scrambled = givenUp
    ? current.answer
    : current.answer
        .split('')
        .map((c, i) => (i % 2 === 0 && c !== ' ' ? '_' : c))
        .join('');

  return (
    <div className="flex flex-col gap-5 p-6 font-mono h-full max-w-xl mx-auto">
      {/* HUD */}
      <div className="flex justify-between text-[12px]">
        <span>Word <b>{itemIndex + 1}</b> / {items.length}</span>
        <span>⭐ Score: {totalScore}</span>
        <span className={timeLeft <= 10 ? 'text-red-400 font-bold' : ''}>⏱ {timeLeft}s</span>
      </div>

      {/* Scrambled hint */}
      <div className={`text-center py-4 rounded-xl border text-[28px] font-bold tracking-[0.4em] ${
        era === '2026s' ? 'bg-[#a855f7]/10 border-[#a855f7]/30 text-[#d8b4fe]' :
        era === '2000s' ? 'bg-[#e0e0ff] border-[#000080] text-[#000080]' :
        'bg-surface-container border-primary-fixed-dim/30 text-primary-fixed-dim'
      }`}>
        {scrambled}
      </div>

      {/* Clues */}
      <div className="space-y-2">
        <p className="text-[10px] opacity-50 uppercase tracking-widest">Clues revealed:</p>
        {current.clues.slice(0, clueIndex + 1).map((clue, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-2 text-[13px]"
          >
            <span className="text-primary-fixed-dim font-bold shrink-0">#{i + 1}</span>
            <span>{clue}</span>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your answer..."
          autoFocus
          disabled={givenUp}
          className={`flex-1 px-4 py-2.5 font-mono text-[14px] outline-none rounded border transition-colors ${
            result === 'win' ? 'border-green-400 text-green-400 bg-green-900/10' :
            result === 'fail' ? 'border-red-400 text-red-400 bg-red-900/10' :
            era === '2026s' ? 'bg-white/5 border-white/20 text-white focus:border-[#a855f7]/60' :
            era === '2000s' ? 'win95-sunken-field bg-white text-black' :
            'bg-black border-[#2a2a2a] text-white focus:border-primary-fixed-dim'
          }`}
        />
        <button type="submit" disabled={givenUp} className={`px-4 py-2 font-bold text-[12px] rounded border transition-colors ${
          era === '2026s' ? 'bg-[#a855f7] border-transparent text-white hover:bg-[#9333ea]' :
          era === '2000s' ? 'win95-raised text-[#000080] px-4' :
          'border-primary-fixed-dim text-primary-fixed-dim hover:bg-primary-fixed-dim/10'
        }`}>
          SUBMIT
        </button>
      </form>

      {/* Action buttons */}
      <div className="flex flex-col gap-2 items-center">
        {clueIndex < current.clues.length - 1 && (
          <button type="button" onClick={revealClue} disabled={givenUp}
            className="text-[11px] opacity-50 hover:opacity-80 underline cursor-pointer text-center transition-opacity">
            Reveal next clue (-1 point)
          </button>
        )}
        <button type="button" onClick={handleGiveUp} disabled={givenUp}
          className="text-[11px] text-[#ff0055] opacity-70 hover:opacity-100 font-bold transition-opacity">
          [REVEAL ANSWER]
        </button>
      </div>
    </div>
  );
}
