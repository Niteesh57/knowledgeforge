import { useState, useEffect, useRef } from 'react';
import type { CliCommand } from '../../types/chat';
import BevelContainer from '../ui/BevelContainer';
import RetroButton from '../ui/RetroButton';

interface CliRendererProps {
  data: any;
}

export const CliRenderer = ({ data }: CliRendererProps) => {
  const commands: CliCommand[] = data.content?.commands || [];
  const [commandIndex, setCommandIndex] = useState<number>(0);
  const [input, setInput] = useState<string>('');
  const [terminalLines, setTerminalLines] = useState<
    { type: 'input' | 'output' | 'error' | 'info'; text: string }[]
  >([]);
  const [completed, setCompleted] = useState<boolean>(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize terminal header lines
  useEffect(() => {
    setTerminalLines([
      { type: 'info', text: 'CYBER_CORE CLI SHELL INTERPOLATION PROTOCOL v1.0.4' },
      { type: 'info', text: `INITIALIZING TUTORIAL LOG FOR CONCEPT: ${data.title || 'UNKNOWN'}` },
      { type: 'info', text: 'TYPE THE EXACT STEP COMMANDS DISPLAYED IN THE GUIDE TO DECRYPT.' },
      { type: 'info', text: '-------------------------------------------------------------\n' },
    ]);
    setCommandIndex(0);
    setCompleted(false);
    setInput('');
  }, [data]);

  // Keep terminal scrolled to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLines]);

  // Handle focus lock
  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const executeCommand = (cmdText: string) => {
    const trimmedCmd = cmdText.trim();
    if (!trimmedCmd) return;

    const currentStep = commands[commandIndex];

    // Append typed input
    setTerminalLines((prev) => [
      ...prev,
      { type: 'input', text: `root@cyber_core:~# ${trimmedCmd}` },
    ]);

    // Check match
    if (trimmedCmd.toLowerCase() === currentStep.command.toLowerCase().trim()) {
      // Simulate small delay
      setTimeout(() => {
        setTerminalLines((prev) => [
          ...prev,
          { type: 'output', text: currentStep.expected_output },
          { type: 'info', text: `[ OK: step advanced - ${currentStep.description} ]\n` },
        ]);

        if (commandIndex < commands.length - 1) {
          setCommandIndex((prev) => prev + 1);
        } else {
          setCompleted(true);
          setTerminalLines((prev) => [
            ...prev,
            { type: 'info', text: '=============================================================' },
            { type: 'info', text: '[ SYSTEM LOG DECRYPTION COMPLETE: PROTOCOL NORMALIZED ]' },
            { type: 'info', text: '=============================================================' },
          ]);
        }
      }, 250);
    } else {
      setTimeout(() => {
        setTerminalLines((prev) => [
          ...prev,
          { type: 'error', text: `bash: command execution failure: "${trimmedCmd}"` },
          { type: 'error', text: `Expected command input: "${currentStep.command}"` },
        ]);
      }, 100);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (completed || !input.trim()) return;
    executeCommand(input);
    setInput('');
  };

  const handleAutoRun = () => {
    if (completed || commandIndex >= commands.length) return;
    executeCommand(commands[commandIndex].command);
  };

  if (commands.length === 0) {
    return (
      <div className="p-8 text-red-500 font-mono">
        [ ERROR: NO SYSTEM CLI COMMAND SCHEMAS DECODED ]
      </div>
    );
  }

  const currentStep = commands[commandIndex];

  return (
    <div className="flex flex-col md:flex-row h-full font-mono bg-[#000000] text-primary-fixed-dim">
      {/* Left side: Terminal Shell */}
      <div
        className="cli-terminal-shell flex-1 flex flex-col min-h-0 p-4 relative cursor-text select-text"
        onClick={handleTerminalClick}
      >
        {/* Terminal viewport */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-1 scrollbar select-text">
          {terminalLines.map((line, idx) => (
            <div
              key={idx}
              className={`text-[13px] leading-relaxed whitespace-pre-wrap select-text ${
                line.type === 'input'
                  ? 'text-white font-bold'
                  : line.type === 'error'
                  ? 'text-red-500'
                  : line.type === 'info'
                  ? 'text-on-surface-variant/70'
                  : 'text-primary-fixed-dim/90'
              }`}
            >
              {line.text}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* Input prompt line */}
        {!completed && (
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-[#1a1a1a] pt-3 mt-2 shrink-0"
          >
            <span className="text-white font-bold select-none text-[13px]">
              root@cyber_core:~#
            </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow bg-transparent border-0 outline-none focus:ring-0 text-white font-bold font-mono text-[13px] p-0 focus:outline-none"
              autoFocus
              placeholder="Type active command..."
            />
            <span className="cursor-blink shrink-0"></span>
          </form>
        )}
      </div>

      {/* Right side: Step Guide Panel */}
      <div className="w-full md:w-80 shrink-0 border-t md:border-t-0 md:border-l border-[#2a2a2a] p-4 bg-surface-container-low flex flex-col justify-between select-none">
        <div className="space-y-4">
          <div className="text-[10px] font-bold text-on-surface-variant opacity-60 font-label-caps">
            [ CLI_INSTRUCTION_GUIDE ]
          </div>

          {/* Steps List */}
          <div className="space-y-2">
            {commands.map((cmd, idx) => {
              const isPast = idx < commandIndex;
              const isActive = idx === commandIndex && !completed;

              return (
                <div
                  key={idx}
                  className={`p-2 border text-[11px] font-label-caps transition-all ${
                    isActive
                      ? 'border-primary-fixed-dim bg-surface-container text-primary-fixed-dim font-bold shadow-xs'
                      : isPast
                      ? 'border-[#2a2a2a] text-on-surface-variant/40 line-through'
                      : 'border-transparent text-on-surface-variant/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                        isPast
                          ? 'bg-primary-fixed-dim/20 text-primary-fixed-dim'
                          : isActive
                          ? 'bg-primary-fixed-dim text-on-primary'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <code className="truncate font-bold text-[12px]">
                      {cmd.command}
                    </code>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Step Description */}
          {!completed && currentStep && (
            <BevelContainer variant="sunken" className="bg-[#000000] p-3 border border-[#080808]">
              <span className="text-[10px] font-bold text-on-surface-variant opacity-60 font-label-caps block mb-1">
                &gt; STEP GOAL:
              </span>
              <p className="text-[11px] leading-relaxed text-on-surface">
                {currentStep.description}
              </p>
            </BevelContainer>
          )}

          {completed && (
            <BevelContainer variant="sunken" className="bg-primary-fixed-dim/5 p-3 border border-primary-fixed-dim/20">
              <span className="text-[11px] font-bold text-primary-fixed-dim block mb-1">
                TUTORIAL NOMINAL
              </span>
              <p className="text-[10px] text-on-surface-variant leading-relaxed">
                All steps run successfully. Use "New Chat" in the sidebar to forge another experience.
              </p>
            </BevelContainer>
          )}
        </div>

        {/* Auto Run Button */}
        {!completed && (
          <div className="mt-4 pt-3 border-t border-[#2a2a2a]">
            <RetroButton onClick={handleAutoRun} className="w-full text-[10px] py-1.5">
              AUTO-TYPE & RUN
            </RetroButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default CliRenderer;
