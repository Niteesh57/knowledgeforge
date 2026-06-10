import { useState } from 'react';
import { motion } from 'framer-motion';
import type { GameLevel } from '../../../types/chat';
import { useGraphicsEra } from '../../../hooks/useGraphicsEra';

interface Props { level: GameLevel; onWin: () => void; }

export default function BinaryJumpGame({ level, onWin }: Props) {
  const era = useGraphicsEra();
  const questions = level.items as { question: string; platform_label: string; correct: boolean }[];
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<'none' | 'right' | 'wrong'>('none');

  const current = questions[index];

  const handleChoice = (_label: string, isCorrect: boolean) => {
    if (result !== 'none') return;
    setResult(isCorrect ? 'right' : 'wrong');
    if (isCorrect) setScore(s => s + 1);
    setTimeout(() => {
      if (index < questions.length - 1) {
        setIndex(i => i + 1);
        setResult('none');
      } else {
        onWin();
      }
    }, 1000);
  };


  const handleRevealAnswer = () => {
    if (result !== 'none') return;
    const correctLabel = ['True', 'False'].find((label) => (label === current.platform_label) === current.correct)!;
    
    // Auto complete by calling handleChoice
    handleChoice(correctLabel, true);
  };

  return (
    <div className="flex flex-col items-center gap-8 p-6 font-mono h-full">
      {/* Progress */}
      <div className="flex gap-1">
        {questions.map((_, i) => (
          <span key={i} className={`w-3 h-3 rounded-full transition-all ${
            i < index ? 'bg-green-400' :
            i === index ? 'bg-primary-fixed-dim scale-125' :
            'bg-[#2a2a2a]'
          }`} />
        ))}
      </div>

      {/* HUD */}
      <div className="flex justify-between w-full max-w-lg items-center">
        <p className="text-[12px] opacity-60">Score: {score} / {questions.length}</p>
        <button type="button" onClick={handleRevealAnswer} disabled={result !== 'none'} className="text-[11px] text-[#ff0055] opacity-70 hover:opacity-100 font-bold transition-opacity">
          [REVEAL ANSWER]
        </button>
      </div>

      {/* Question */}
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-lg text-center px-6 py-5 rounded-xl border text-[15px] font-bold ${
          era === '2026s' ? 'bg-white/5 border-white/10 text-white' :
          era === '2000s' ? 'win95-raised text-[#000080] bg-[#efeded]' :
          'bg-surface-container border-[#2a2a2a] text-on-surface'
        }`}
      >
        {current.question}
      </motion.div>

      {/* Platforms / choices */}
      <div className="flex gap-8 w-full max-w-sm justify-center">
        {['True', 'False'].map((label) => {
          const choosingThisWins = (label === current.platform_label) === current.correct;

          return (
            <motion.button
              key={label}
              type="button"
              whileHover={{ y: -6, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleChoice(label, choosingThisWins)}
              className={`flex-1 py-8 rounded-xl border-2 font-bold text-[16px] cursor-pointer transition-all ${
                result === 'none'
                  ? era === '2026s'
                    ? 'bg-[#a855f7]/10 border-[#a855f7]/40 text-[#d8b4fe] hover:bg-[#a855f7]/20'
                    : era === '2000s'
                    ? 'win95-raised text-[#000080] hover:bg-[#e0e0ff]'
                    : 'bg-surface-container border-primary-fixed-dim/30 text-primary-fixed-dim hover:bg-primary-fixed-dim/10'
                  : result === 'right' && choosingThisWins
                  ? 'bg-green-600/20 border-green-400 text-green-300'
                  : result === 'wrong' && !choosingThisWins
                  ? 'bg-red-600/20 border-red-400 text-red-300'
                  : 'opacity-40 border-[#2a2a2a]'
              }`}
            >
              {label === 'True' ? '⬆ TRUE' : '⬇ FALSE'}
            </motion.button>
          );
        })}
      </div>

      {result !== 'none' && (
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-[14px] font-bold ${result === 'right' ? 'text-green-400' : 'text-red-400'}`}
        >
          {result === 'right' ? '✓ CORRECT!' : '✗ WRONG!'}
        </motion.p>
      )}

      <p className="text-[11px] opacity-40 text-center mt-auto">Jump on True or False to answer each question</p>
    </div>
  );
}
