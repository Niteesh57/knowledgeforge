import { motion, AnimatePresence } from 'framer-motion';
import type { VizNode } from '../../../types/chat';

interface Props {
  nodes: VizNode[];
  pointer: string | null | undefined;
  era: string;
}

export default function ArrayViz({ nodes, pointer, era }: Props) {
  const accentColor = era === '2026s' ? '#a855f7' : era === '2000s' ? '#000080' : 'var(--theme-primary)';

  return (
    <div className="flex flex-col items-center gap-6 p-6 h-full justify-center">
      {/* Array boxes */}
      <div className="flex gap-1 items-end">
        <AnimatePresence>
          {nodes.map((node) => (
            <motion.div
              key={node.id}
              layout
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-1"
            >
              {/* Index label */}
              <span className="text-[10px] opacity-40 font-mono">[{node.id}]</span>
              {/* Box */}
              <motion.div
                animate={{
                  borderColor: node.active ? accentColor : era === '2000s' ? '#808080' : '#2a2a2a',
                  backgroundColor: node.active
                    ? era === '2026s' ? 'rgba(168,85,247,0.2)' : 'rgba(0,230,57,0.1)'
                    : era === '2000s' ? '#ffffff' : '#0e0e0e',
                  boxShadow: node.active
                    ? `0 0 12px ${era === '2026s' ? 'rgba(168,85,247,0.5)' : 'rgba(0,230,57,0.4)'}`
                    : 'none',
                }}
                transition={{ duration: 0.3 }}
                className="w-14 h-14 flex items-center justify-center border-2 font-mono font-bold text-[14px]"
                style={{ borderColor: node.active ? accentColor : era === '2000s' ? '#808080' : '#2a2a2a' }}
              >
                <motion.span
                  key={node.value}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={node.active
                    ? era === '2026s' ? 'text-[#d8b4fe]' : era === '2000s' ? 'text-[#000080]' : 'text-primary-fixed-dim'
                    : 'text-on-surface-variant'}
                >
                  {node.value}
                </motion.span>
              </motion.div>
              {/* Pointer */}
              {pointer === node.id && (
                <motion.span
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] font-bold"
                  style={{ color: accentColor }}
                >
                  ▲ ptr
                </motion.span>
              )}
              {/* Label */}
              <span className="text-[10px] opacity-50 font-mono max-w-[56px] truncate text-center">{node.label}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
