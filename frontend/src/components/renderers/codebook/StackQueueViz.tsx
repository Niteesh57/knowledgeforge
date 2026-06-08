import { motion, AnimatePresence } from 'framer-motion';
import type { VizNode } from '../../../types/chat';

interface Props { type: 'stack' | 'queue'; items: VizNode[]; operation: string | null | undefined; era: string; }

export default function StackQueueViz({ type, items, operation, era }: Props) {
  const accentColor = era === '2026s' ? '#a855f7' : era === '2000s' ? '#000080' : 'var(--theme-primary)';
  const isStack = type === 'stack';

  return (
    <div className="flex flex-col items-center gap-4 p-6 h-full justify-center">
      {/* Operation label */}
      {operation && (
        <motion.div
          key={operation}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[12px] font-bold font-mono px-4 py-1 rounded border"
          style={{ borderColor: accentColor, color: accentColor, background: `${accentColor}15` }}
        >
          {operation.toUpperCase()}
        </motion.div>
      )}

      {/* Stack / Queue container */}
      <div className={`flex ${isStack ? 'flex-col-reverse' : 'flex-row'} gap-1.5 items-center`}>
        {/* Stack: top label */}
        {isStack && <div className="text-[10px] opacity-40 font-mono mb-1">← TOP</div>}

        <AnimatePresence>
          {(isStack ? [...items].reverse() : items).map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.7, [isStack ? 'y' : 'x']: isStack ? -20 : -20 }}
              animate={{ opacity: 1, scale: item.active ? 1.05 : 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="flex items-center justify-center border-2 font-mono font-bold text-[13px]"
              style={{
                width: isStack ? 120 : 60,
                height: isStack ? 44 : 60,
                borderColor: item.active ? accentColor : era === '2000s' ? '#808080' : '#2a2a2a',
                backgroundColor: item.active
                  ? era === '2026s' ? 'rgba(168,85,247,0.2)' : 'rgba(0,230,57,0.1)'
                  : era === '2000s' ? '#ffffff' : '#111',
                color: item.active ? accentColor : undefined,
                boxShadow: item.active ? `0 0 10px ${accentColor}55` : 'none',
              }}
            >
              <motion.span key={item.value} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {item.value}
              </motion.span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Queue: right label */}
        {!isStack && <div className="text-[10px] opacity-40 font-mono ml-1">FRONT →</div>}
      </div>

      {/* Stack: bottom label */}
      {isStack && <div className="text-[10px] opacity-40 font-mono mt-1">↑ BOTTOM</div>}

      {/* Type badge */}
      <div className="flex items-center gap-2 text-[11px] opacity-50">
        <span>{isStack ? 'LIFO — Last In, First Out' : 'FIFO — First In, First Out'}</span>
      </div>
    </div>
  );
}
