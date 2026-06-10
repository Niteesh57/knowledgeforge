import { useState, useEffect } from 'react';
import type { GameLevel } from '../../../types/chat';
import { useGraphicsEra } from '../../../hooks/useGraphicsEra';

interface Props { level: GameLevel; onWin: () => void; }

export default function MemoryFlipGame({ level, onWin }: Props) {
  const era = useGraphicsEra();
  const pairs = (level.items as { term: string; definition: string }[]).slice(0, 6);

  // Build shuffled card deck: [id, content, pairId, isterm]
  type Card = { id: number; content: string; pairId: number; isTerm: boolean; };
  const [cards] = useState<Card[]>(() => {
    const deck: Card[] = [];
    pairs.forEach((p, i) => {
      deck.push({ id: i * 2, content: p.term, pairId: i, isTerm: true });
      deck.push({ id: i * 2 + 1, content: p.definition, pairId: i, isTerm: false });
    });
    return deck.sort(() => Math.random() - 0.5);
  });

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [checking, setChecking] = useState(false);
  const [moves, setMoves] = useState(0);

  const handleFlip = (id: number) => {
    if (checking || flipped.includes(id) || matched.includes(id)) return;
    if (flipped.length === 2) return;
    setFlipped(prev => [...prev, id]);
  };

  useEffect(() => {
    if (flipped.length !== 2) return;
    setChecking(true);
    setMoves(m => m + 1);
    const [a, b] = flipped.map(id => cards.find(c => c.id === id)!);
    const isMatch = a.pairId === b.pairId && a.isTerm !== b.isTerm;
    setTimeout(() => {
      if (isMatch) {
        setMatched(prev => {
          const nm = [...prev, a.id, b.id];
          if (nm.length === cards.length) onWin();
          return nm;
        });
      }
      setFlipped([]);
      setChecking(false);
    }, 900);
  }, [flipped, cards, onWin]);

  const handleRevealAnswer = () => {
    if (checking) return;
    
    // Find an unmatched pair
    const unmatched = cards.filter(c => !matched.includes(c.id));
    if (unmatched.length === 0) return;
    
    // Pick the first unmatched card, and its pair
    const card1 = unmatched[0];
    const card2 = unmatched.find(c => c.pairId === card1.pairId && c.id !== card1.id)!;
    
    // Automatically reveal and match them
    setFlipped([card1.id, card2.id]);
    setChecking(true);
    setMoves(m => m + 1);
    
    setTimeout(() => {
      setMatched(prev => {
        const nm = [...prev, card1.id, card2.id];
        if (nm.length === cards.length) onWin();
        return nm;
      });
      setFlipped([]);
      setChecking(false);
    }, 1500);
  };
  return (
    <div className="flex flex-col gap-4 p-4 font-mono h-full">
      <div className="flex justify-between text-[12px] items-center">
        <div className="flex gap-4">
          <span>🃏 Pairs found: <b>{matched.length / 2}</b> / {pairs.length}</span>
          <span>🔄 Moves: {moves}</span>
        </div>
        <button type="button" onClick={handleRevealAnswer} disabled={checking} className="text-[11px] text-[#ff0055] opacity-70 hover:opacity-100 font-bold transition-opacity">
          [REVEAL ANSWER]
        </button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {cards.map(card => {
          const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
          const isMatched = matched.includes(card.id);
          return (
            <div
              key={card.id}
              className="relative w-full aspect-[3/2] cursor-pointer rounded-lg select-none transition-transform duration-300"
              style={{ perspective: '600px' }}
              onClick={() => handleFlip(card.id)}
            >
              <div style={{
                width: '100%', height: '100%', position: 'relative',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.4s',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}>
                {/* Back (hidden face) */}
                <div style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}
                  className={`flex items-center justify-center rounded-lg text-[20px] ${
                    era === '2026s' ? 'bg-[#a855f7]/20 border border-[#a855f7]/40' :
                    era === '2000s' ? 'win95-raised bg-[#efeded]' :
                    'bg-surface-container border border-[#2a2a2a]'
                  }`}
                >
                  ?
                </div>
                {/* Front (content) */}
                <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', position: 'absolute', inset: 0 }}
                  className={`flex items-center justify-center p-2 text-center text-[11px] font-bold rounded-lg ${
                    isMatched
                      ? 'bg-green-600/20 border-2 border-green-400 text-green-300'
                      : era === '2026s'
                      ? 'bg-[#281845] border border-[#a855f7] text-[#d8b4fe]'
                      : era === '2000s'
                      ? 'bg-[#e0e0ff] border-2 border-[#000080] text-[#000080]'
                      : 'bg-surface-container border border-primary-fixed-dim text-primary-fixed-dim'
                  }`}
                >
                  {card.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] opacity-50 text-center">Flip cards to match each term with its definition.</p>
    </div>
  );
}
