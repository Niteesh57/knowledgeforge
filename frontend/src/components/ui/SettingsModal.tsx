import React from 'react';
import BevelContainer from './BevelContainer';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  crtEnabled: boolean;
  onChangeCrt: (enabled: boolean) => void;
  graphicsEra: '1990s' | '2000s' | '2026s';
  onChangeEra: (era: '1990s' | '2000s' | '2026s') => void;
  onClearSessions: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  crtEnabled,
  onChangeCrt,
  graphicsEra,
  onChangeEra,
  onClearSessions,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs font-mono">
      <div className="absolute inset-0" onClick={onClose}></div>
      <BevelContainer
        variant="raised"
        className="relative z-10 w-full max-w-md bg-surface-container p-6 shadow-2xl border border-[#2a2a2a]"
      >
        {/* Header */}
        <div className="mb-6 pb-2 border-b border-[#2a2a2a] flex justify-between items-center">
          <div className="text-primary-fixed-dim font-bold font-label-caps flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            [ SYSTEM CONFIG ]
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary-fixed-dim font-bold text-lg p-1 cursor-pointer"
          >
            &#x2715;
          </button>
        </div>

        {/* Options */}
        <div className="space-y-6">
          {/* CRT Animation Toggle */}
          <div>
            <label className="text-on-surface-variant font-label-caps text-[12px] block mb-2">
              CRT RASTER SCANLINES
            </label>
            <BevelContainer
              variant="sunken"
              className="bg-surface-container-lowest p-3 flex justify-between items-center"
            >
              <span className="text-[14px] text-on-surface">Enable screen flicker & sweep</span>
              <button
                type="button"
                onClick={() => onChangeCrt(!crtEnabled)}
                className={`px-3 py-1 text-[12px] font-label-caps bevel-raised bevel-active cursor-pointer ${
                  crtEnabled
                    ? 'bg-primary-fixed-dim text-on-primary-fixed'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {crtEnabled ? 'ONLINE' : 'OFFLINE'}
              </button>
            </BevelContainer>
          </div>

          {/* Interface Style Era */}
          <div>
            <label className="text-on-surface-variant font-label-caps text-[12px] block mb-2">
              INTERFACE GRAPHICS ERA
            </label>
            <BevelContainer
              variant="sunken"
              className="bg-surface-container-lowest p-3 flex gap-2 items-center"
            >
              <button
                type="button"
                onClick={() => onChangeEra('1990s')}
                className={`flex-grow px-2 py-1.5 text-[11px] font-label-caps border cursor-pointer font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  graphicsEra === '1990s'
                    ? 'border-primary-fixed-dim text-primary-fixed-dim bg-surface-container'
                    : 'border-transparent text-on-surface-variant/60 hover:bg-surface-container-high'
                }`}
              >
                {graphicsEra === '1990s' && <span className="material-symbols-outlined text-[14px]">done</span>}
                1990's
              </button>
              <button
                type="button"
                onClick={() => onChangeEra('2000s')}
                className={`flex-grow px-2 py-1.5 text-[11px] font-label-caps border cursor-pointer font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  graphicsEra === '2000s'
                    ? 'border-primary-fixed-dim text-primary-fixed-dim bg-surface-container'
                    : 'border-transparent text-on-surface-variant/60 hover:bg-surface-container-high'
                }`}
              >
                {graphicsEra === '2000s' && <span className="material-symbols-outlined text-[14px]">done</span>}
                2000's
              </button>
              <button
                type="button"
                onClick={() => onChangeEra('2026s')}
                className={`flex-grow px-2 py-1.5 text-[11px] font-label-caps border cursor-pointer font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  graphicsEra === '2026s'
                    ? 'border-primary-fixed-dim text-primary-fixed-dim bg-surface-container'
                    : 'border-transparent text-on-surface-variant/60 hover:bg-surface-container-high'
                }`}
              >
                {graphicsEra === '2026s' && <span className="material-symbols-outlined text-[14px]">done</span>}
                2026's
              </button>
            </BevelContainer>
          </div>

          {/* Session Storage Control */}
          <div>
            <label className="text-on-surface-variant font-label-caps text-[12px] block mb-2">
              SESSION DATABASE CONTROL
            </label>
            <BevelContainer
              variant="sunken"
              className="bg-surface-container-lowest p-3 flex justify-between items-center"
            >
              <span className="text-[12px] text-on-surface">Purge all session logs and chat history</span>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to clear the entire session history? This cannot be undone.")) {
                    onClearSessions();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 text-[11px] font-label-caps bg-red-600 hover:bg-red-700 text-white font-bold bevel-raised bevel-active cursor-pointer"
              >
                CLEAR HISTORY
              </button>
            </BevelContainer>
          </div>
        </div>
      </BevelContainer>
    </div>
  );
};

export default SettingsModal;
