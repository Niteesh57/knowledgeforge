import { motion } from 'framer-motion';
import type { VizNode } from '../../../types/chat';

interface Props { nodes: VizNode[]; head: string | undefined; era: string; }

export default function LinkedListViz({ nodes, head, era }: Props) {
  const accentColor = era === '2026s' ? '#a855f7' : era === '2000s' ? '#000080' : 'var(--theme-primary)';
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  // Traverse from head
  const ordered: VizNode[] = [];
  let cur = head;
  const visited = new Set<string>();
  while (cur && nodeMap[cur] && !visited.has(cur)) {
    ordered.push(nodeMap[cur]);
    visited.add(cur);
    cur = nodeMap[cur].next ?? undefined;
  }
  // Add any remaining (unlinked) nodes
  nodes.forEach(n => { if (!visited.has(n.id)) ordered.push(n); });

  return (
    <div className="flex items-center justify-center flex-wrap gap-0 p-6 h-full">
      {/* HEAD label */}
      <div className="flex flex-col items-center mr-2">
        <span className="text-[10px] font-bold mb-1" style={{ color: accentColor }}>HEAD</span>
        <span className="text-[16px]" style={{ color: accentColor }}>→</span>
      </div>

      {ordered.map((node, i) => (
        <div key={node.id} className="flex items-center">
          {/* Node box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: node.active ? 1.05 : 1 }}
            transition={{ duration: 0.3 }}
            className="flex border-2 h-14 overflow-hidden"
            style={{
              borderColor: node.active ? accentColor : era === '2000s' ? '#808080' : '#2a2a2a',
              boxShadow: node.active ? `0 0 10px ${accentColor}66` : 'none',
            }}
          >
            {/* Value cell */}
            <div className={`w-14 flex flex-col items-center justify-center border-r ${
              node.active
                ? era === '2026s' ? 'bg-[#a855f7]/15' : 'bg-primary-fixed-dim/10'
                : era === '2000s' ? 'bg-white' : 'bg-[#0e0e0e]'
            }`} style={{ borderRightColor: node.active ? accentColor : '#2a2a2a' }}>
              <span className={`text-[11px] opacity-40 font-mono`}>{node.label}</span>
              <motion.span
                key={node.value}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-[15px] font-mono"
                style={{ color: node.active ? accentColor : undefined }}
              >
                {node.value}
              </motion.span>
            </div>
            {/* Next pointer cell */}
            <div className={`w-10 flex items-center justify-center text-[10px] opacity-50 ${
              era === '2000s' ? 'bg-[#e0e0e0]' : 'bg-surface-container'
            }`}>
              {node.next ? '→' : 'NULL'}
            </div>
          </motion.div>

          {/* Arrow to next */}
          {node.next && i < ordered.length - 1 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[18px] mx-1"
              style={{ color: accentColor }}
            >
              →
            </motion.span>
          )}
          {/* NULL terminator */}
          {!node.next && (
            <span className="text-[11px] ml-2 opacity-40 font-mono">NULL</span>
          )}
        </div>
      ))}
    </div>
  );
}
