import { motion } from 'framer-motion';
import type { MemoryVariable, MemoryHeapItem } from '../../../types/chat';

interface Props { variables: MemoryVariable[]; heap: MemoryHeapItem[]; era: string; }

export default function MemoryViz({ variables, heap, era }: Props) {
  const accentColor = era === '2026s' ? '#a855f7' : era === '2000s' ? '#000080' : 'var(--theme-primary)';

  const Row = ({ label, value, address, type, active }: {
    label: string; value: string; address: string; type?: string; active: boolean;
  }) => (
    <motion.tr
      animate={{
        backgroundColor: active
          ? era === '2026s' ? 'rgba(168,85,247,0.15)' : 'rgba(0,230,57,0.08)'
          : 'transparent',
      }}
      transition={{ duration: 0.3 }}
      className="border-b border-[#1a1a1a]"
    >
      <td className="px-3 py-2 text-[12px] font-mono font-bold" style={{ color: active ? accentColor : undefined }}>
        {label}
        {type && <span className="opacity-40 text-[10px] ml-1 font-normal">{type}</span>}
      </td>
      <motion.td
        key={value}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-3 py-2 text-[13px] font-mono font-bold text-center"
        style={{ color: active ? accentColor : undefined }}
      >
        {value}
        {active && <span className="ml-1 w-2 h-4 inline-block bg-current animate-pulse" />}
      </motion.td>
      <td className="px-3 py-2 text-[11px] font-mono opacity-40 text-right">{address}</td>
    </motion.tr>
  );

  return (
    <div className="flex gap-4 p-4 h-full font-mono">
      {/* Stack (variables) */}
      <div className="flex-1">
        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-2">STACK / Variables</p>
        <div className={`rounded border overflow-hidden ${era === '2000s' ? 'border-[#808080]' : 'border-[#1a1a1a]'}`}>
          <table className="w-full text-[12px]">
            <thead>
              <tr className={era === '2000s' ? 'bg-[#efeded]' : 'bg-surface-container'}>
                <th className="px-3 py-1.5 text-left opacity-50 text-[10px]">NAME</th>
                <th className="px-3 py-1.5 text-center opacity-50 text-[10px]">VALUE</th>
                <th className="px-3 py-1.5 text-right opacity-50 text-[10px]">ADDRESS</th>
              </tr>
            </thead>
            <tbody>
              {(variables || []).map((v, i) => (
                <Row key={i} label={v.name} value={v.value} address={v.address} type={v.type} active={v.active} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Heap */}
      {heap && heap.length > 0 && (
        <div className="flex-1">
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-2">HEAP</p>
          <div className={`rounded border overflow-hidden ${era === '2000s' ? 'border-[#808080]' : 'border-[#1a1a1a]'}`}>
            <table className="w-full text-[12px]">
              <thead>
                <tr className={era === '2000s' ? 'bg-[#efeded]' : 'bg-surface-container'}>
                  <th className="px-3 py-1.5 text-left opacity-50 text-[10px]">ADDRESS</th>
                  <th className="px-3 py-1.5 text-center opacity-50 text-[10px]">VALUE</th>
                  <th className="px-3 py-1.5 text-right opacity-50 text-[10px]">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {heap.map((h, i) => (
                  <motion.tr
                    key={i}
                    animate={{ backgroundColor: h.active ? (era === '2026s' ? 'rgba(168,85,247,0.15)' : 'rgba(0,230,57,0.08)') : 'transparent' }}
                    className="border-b border-[#1a1a1a]"
                  >
                    <td className="px-3 py-2 text-[11px] opacity-50 font-mono">{h.address}</td>
                    <td className="px-3 py-2 text-[13px] font-bold text-center font-mono" style={{ color: h.active ? accentColor : undefined }}>
                      {h.value}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${h.allocated ? 'bg-green-800/30 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                        {h.allocated ? 'ALLOC' : 'FREE'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
