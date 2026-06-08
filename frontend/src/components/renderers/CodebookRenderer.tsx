import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CodeStep, VizType } from '../../types/chat';
import { useGraphicsEra } from '../../hooks/useGraphicsEra';
import ArrayViz from './codebook/ArrayViz';
import LinkedListViz from './codebook/LinkedListViz';
import SortingViz from './codebook/SortingViz';
import BinarySearchViz from './codebook/BinarySearchViz';
import BinaryTreeViz from './codebook/BinaryTreeViz';
import HeatmapViz from './codebook/HeatmapViz';
import GraphViz from './codebook/GraphViz';
import StackQueueViz from './codebook/StackQueueViz';
import MemoryViz from './codebook/MemoryViz';
import HashTableViz from './codebook/HashTableViz';

import { generateNextCodebookSteps } from '../../services/api';

interface CodebookRendererProps { data: any; concept: string; }

const VIZ_LABELS: Record<VizType, string> = {
  ARRAY: 'ARRAY',
  LINKED_LIST: 'LINKED_LIST',
  BINARY_TREE: 'BINARY_TREE',
  BINARY_SEARCH: 'BINARY_SEARCH',
  SORTING: 'SORTING',
  HEATMAP: 'HEATMAP',
  GRAPH: 'GRAPH',
  STACK_QUEUE: 'STACK_QUEUE',
  MEMORY: 'MEMORY',
  HASH_TABLE: 'HASH_TABLE',
};

// Syntax highlight colors (simple keyword-based, no external lib needed)
const LANGUAGE_KEYWORDS: Record<string, string[]> = {
  c: ['int', 'char', 'float', 'double', 'void', 'return', 'if', 'else', 'for', 'while', 'struct', 'malloc', 'free', 'NULL', '#include'],
  python: ['def', 'class', 'return', 'if', 'else', 'elif', 'for', 'while', 'in', 'not', 'and', 'or', 'True', 'False', 'None', 'import', 'from', 'lambda', 'with', 'as'],
  javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'new', 'import', 'export', 'default', 'true', 'false', 'null', 'undefined', 'async', 'await'],
  java: ['public', 'private', 'class', 'static', 'void', 'int', 'String', 'return', 'if', 'else', 'for', 'while', 'new', 'null', 'true', 'false', 'import'],
};

function highlightLine(line: string, language: string, era: string): React.ReactNode {
  const kws = LANGUAGE_KEYWORDS[language] || [];
  const accentColor = era === '2026s' ? '#d8b4fe' : era === '2000s' ? '#000080' : 'var(--theme-primary)';
  const parts = line.split(/(\s+|[{}();,=+\-*/<>!&|])/);
  return (
    <>
      {parts.map((part, i) => {
        if (kws.includes(part.trim())) {
          return <span key={i} style={{ color: accentColor, fontWeight: 700 }}>{part}</span>;
        }
        if (/^[0-9]+$/.test(part.trim())) {
          return <span key={i} style={{ color: '#fb923c' }}>{part}</span>;
        }
        if (part.startsWith('"') || part.startsWith("'")) {
          return <span key={i} style={{ color: '#86efac' }}>{part}</span>;
        }
        if (part.startsWith('//') || part.startsWith('#')) {
          return <span key={i} style={{ color: '#6b7280', fontStyle: 'italic' }}>{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

const CodebookRenderer = ({ data, concept }: CodebookRendererProps) => {
  const era = useGraphicsEra();
  const vizType: VizType = data.content?.viz_type || 'ARRAY';
  const language: string = data.content?.language || 'python';
  
  const [localSteps, setLocalSteps] = useState<CodeStep[]>(data.content?.code_steps || []);
  const [isFinished, setIsFinished] = useState<boolean>(data.content?.is_finished ?? true);
  const [isGenerating, setIsGenerating] = useState(false);

  const [stepIndex, setStepIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const codeRef = useRef<HTMLDivElement>(null);

  const step = localSteps[stepIndex];

  // Auto-play
  useEffect(() => {
    if (autoPlay) {
      autoRef.current = setInterval(() => {
        setStepIndex(prev => {
          if (prev >= localSteps.length - 1) {
            setAutoPlay(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1800);
    }
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [autoPlay, localSteps.length]);

  // Scroll active line into view
  useEffect(() => {
    if (codeRef.current) {
      const activeLine = codeRef.current.querySelector('.active-line');
      activeLine?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [stepIndex]);

  if (!step) {
    return <div className="p-8 text-red-500 font-mono">[ ERROR: NO CODE STEPS LOADED ]</div>;
  }

  const handleNext = async () => {
    setAutoPlay(false);
    if (stepIndex < localSteps.length - 1) {
      setStepIndex(i => i + 1);
    } else if (!isFinished && !isGenerating) {
      // Pagination: fetch more steps
      setIsGenerating(true);
      try {
        const lastStep = localSteps[localSteps.length - 1];
        const res = await generateNextCodebookSteps(concept, language, vizType, lastStep);
        if (res.code_steps && res.code_steps.length > 0) {
          setLocalSteps(prev => [...prev, ...res.code_steps]);
          setIsFinished(res.is_finished);
          setStepIndex(i => i + 1); // advance to the first newly generated step
        } else {
          setIsFinished(true);
        }
      } catch (err) {
        console.error("Failed to fetch next steps:", err);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  // Era-based classes
  const shellCls = era === '2026s'
    ? 'h-full flex flex-col bg-[#080310] font-mono text-white'
    : era === '2000s'
    ? 'h-full flex flex-col bg-[#efeded] font-mono text-[#000080]'
    : 'h-full flex flex-col bg-black font-mono text-on-surface';

  const headerCls = era === '2026s'
    ? 'px-5 py-2.5 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5'
    : era === '2000s'
    ? 'px-4 py-2 border-b border-[#808080] flex items-center justify-between shrink-0 bg-[#efeded]'
    : 'px-5 py-2.5 border-b border-[#1a1a1a] flex items-center justify-between shrink-0 bg-[#0e0e0e]';

  const codePanelCls = era === '2026s'
    ? 'h-full overflow-y-auto bg-[#0b0615] border-r border-white/10'
    : era === '2000s'
    ? 'h-full overflow-y-auto bg-white border-r border-[#808080]'
    : 'h-full overflow-y-auto bg-[#000] border-r border-[#1a1a1a]';

  const vizPanelCls = era === '2026s'
    ? 'h-full overflow-hidden bg-[#080310]'
    : era === '2000s'
    ? 'h-full overflow-hidden bg-[#f5f3f3]'
    : 'h-full overflow-hidden bg-[#000]';

  const btnBase = era === '2026s'
    ? 'px-3 py-1 rounded-lg text-[11px] font-bold transition-all '
    : era === '2000s'
    ? 'px-3 py-1 win95-raised text-[11px] font-bold transition-all '
    : 'px-3 py-1 border text-[11px] font-bold transition-all ';

  const accentColor = era === '2026s' ? '#a855f7' : era === '2000s' ? '#000080' : 'var(--theme-primary)';

  const renderViz = () => {
    const vs = step.viz_state;
    if (!vs) return <div className="p-6 opacity-30 text-center text-[12px]">No visualization data</div>;

    switch (vizType) {
      case 'ARRAY':
        return <ArrayViz nodes={vs.nodes || []} pointer={vs.pointer} era={era} />;
      case 'LINKED_LIST':
        return <LinkedListViz nodes={vs.nodes || []} head={vs.head} era={era} />;
      case 'SORTING':
        return <SortingViz nodes={vs.nodes || []} comparing={vs.comparing} era={era} />;
      case 'BINARY_SEARCH':
        return <BinarySearchViz nodes={vs.nodes || []} left={vs.left} right={vs.right} mid={vs.mid} target={vs.target} era={era} />;
      case 'BINARY_TREE':
        return <BinaryTreeViz nodes={vs.nodes || []} root={vs.root} era={era} />;
      case 'HEATMAP':
        return <HeatmapViz cells={vs.cells || []} rows={vs.rows || 3} cols={vs.cols || 4} era={era} />;
      case 'GRAPH':
        return <GraphViz nodes={vs.nodes || []} edges={vs.edges || []} queue={vs.queue || []} era={era} />;
      case 'STACK_QUEUE':
        return <StackQueueViz type={vs.type || 'stack'} items={vs.items || []} operation={vs.operation} era={era} />;
      case 'MEMORY':
        return <MemoryViz variables={vs.variables || []} heap={vs.heap || []} era={era} />;
      case 'HASH_TABLE':
        return <HashTableViz buckets={vs.buckets || []} size={vs.size || 7} era={era} />;
      default:
        return <ArrayViz nodes={vs.nodes || []} pointer={vs.pointer} era={era} />;
    }
  };

  return (
    <div className={shellCls}>
      {/* Header bar */}
      <div className={headerCls}>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
            {VIZ_LABELS[vizType]} // {language.toUpperCase()}
          </span>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold`}
            style={{ background: `${accentColor}22`, color: accentColor }}>
            STEP {stepIndex + 1} / {isFinished ? localSteps.length : `${localSteps.length}+`}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button type="button" disabled={stepIndex === 0 || isGenerating}
            onClick={() => { setAutoPlay(false); setStepIndex(0); }}
            className={btnBase + (stepIndex === 0 || isGenerating ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:opacity-80')}
            style={era !== '2000s' ? { border: `1px solid ${accentColor}44`, color: accentColor } : {}}
          >⏮</button>
          <button type="button" disabled={stepIndex === 0 || isGenerating}
            onClick={() => { setAutoPlay(false); setStepIndex(i => i - 1); }}
            className={btnBase + (stepIndex === 0 || isGenerating ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:opacity-80')}
            style={era !== '2000s' ? { border: `1px solid ${accentColor}44`, color: accentColor } : {}}
          >◀</button>
          <button type="button" disabled={isGenerating}
            onClick={() => setAutoPlay(a => !a)}
            className={btnBase + 'cursor-pointer'}
            style={{ background: autoPlay ? accentColor : `${accentColor}22`, color: autoPlay ? '#fff' : accentColor, border: `1px solid ${accentColor}66` }}
          >{autoPlay ? '⏸ PAUSE' : '▶ AUTO'}</button>
          
          <button type="button" disabled={isGenerating || (isFinished && stepIndex >= localSteps.length - 1)}
            onClick={handleNext}
            className={btnBase + (isGenerating || (isFinished && stepIndex >= localSteps.length - 1) ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:opacity-80')}
            style={era !== '2000s' ? { border: `1px solid ${accentColor}44`, color: accentColor } : {}}
          >
            {isGenerating ? '⏳ GENERATING...' : '▶ NEXT'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 shrink-0" style={{ background: era === '2000s' ? '#c0c0c0' : '#1a1a1a' }}>
        <motion.div
          animate={{ width: `${((stepIndex + 1) / localSteps.length) * 100}%` }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="h-full"
          style={{ background: accentColor }}
        />
      </div>

      {/* Split panels */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Code panel (left) */}
        <div className={`${codePanelCls} w-[45%] shrink-0`} ref={codeRef}>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <span className="w-3 h-3 rounded-full bg-green-400/80" />
              </div>
              <span className="text-[10px] opacity-30">{language}</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.pre
                key={stepIndex}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                className="text-[12px] leading-6 overflow-x-auto"
              >
                {(step.code || '').split('\n').map((line, lineNum) => {
                  const lineNo = lineNum + 1;
                  const isActive = step.highlight_lines?.includes(lineNo);
                  return (
                    <div
                      key={lineNum}
                      className={`flex ${isActive ? 'active-line' : ''} rounded-sm`}
                      style={{
                        background: isActive
                          ? era === '2026s' ? 'rgba(168,85,247,0.15)' : era === '2000s' ? 'rgba(0,0,128,0.08)' : 'rgba(0,230,57,0.08)'
                          : 'transparent',
                        borderLeft: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
                      }}
                    >
                      <span className="w-8 shrink-0 text-right pr-3 opacity-20 text-[11px] select-none">
                        {lineNo}
                      </span>
                      <span>{highlightLine(line, language, era)}</span>
                    </div>
                  );
                })}
              </motion.pre>
            </AnimatePresence>
          </div>
        </div>

        {/* Viz panel (right) */}
        <div className={`${vizPanelCls} flex-1 flex flex-col min-h-0`}>
          {/* Viz area */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={stepIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                {renderViz()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Explanation panel */}
          <div className={`shrink-0 border-t px-4 py-3 ${
            era === '2026s' ? 'border-white/10 bg-white/5' :
            era === '2000s' ? 'border-[#808080] bg-[#efeded]' :
            'border-[#1a1a1a] bg-[#0e0e0e]'
          }`}>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[10px] opacity-40 shrink-0 mt-0.5 uppercase tracking-widest">
                › STEP {stepIndex + 1}:
              </span>
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[13px] leading-relaxed"
                >
                  {step.explanation}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodebookRenderer;
