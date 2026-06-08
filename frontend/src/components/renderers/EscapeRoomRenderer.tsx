import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, CheckCircle, XCircle } from 'lucide-react';
import BevelContainer from '../ui/BevelContainer';
import RetroButton from '../ui/RetroButton';

const EscapeRoomRenderer = ({ data }: { data: any }) => {
  const puzzles = data.content?.puzzles || [];
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'none' | 'success' | 'error'>('none');
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (puzzles.length === 0) {
    return (
      <div className="p-8 text-red-500 font-mono">
        [ ERROR: NO INTERACTIVE PUZZLE MATRICES FOUND ]
      </div>
    );
  }

  const puzzle = puzzles[currentPuzzle];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (input.toLowerCase().trim() === puzzle.answer.toLowerCase().trim()) {
      setFeedback('success');
      setTimeout(() => {
        if (currentPuzzle < puzzles.length - 1) {
          setCurrentPuzzle((c) => c + 1);
          setInput('');
          setFeedback('none');
          setShowHint(false);
        } else {
          setCompleted(true);
        }
      }, 1200);
    } else {
      setFeedback('error');
      setTimeout(() => setFeedback('none'), 1200);
    }
  };

  const handleRestart = () => {
    setCurrentPuzzle(0);
    setInput('');
    setFeedback('none');
    setShowHint(false);
    setCompleted(false);
  };

  const handleRevealAnswer = () => {
    setInput(puzzle.answer);
    setFeedback('success');
    setTimeout(() => {
      if (currentPuzzle < puzzles.length - 1) {
        setCurrentPuzzle((c) => c + 1);
        setInput('');
        setFeedback('none');
        setShowHint(false);
      } else {
        setCompleted(true);
      }
    }, 2000); // 2 seconds to see the revealed answer
  };

  if (completed) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center font-mono">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-surface-container p-6 rounded-xl border border-[#2a2a2a] text-center"
        >
          <div className="text-primary-fixed-dim text-6xl mb-4 animate-bounce">
            <span className="material-symbols-outlined text-[64px]">verified</span>
          </div>
          <h3 className="text-xl font-bold font-label-caps text-primary-fixed-dim mb-2 tracking-widest">
            DECRYPTION COMPLETE
          </h3>
          <p className="text-on-surface-variant text-[13px] mb-6 leading-relaxed">
            All system overrides have been resolved. The knowledge lock has been fully decoded.
          </p>
          <div className="flex gap-3 justify-center">
            <RetroButton onClick={handleRestart}>
              RE-RUN SIMULATION
            </RetroButton>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col items-center justify-center font-mono">
      <motion.div
        key={currentPuzzle}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-surface-container-lowest p-6 md:p-8 border border-[#2a2a2a] shadow-[0_0_30px_var(--theme-glow-light)] text-primary-fixed-dim bevel-raised"
      >
        {/* Terminal Header */}
        <div className="flex justify-between items-center mb-6 border-b border-[#2a2a2a] pb-3">
          <div className="flex items-center gap-3">
            <Terminal size={18} className="text-primary-fixed-dim" />
            <span className="text-[12px] font-bold tracking-widest font-label-caps">
              SYSTEM_OVERRIDE_REQUIRED [STAGE 0{currentPuzzle + 1}/0{puzzles.length}]
            </span>
          </div>
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
        </div>

        {/* Puzzle Description */}
        <div className="mb-6 text-[14px]">
          <p className="mb-4 text-on-surface-variant leading-relaxed">
            {puzzle.context}
          </p>
          <BevelContainer
            variant="sunken"
            className="bg-black/50 p-4 border border-[#080808] font-bold text-white text-[15px]"
          >
            {puzzle.question}
          </BevelContainer>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-fixed-dim font-bold">
            &gt;
          </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={feedback !== 'none'}
            placeholder="Type answer here..."
            className={`w-full bg-black border-2 py-3.5 pl-9 pr-4 text-white focus:outline-none transition-colors font-mono text-[15px]
              ${
                feedback === 'error'
                  ? 'border-red-500 text-red-500'
                  : feedback === 'success'
                  ? 'border-primary-fixed-dim text-primary-fixed-dim'
                  : 'border-[#2a2a2a] focus:border-primary-fixed-dim'
              }`}
            autoFocus
          />
        </form>

        {/* Action Indicators & Hints */}
        <div className="mt-4 flex justify-between items-center h-10">
          <div>
            {feedback === 'error' && (
              <span className="text-red-500 flex items-center gap-2 text-[12px] font-bold">
                <XCircle size={16} /> ACCESS DENIED
              </span>
            )}
            {feedback === 'success' && (
              <span className="text-primary-fixed-dim flex items-center gap-2 text-[12px] font-bold">
                <CheckCircle size={16} /> ACCESS GRANTED
              </span>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleRevealAnswer}
              className="text-on-surface-variant hover:text-red-500 text-[11px] font-bold underline cursor-pointer transition-colors"
            >
              GIVE UP
            </button>
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="text-on-surface-variant hover:text-primary-fixed-dim text-[11px] font-bold underline cursor-pointer transition-colors"
            >
              REQUEST HINT
            </button>
          </div>
        </div>

        {/* Hint Box */}
        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-primary-fixed-dim/5 text-primary-fixed-dim/90 text-[13px] border border-primary-fixed-dim/20 leading-relaxed"
          >
            <span className="font-bold block mb-1">[ TRANSMISSION DECODED ]:</span>
            {puzzle.hint}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default EscapeRoomRenderer;
