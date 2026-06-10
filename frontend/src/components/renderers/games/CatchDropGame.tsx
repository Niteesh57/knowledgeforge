import { useState, useEffect, useRef, useCallback } from 'react';
import type { GameLevel } from '../../../types/chat';
import { useGraphicsEra } from '../../../hooks/useGraphicsEra';

interface Props { level: GameLevel; onWin: () => void; }

interface FallingItem {
  id: number;
  label: string;
  correct: boolean;
  x: number;
  y: number;
  speed: number;
}

export default function CatchDropGame({ level, onWin }: Props) {
  const era = useGraphicsEra();
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [catcherX, setCatcherX] = useState(50);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(level.time_limit_seconds || 30);
  const nextId = useRef(0);
  const frameRef = useRef<number>(0);
  const lastSpawn = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const accentColor = era === '2026s' ? '#a855f7' : era === '2000s' ? '#000080' : 'var(--theme-primary)';

  const spawnItem = useCallback(() => {
    const pool = level.items as { label: string; correct: boolean }[];
    const src = pool[Math.floor(Math.random() * pool.length)];
    setItems(prev => [...prev, {
      id: nextId.current++,
      label: src.label,
      correct: src.correct,
      x: Math.random() * 85 + 5,
      y: 0,
      speed: 0.4 + Math.random() * 0.4,
    }]);
  }, [level.items]);

  useEffect(() => {
    if (won || gameOver) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setGameOver(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [won, gameOver]);

  useEffect(() => {
    if (won || gameOver) { cancelAnimationFrame(frameRef.current); return; }
    const loop = (ts: number) => {
      if (ts - lastSpawn.current > 1200) {
        spawnItem();
        lastSpawn.current = ts;
      }
      setItems(prev =>
        prev
          .map(item => ({ ...item, y: item.y + item.speed }))
          .filter(item => {
            if (item.y >= 88) {
              if (item.correct) setMissed(m => m + 1);
              return false;
            }
            return true;
          })
      );
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [won, gameOver, spawnItem]);

  // Mouse / touch move on container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setCatcherX(Math.max(5, Math.min(95, pct)));
  };

  // Check catches
  useEffect(() => {
    setItems(prev => {
      const surviving: FallingItem[] = [];
      let gained = 0;
      prev.forEach(item => {
        if (item.y >= 82 && item.y <= 92 && Math.abs(item.x - catcherX) < 12) {
          if (item.correct) gained++;
        } else {
          surviving.push(item);
        }
      });
      if (gained > 0) setScore(s => {
        const ns = s + gained;
        if (ns >= (level.win_score || 5)) setWon(true);
        return ns;
      });
      return surviving;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const handleRevealAnswer = () => {
    setItems(prev => {
      const correctItem = prev.find(i => i.correct);
      if (correctItem) {
        setScore(s => {
          const ns = s + 1;
          if (ns >= (level.win_score || 5)) setWon(true);
          return ns;
        });
        return prev.filter(i => i.id !== correctItem.id);
      }
      return prev;
    });
  };

  const panelCls = era === '2026s'
    ? 'relative w-full h-[420px] overflow-hidden rounded-xl border border-white/10 bg-[#0b0615] cursor-none select-none'
    : era === '2000s'
    ? 'relative w-full h-[420px] overflow-hidden win95-sunken bg-white cursor-none select-none'
    : 'relative w-full h-[420px] overflow-hidden bg-black border border-[#1a1a1a] cursor-none select-none';

  return (
    <div className="flex flex-col gap-3 p-4 font-mono h-full">
      {/* HUD */}
      <div className="flex justify-between text-[12px] items-center">
        <div className="flex gap-4">
          <span>⭐ Score: <b>{score}</b> / {level.win_score}</span>
          <span>⏱ {timeLeft}s</span>
          <span>💥 Missed: {missed}</span>
        </div>
        <button type="button" onClick={handleRevealAnswer} className="text-[11px] text-[#ff0055] opacity-70 hover:opacity-100 font-bold transition-opacity">
          [REVEAL ANSWER]
        </button>
      </div>

      {/* Arena */}
      <div ref={containerRef} className={panelCls} onMouseMove={handleMouseMove}>
        {/* Stars bg */}
        {era === '1990s' && (
          <div className="absolute inset-0 opacity-10"
            style={{ background: 'radial-gradient(ellipse at center, var(--theme-glow-light) 0%, transparent 70%)' }} />
        )}

        {/* Falling items */}
        {items.map(item => (
          <div
            key={item.id}
            className={`absolute px-3 py-1 text-[12px] font-bold rounded border transition-none ${
              item.correct
                ? era === '2026s' ? 'border-[#a855f7] text-[#d8b4fe] bg-[#a855f7]/20'
                  : era === '2000s' ? 'border-[#000080] text-[#000080] bg-blue-100'
                  : 'border-primary-fixed-dim text-primary-fixed-dim bg-primary-fixed-dim/10'
                : 'border-red-500 text-red-400 bg-red-900/20'
            }`}
            style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translateX(-50%)' }}
          >
            {item.label}
          </div>
        ))}

        {/* Catcher */}
        <div
          className="absolute bottom-[8%] h-3 rounded-full transition-none"
          style={{
            left: `${catcherX}%`,
            width: '22%',
            transform: 'translateX(-50%)',
            background: accentColor,
            boxShadow: `0 0 12px ${accentColor}`,
          }}
        />

        {/* Win / GameOver overlays */}
        {(won || gameOver) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
            <p className="text-[24px] font-bold mb-2">{won ? '🎉 CAUGHT IT!' : '⏰ TIME UP'}</p>
            <p className="text-[13px] opacity-70 mb-4">{won ? 'Level complete!' : `Score: ${score}/${level.win_score}`}</p>
            {won
              ? <button type="button" onClick={onWin} className="px-6 py-2 border border-primary-fixed-dim text-primary-fixed-dim font-bold hover:bg-primary-fixed-dim/10 transition-colors">REVEAL CONCEPT →</button>
              : <button type="button" onClick={() => { setScore(0); setMissed(0); setItems([]); setTimeLeft(level.time_limit_seconds); setGameOver(false); }} className="px-6 py-2 border border-red-400 text-red-400 font-bold hover:bg-red-400/10 transition-colors">TRY AGAIN</button>
            }
          </div>
        )}
      </div>

      <p className="text-[11px] opacity-50 text-center">Move mouse to control the catcher. Catch correct items!</p>
    </div>
  );
}
