import { useState } from 'react';
import { motion } from 'framer-motion';
import type { GameLevel } from '../../../types/chat';
import { useGraphicsEra } from '../../../hooks/useGraphicsEra';

interface Props { level: GameLevel; onWin: () => void; }

export default function MazeEscapeGame({ level, onWin }: Props) {
  const era = useGraphicsEra();
  const choices = level.items as { choice_label: string; is_correct_path: boolean; explanation: string }[];
  const [step, setStep] = useState(0);
  const [path, setPath] = useState<string[]>([]);
  const [failed, setFailed] = useState<number | null>(null);
  const [won, setWon] = useState(false);

  // For the maze, we show 2-3 choices at each step. Filter by step groups
  // We'll treat items as sequential gates: all "incorrect" items are shown alongside ONE correct
  const correctItem = choices.find(c => c.is_correct_path);
  const wrongItems = choices.filter(c => !c.is_correct_path);

  // Build gates: each gate has 1 correct + 1 decoy
  const gates = correctItem
    ? Array.from({ length: Math.min(wrongItems.length, 4) }, (_, i) => ({
        correct: correctItem,
        decoy: wrongItems[i % wrongItems.length],
        shuffled: Math.random() > 0.5
          ? [correctItem, wrongItems[i % wrongItems.length]]
          : [wrongItems[i % wrongItems.length], correctItem],
      }))
    : [];

  const totalGates = gates.length || 3;

  const handleChoice = (isCorrect: boolean, explanation: string, gateIndex: number) => {
    if (isCorrect) {
      setPath(prev => [...prev, explanation]);
      if (step + 1 >= totalGates) {
        setWon(true);
        setTimeout(onWin, 1200);
      } else {
        setStep(s => s + 1);
      }
    } else {
      setFailed(gateIndex);
      setTimeout(() => setFailed(null), 800);
    }
  };

  const gate = gates[step];

  const handleRevealAnswer = () => {
    if (won || failed !== null) return;
    const correctChoice = gate?.correct;
    if (correctChoice) {
      handleChoice(true, correctChoice.explanation, step);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-6 font-mono h-full max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-1">
        {Array.from({ length: totalGates }).map((_, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold ${
              i < step ? 'bg-green-400 text-black' :
              i === step ? 'bg-primary-fixed-dim text-on-primary' :
              'bg-[#2a2a2a] text-on-surface-variant'
            }`}>
              {i < step ? '✓' : i + 1}
            </span>
            {i < totalGates - 1 && (
              <div className={`h-0.5 w-6 transition-colors ${i < step ? 'bg-green-400' : 'bg-[#2a2a2a]'}`} />
            )}
          </div>
        ))}
        <span className="text-[11px] ml-2 opacity-50">Gate {step + 1} of {totalGates}</span>
        <div className="flex-1"></div>
        <button type="button" onClick={handleRevealAnswer} disabled={won || failed !== null} className="text-[11px] text-[#ff0055] opacity-70 hover:opacity-100 font-bold transition-opacity whitespace-nowrap">
          [REVEAL ANSWER]
        </button>
      </div>

      {/* Maze visual */}
      <div className={`relative p-4 rounded-xl border ${
        era === '2026s' ? 'bg-[#0b0615] border-white/10' :
        era === '2000s' ? 'win95-sunken bg-white' :
        'bg-black border-[#1a1a1a]'
      }`}>
        <p className="text-[11px] opacity-40 mb-3 text-center uppercase tracking-widest">CHOOSE THE CORRECT PATH</p>

        {gate ? (
          <div className="flex gap-4 justify-center">
            {gate.shuffled.map((choice, i) => (
              <motion.button
                key={i}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleChoice(choice.is_correct_path, choice.explanation, step)}
                animate={failed === step && !choice.is_correct_path ? { x: [-4, 4, -4, 0] } : {}}
                className={`flex-1 px-4 py-5 rounded-lg border text-[13px] font-bold cursor-pointer transition-all ${
                  failed === step && !choice.is_correct_path
                    ? 'border-red-500 text-red-400 bg-red-900/20'
                    : era === '2026s'
                    ? 'border-[#a855f7]/30 text-[#d8b4fe] bg-[#a855f7]/5 hover:bg-[#a855f7]/15'
                    : era === '2000s'
                    ? 'win95-raised text-[#000080] hover:bg-[#e0e0ff]'
                    : 'border-[#2a2a2a] text-on-surface hover:border-primary-fixed-dim hover:text-primary-fixed-dim'
                }`}
              >
                {i === 0 ? '← ' : '→ '}{choice.choice_label}
              </motion.button>
            ))}
          </div>
        ) : (
          <p className="text-center text-red-400 text-[13px]">No maze data available</p>
        )}
      </div>

      {/* Correct path so far */}
      {path.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] opacity-40 uppercase tracking-widest">Path taken:</p>
          {path.map((p, i) => (
            <p key={i} className="text-[12px] text-green-400">✓ {p}</p>
          ))}
        </div>
      )}

      {won && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-green-400 font-bold text-[14px]">
          🗝️ You escaped the maze!
        </motion.p>
      )}
    </div>
  );
}
