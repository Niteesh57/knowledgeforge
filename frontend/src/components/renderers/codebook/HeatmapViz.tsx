import { motion } from 'framer-motion';
import type { HeatCell } from '../../../types/chat';

interface Props { cells: HeatCell[]; rows: number; cols: number; era: string; }

export default function HeatmapViz({ cells, rows, cols, era }: Props) {
  const accentColor = era === '2026s' ? '#a855f7' : era === '2000s' ? '#000080' : 'var(--theme-primary)';
  const cellMap = Object.fromEntries(cells.map(c => [`${c.row}-${c.col}`, c]));

  const getColor = (intensity: number, active: boolean) => {
    if (active) return accentColor;
    if (intensity <= 0) return era === '2000s' ? '#f5f5f5' : '#111';
    const alpha = Math.min(1, 0.1 + intensity * 0.9);
    if (era === '2026s') return `rgba(168,85,247,${alpha})`;
    if (era === '2000s') return `rgba(0,0,128,${alpha})`;
    return `rgba(0,230,57,${alpha})`;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 h-full justify-center">
      {/* Column headers */}
      <div className="flex gap-1 ml-6">
        {Array.from({ length: cols }, (_, c) => (
          <div key={c} className="w-12 text-center text-[10px] opacity-40 font-mono">{c}</div>
        ))}
      </div>

      <div className="flex gap-1">
        {/* Row headers */}
        <div className="flex flex-col gap-1 items-end">
          {Array.from({ length: rows }, (_, r) => (
            <div key={r} className="w-5 h-12 flex items-center text-[10px] opacity-40 font-mono">{r}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex flex-col gap-1">
          {Array.from({ length: rows }, (_, r) => (
            <div key={r} className="flex gap-1">
              {Array.from({ length: cols }, (_, c) => {
                const cell = cellMap[`${r}-${c}`];
                return (
                  <motion.div
                    key={`${r}-${c}`}
                    animate={{
                      backgroundColor: getColor(cell?.intensity ?? 0, cell?.active ?? false),
                      boxShadow: cell?.active ? `0 0 10px ${accentColor}88` : 'none',
                      scale: cell?.active ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-12 h-12 flex items-center justify-center border font-mono text-[12px] font-bold"
                    style={{ borderColor: era === '2000s' ? '#c0c0c0' : '#1a1a1a' }}
                  >
                    <motion.span
                      key={cell?.value}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ color: cell?.active ? '#fff' : (cell?.intensity ?? 0) > 0.5 ? '#fff' : undefined }}
                    >
                      {cell?.value ?? '0'}
                    </motion.span>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
