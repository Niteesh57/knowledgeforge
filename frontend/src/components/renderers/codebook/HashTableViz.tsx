import { motion, AnimatePresence } from 'framer-motion';
import type { HashBucket } from '../../../types/chat';

interface Props { buckets: HashBucket[]; size: number; era: string; }

export default function HashTableViz({ buckets, size, era }: Props) {
  const accentColor = era === '2026s' ? '#a855f7' : era === '2000s' ? '#000080' : 'var(--theme-primary)';

  // Fill empty buckets
  const allBuckets: HashBucket[] = Array.from({ length: size || buckets.length }, (_, i) => {
    const existing = buckets.find(b => b.index === i);
    return existing ?? { index: i, chain: [] };
  });

  return (
    <div className="flex flex-col gap-2 p-4 h-full overflow-y-auto font-mono">
      {allBuckets.map((bucket) => {
        const hasItems = bucket.chain.length > 0;
        const hasActive = bucket.chain.some(c => c.active);
        return (
          <motion.div
            key={bucket.index}
            animate={{
              borderColor: hasActive ? accentColor : era === '2000s' ? '#808080' : '#2a2a2a',
              backgroundColor: hasActive
                ? era === '2026s' ? 'rgba(168,85,247,0.1)' : 'rgba(0,230,57,0.05)'
                : 'transparent',
            }}
            className="flex items-start gap-0 border rounded overflow-hidden"
          >
            {/* Index cell */}
            <div className={`w-10 shrink-0 flex items-center justify-center text-[11px] font-bold py-2.5 border-r ${
              era === '2000s' ? 'bg-[#efeded] border-[#808080] text-[#000080]' : 'bg-surface-container border-[#2a2a2a] text-on-surface-variant'
            }`}>
              [{bucket.index}]
            </div>

            {/* Chain */}
            <div className="flex items-center flex-1 px-2 py-2 gap-1 flex-wrap">
              {hasItems ? (
                <AnimatePresence>
                  {bucket.chain.map((item, i) => (
                    <div key={i} className="flex items-center gap-0">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                          opacity: 1, scale: item.active ? 1.05 : 1,
                          borderColor: item.active ? accentColor : era === '2000s' ? '#808080' : '#2a2a2a',
                        }}
                        className="px-2 py-1 border rounded text-[12px]"
                        style={{ color: item.active ? accentColor : undefined, background: item.active ? `${accentColor}15` : undefined }}
                      >
                        <span className="opacity-50">{item.key}:</span>{' '}
                        <span className="font-bold">{item.value}</span>
                      </motion.div>
                      {i < bucket.chain.length - 1 && (
                        <span className="text-[10px] mx-1 opacity-40">→</span>
                      )}
                    </div>
                  ))}
                </AnimatePresence>
              ) : (
                <span className="text-[11px] opacity-20">∅ empty</span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
