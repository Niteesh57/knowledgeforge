import { motion } from 'framer-motion';
import type { VizNode } from '../../../types/chat';

interface Props { nodes: VizNode[]; era: string; comparing: string[] | null | undefined; }

export default function SortingViz({ nodes, era, comparing }: Props) {
  const accentColor = era === '2026s' ? '#a855f7' : era === '2000s' ? '#000080' : 'var(--theme-primary)';
  const maxHeight = Math.max(...nodes.map(n => n.height ?? parseInt(n.value) ?? 10), 1);

  return (
    <div className="flex flex-col items-center justify-end gap-4 p-6 h-full">
      {/* Bar chart */}
      <div className="flex items-end gap-1.5 w-full max-w-lg justify-center" style={{ height: '70%' }}>
        {nodes.map((node) => {
          const h = node.height ?? parseInt(node.value) ?? 10;
          const pct = Math.max(4, (h / maxHeight) * 100);
          const isComparing = comparing?.includes(node.id);
          const barColor = node.sorted
            ? 'rgb(74, 222, 128)' // green when sorted
            : isComparing
            ? 'rgb(251, 146, 60)' // orange when comparing
            : node.active
            ? accentColor
            : era === '2000s' ? '#000080aa' : 'rgba(var(--theme-primary-rgb, 0,230,57), 0.4)';

          return (
            <div key={node.id} className="flex flex-col items-center gap-1 flex-1 min-w-0">
              {/* Value label */}
              <motion.span
                key={node.value}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] font-mono font-bold"
                style={{ color: isComparing ? 'rgb(251,146,60)' : node.sorted ? 'rgb(74,222,128)' : undefined }}
              >
                {node.value}
              </motion.span>
              {/* Bar */}
              <motion.div
                layout
                animate={{ height: `${pct}%`, backgroundColor: barColor }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="w-full rounded-t-sm"
                style={{ minHeight: 6 }}
              />
              {/* Index */}
              <span className="text-[9px] opacity-30 font-mono">{node.id}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-[10px] opacity-60">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: accentColor }} /> Active</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-orange-400" /> Comparing</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-400" /> Sorted</span>
      </div>
    </div>
  );
}
