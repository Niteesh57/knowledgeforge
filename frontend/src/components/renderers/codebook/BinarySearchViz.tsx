import { motion } from 'framer-motion';
import type { VizNode } from '../../../types/chat';

interface Props {
  nodes: VizNode[];
  left: string | undefined;
  right: string | undefined;
  mid: string | undefined;
  target: string | number | undefined;
  era: string;
}

export default function BinarySearchViz({ nodes, left, right, mid, target, era }: Props) {
  const accentColor = era === '2026s' ? '#a855f7' : era === '2000s' ? '#000080' : 'var(--theme-primary)';

  return (
    <div className="flex flex-col items-center gap-6 p-6 h-full justify-center">
      {/* Target */}
      {target !== undefined && (
        <div className="flex items-center gap-2 text-[13px] font-mono">
          <span className="opacity-50">Searching for:</span>
          <span className="font-bold px-3 py-1 rounded border" style={{ borderColor: accentColor, color: accentColor }}>
            {target}
          </span>
        </div>
      )}

      {/* Array */}
      <div className="flex gap-1 items-start">
        {nodes.map((node) => {
          const isLeft = left === node.id;
          const isRight = right === node.id;
          const isMid = mid === node.id;
          const isEliminated = node.eliminated;

          return (
            <div key={node.id} className="flex flex-col items-center gap-1">
              {/* Pointer row */}
              <div className="h-5 flex items-end justify-center gap-0.5">
                {isLeft && <span className="text-[9px] font-bold text-blue-400">L</span>}
                {isMid && <span className="text-[9px] font-bold" style={{ color: accentColor }}>M</span>}
                {isRight && <span className="text-[9px] font-bold text-orange-400">R</span>}
              </div>
              {/* Box */}
              <motion.div
                animate={{
                  opacity: isEliminated ? 0.2 : 1,
                  borderColor: isMid ? accentColor : isLeft ? '#60a5fa' : isRight ? '#fb923c' : era === '2000s' ? '#808080' : '#2a2a2a',
                  backgroundColor: isMid
                    ? era === '2026s' ? 'rgba(168,85,247,0.2)' : 'rgba(0,230,57,0.1)'
                    : era === '2000s' ? '#ffffff' : '#0e0e0e',
                }}
                transition={{ duration: 0.3 }}
                className="w-12 h-12 flex items-center justify-center border-2 font-mono font-bold text-[14px]"
              >
                <motion.span
                  key={node.value}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ color: isMid ? accentColor : isEliminated ? '#444' : undefined }}
                >
                  {node.value}
                </motion.span>
              </motion.div>
              <span className="text-[9px] opacity-30 font-mono">[{node.id}]</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-[10px] opacity-60">
        <span className="flex items-center gap-1"><span className="text-blue-400 font-bold">L</span> Left</span>
        <span className="flex items-center gap-1"><span style={{ color: accentColor }} className="font-bold">M</span> Mid</span>
        <span className="flex items-center gap-1"><span className="text-orange-400 font-bold">R</span> Right</span>
        <span className="flex items-center gap-1"><span className="opacity-30">■</span> Eliminated</span>
      </div>
    </div>
  );
}
