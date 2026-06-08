import React from 'react';

interface StatusHeaderProps {
  onOpenSettings: () => void;
  onNewChat: () => void;
}

export const StatusHeader: React.FC<StatusHeaderProps> = ({
  onOpenSettings,
  onNewChat,
}) => {
  return (
    <>
      {/* Desktop Status Bar */}
      <div className="hidden md:flex justify-between items-center px-8 h-10 bg-surface-container-lowest border-b border-[#080808] text-[10px] text-on-surface-variant font-mono tracking-wider opacity-60">
        <div className="flex gap-4">
          <span>SYSTEM: ONLINE</span>
        </div>
        <div className="flex gap-4">
          <span>v1.0.4-STABLE</span>
        </div>
      </div>

      {/* TopNavBar (Mobile Only) */}
      <header className="md:hidden flex justify-between items-center w-full px-4 h-16 bg-surface border-b border-[#080808] shrink-0 font-mono">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-[14px] font-bold text-primary-fixed-dim tracking-wider">
            CYBER_CORE_v1.0
          </h1>
          <div className="inline-flex items-center gap-1 text-[8px] font-bold tracking-wider text-primary-fixed-dim opacity-80 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed-dim animate-pulse"></span>
            Powered by Foundry IQ
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onNewChat}
            className="p-2 text-on-surface-variant hover:text-primary-fixed-dim cursor-pointer"
            title="New Chat"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 text-on-surface-variant hover:text-primary-fixed-dim cursor-pointer"
            title="Settings"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
        </div>
      </header>
    </>
  );
};

export default StatusHeader;
