import React, { useState, useEffect, useRef } from 'react';
import type { Session, ThemeColor, ChatInteraction } from './types/chat';
import { generateExperience } from './services/api';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import WelcomeScreen from './components/chat/WelcomeScreen';
import ChatInput from './components/chat/ChatInput';
import SettingsModal from './components/ui/SettingsModal';
import ComicRenderer from './components/renderers/ComicRenderer';
import EscapeRoomRenderer from './components/renderers/EscapeRoomRenderer';
import SimulationRenderer from './components/renderers/SimulationRenderer';
import CliRenderer from './components/renderers/CliRenderer';
import BrowserRenderer from './components/renderers/BrowserRenderer';
import GameRenderer from './components/renderers/GameRenderer';
import CodebookRenderer from './components/renderers/CodebookRenderer';
import GameProposalRenderer from './components/renderers/GameProposalRenderer';
import type { GameProposalOption } from './types/chat';

function App() {
  // Session logs
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

  // Settings
  const [crtEnabled, setCrtEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem('kf_crt') || sessionStorage.getItem('kf_crt');
    return stored !== null ? JSON.parse(stored) : true;
  });
  const [themeColor, _setThemeColor] = useState<ThemeColor>(() => {
    const color = (localStorage.getItem('kf_theme') || sessionStorage.getItem('kf_theme') || 'green') as ThemeColor;
    if (typeof document !== 'undefined') {
      document.body.classList.add(`theme-${color}`);
    }
    return color;
  });
  const [graphicsEra, setGraphicsEra] = useState<'1990s' | '2000s' | '2026s'>(() => {
    const era = (localStorage.getItem('kf_graphics_era') || sessionStorage.getItem('kf_graphics_era') || '1990s') as '1990s' | '2000s' | '2026s';
    if (typeof document !== 'undefined') {
      document.body.classList.add(`era-${era}`);
    }
    return era;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Input & Generation State
  const [concept, setConcept] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedInteractionIndex, setExpandedInteractionIndex] = useState<number | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load configuration and sessions on mount
  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem('kf_sessions');
      if (storedSessions) {
        setSessions(JSON.parse(storedSessions));
      }
    } catch (e) {
      console.error('Error loading sessions from localStorage:', e);
    }
  }, []);

  // Sync sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('kf_sessions', JSON.stringify(sessions));
    } else {
      localStorage.removeItem('kf_sessions');
    }
  }, [sessions]);

  // Sync CRT option to localStorage/sessionStorage
  useEffect(() => {
    localStorage.setItem('kf_crt', JSON.stringify(crtEnabled));
    sessionStorage.setItem('kf_crt', JSON.stringify(crtEnabled));
  }, [crtEnabled]);

  // Sync theme class to body and localStorage/sessionStorage
  useEffect(() => {
    localStorage.setItem('kf_theme', themeColor);
    sessionStorage.setItem('kf_theme', themeColor);
    
    // Manage document color scheme classes
    document.body.classList.remove('theme-green', 'theme-amber', 'theme-blue', 'theme-rose');
    document.body.classList.add(`theme-${themeColor}`);
  }, [themeColor]);

  // Sync graphics era to body and localStorage/sessionStorage
  useEffect(() => {
    localStorage.setItem('kf_graphics_era', graphicsEra);
    sessionStorage.setItem('kf_graphics_era', graphicsEra);
    document.body.classList.remove('era-1990s', 'era-2000s', 'era-2026s');
    document.body.classList.add(`era-${graphicsEra}`);
  }, [graphicsEra]);

  // Scroll to bottom when new interaction is added or collapsed status changes
  const activeSession = sessions.find((s) => s.id === currentSessionId);
  const interactions = activeSession?.interactions || [];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [interactions.length, expandedInteractionIndex]);

  // Handle concept matrix generation request
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim() || loading || !activeFolder) return;

    setLoading(true);
    try {
      const experienceData = await generateExperience(concept, activeFolder);

      const newInteraction: ChatInteraction = {
        concept: concept.trim(),
        experience: experienceData,
        timestamp: new Date().toLocaleTimeString(),
      };

      if (!currentSessionId) {
        // Create new session
        const rawTitle = experienceData.title || concept.trim();
        const sessionName =
          rawTitle.length > 25 ? rawTitle.substring(0, 25) + '...' : rawTitle;

        const newSession: Session = {
          id: Date.now().toString(),
          name: sessionName,
          category: activeFolder,
          interactions: [newInteraction],
        };

        setSessions((prev) => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
        setExpandedInteractionIndex(0);
      } else {
        // Append to existing session
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === currentSessionId) {
              const updatedInteractions = [...s.interactions, newInteraction];
              return {
                ...s,
                interactions: updatedInteractions,
              };
            }
            return s;
          })
        );
        setExpandedInteractionIndex(interactions.length);
      }

      setConcept('');
    } catch (error) {
      console.error('Error generating experience matrix:', error);
      alert('FAILED TO DECRYPT AND FORGE LEARNING MATRIX. CHECK SERVER STATUS.');
    } finally {
      setLoading(false);
    }
  };

  const handleProposalSelect = async (originalConcept: string, option: GameProposalOption) => {
    if (loading) return;
    setLoading(true);
    try {
      const mediumToUse = option.type === 'ALTERNATIVE' ? option.medium : activeFolder;
      const templateToUse = option.type === 'GAME' ? option.template : undefined;
      
      const experienceData = await generateExperience(originalConcept, mediumToUse || undefined, templateToUse);

      const newInteraction: ChatInteraction = {
        concept: originalConcept + ` [Selected: ${option.title}]`,
        experience: experienceData,
        timestamp: new Date().toLocaleTimeString(),
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              interactions: [...s.interactions, newInteraction],
            };
          }
          return s;
        })
      );
      
      const activeSession = sessions.find((s) => s.id === currentSessionId);
      if (activeSession) {
        setExpandedInteractionIndex(activeSession.interactions.length);
      }
    } catch (error) {
      console.error('Error generating from proposal:', error);
      alert('FAILED TO DECRYPT AND FORGE LEARNING MATRIX. CHECK SERVER STATUS.');
    } finally {
      setLoading(false);
    }
  };

  // Sidebar controls
  const handleSelectFolder = (folder: string | null) => {
    setActiveFolder(folder);
    setCurrentSessionId(null);
    setConcept('');
    setExpandedInteractionIndex(null);
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setConcept('');
    setExpandedInteractionIndex(null);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (currentSessionId === id) {
      handleNewChat();
    }
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    setExpandedInteractionIndex(null); // Reset to default (latest) when switching
  };

  const handleClearSessions = () => {
    setSessions([]);
    setCurrentSessionId(null);
    setExpandedInteractionIndex(null);
    localStorage.removeItem('kf_sessions');
    sessionStorage.removeItem('kf_sessions');
  };

  const renderActiveRenderer = (interaction: ChatInteraction) => {
    switch (interaction.experience.medium) {
      case 'COMIC':
        return <ComicRenderer data={{ ...interaction.experience, concept: interaction.concept }} />;
      case 'ESCAPE_ROOM':
        return <EscapeRoomRenderer data={interaction.experience} />;
      case 'SIMULATION':
        return <SimulationRenderer data={interaction.experience} />;
      case 'CLI':
        return <CliRenderer data={interaction.experience} />;
      case 'BROWSER':
        return <BrowserRenderer data={interaction.experience} />;
      case 'GAME':
        return <GameRenderer data={interaction.experience} />;
      case 'CODEBOOK':
        return <CodebookRenderer data={interaction.experience} concept={interaction.concept} />;
      case 'GAME_PROPOSAL':
        return <GameProposalRenderer data={interaction.experience} onSelect={(opt) => handleProposalSelect(interaction.concept, opt)} isLoading={loading} />;
      default:
        return (
          <div className="text-red-500 p-6 font-mono">
            [ ERROR: CHANNELS CORRUPTED. UNKNOWN MEDIUM TYPE. ]
          </div>
        );
    }
  };

  return (
    <div className={`flex h-screen w-full relative z-10 overflow-hidden ${
      graphicsEra === '2000s' ? 'bg-surface font-body-md text-on-surface' : graphicsEra === '2026s' ? 'bg-background text-on-surface font-sans' : 'bg-[#131313] text-[#e5e2e1]'
    }`}>
      {/* CRT Display Layer */}
      {graphicsEra === '1990s' && crtEnabled && (
        <>
          <div className="crt-overlay"></div>
          <div className="scanlines"></div>
        </>
      )}
      {graphicsEra === '2000s' && crtEnabled && (
        <div className="scanline-win95"></div>
      )}

      {/* Main Layout Row */}
      <Sidebar
        sessions={sessions.filter(s => s.category === activeFolder)}
        currentSessionId={currentSessionId}
        activeFolder={activeFolder}
        onSelectFolder={handleSelectFolder}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onNewChat={handleNewChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className={`flex-1 flex flex-col h-full relative overflow-hidden ${
        graphicsEra === '2000s' ? 'bg-surface-dim p-4' : graphicsEra === '2026s' ? 'bg-background p-6' : 'bg-[#000000]'
      }`}>
        {/* If 2000s, render inside a Win95 Application Window container */}
        {graphicsEra === '2000s' ? (
          <div className="win95-raised flex-1 flex flex-col w-full relative overflow-hidden">
            {/* Window Title Bar */}
            <div className="title-bar h-[22px] flex items-center justify-between px-1 shrink-0 font-mono select-none">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-white !text-[14px]">terminal</span>
                <span className="text-white font-bold text-[11px] leading-none">ACTION_PLAY // KNOWLEDGE_FORGE_V1.0</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="win95-raised h-4 w-4 flex items-center justify-center bg-black text-white font-bold text-[8px] cursor-pointer" type="button">_</button>
                <button className="win95-raised h-4 w-4 flex items-center justify-center bg-black text-white font-bold text-[8px] cursor-pointer" type="button">⬜</button>
                <button className="win95-raised h-4 w-4 flex items-center justify-center bg-black text-white font-bold text-[8px] cursor-pointer" type="button" onClick={handleNewChat}>✕</button>
              </div>
            </div>

            {/* Window main canvas */}
            <div className="flex-1 flex flex-col justify-between overflow-hidden relative bg-surface text-on-surface">
              {!activeFolder ? (
                <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto opacity-70">
                  <span className="material-symbols-outlined text-[48px] mb-4">folder_open</span>
                  <h2 className="font-bold text-[18px] font-label-caps tracking-widest">SELECT A CONCEPT FOLDER</h2>
                  <p className="text-[12px] mt-2 max-w-md text-center">Choose a concept from the sidebar to start a specialized knowledge forging session.</p>
                </div>
              ) : interactions.length === 0 ? (
                /* Welcome / Search Entry Screen */
                <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
                  <WelcomeScreen />
                  <ChatInput
                    concept={concept}
                    setConcept={setConcept}
                    onSubmit={handleSearch}
                    loading={loading}
                  />
                </div>
              ) : (
                /* Chat Interactions Log Screen */
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Scrollable history logs */}
                  <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar">
                    {interactions.map((interaction, idx) => {
                      const isExpanded =
                        idx === (expandedInteractionIndex ?? interactions.length - 1);
                      return (
                        <div key={idx} className="mb-6 flex flex-col">
                          {/* Interaction request prompt */}
                          <div className="flex items-center gap-2 mb-2 text-primary-container font-mono text-[11px] opacity-75">
                            <span className="text-primary-container font-bold">&gt; CONCEPT_INTERROGATION:</span>
                            <span className="text-primary-container italic bg-surface-container px-2 py-0.5 win95-sunken">
                              "{interaction.concept}"
                            </span>
                            <span className="ml-auto text-primary-container/60 text-[9px]">{interaction.timestamp}</span>
                          </div>

                          {/* Decrypted generation rendering */}
                          {isExpanded ? (
                            <div className="flex-grow min-h-[580px] border border-[#808080] bg-surface-container relative win95-sunken mb-4 flex flex-col p-1">
                              <div className="bg-[#efeded] px-4 py-2 border-b border-[#808080] flex justify-between items-center text-[10px] text-on-surface-variant font-bold font-label-caps">
                                <span className="text-primary-container">
                                  [ MEDIUM: {interaction.experience.medium} ]
                                </span>
                                <span className="truncate max-w-[200px] md:max-w-md text-black">
                                  {interaction.experience.title}
                                </span>
                              </div>
                              <div className="flex-grow min-h-0 bg-surface">
                                {renderActiveRenderer(interaction)}
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setExpandedInteractionIndex(idx)}
                              className="w-full text-left bg-[#efeded] hover:bg-surface-container-high p-3 border border-[#808080] win95-raised flex items-center justify-between text-[11px] font-label-caps cursor-pointer text-on-surface-variant hover:text-primary-container transition-colors mb-4"
                            >
                              <span className="flex items-center gap-2 truncate pr-2">
                                <span className="material-symbols-outlined text-[14px]">visibility</span>
                                [ COLLAPSED MATRIX ]: {interaction.experience.title} ({interaction.experience.medium})
                              </span>
                              <span className="text-[9px] opacity-60 shrink-0">CLICK TO RENDER</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Sticky bottom prompt execution field */}
                  <div className="px-6 py-4 border-t border-[#808080] bg-[#efeded] flex justify-center shrink-0">
                    <ChatInput
                      concept={concept}
                      setConcept={setConcept}
                      onSubmit={handleSearch}
                      loading={loading}
                      variant="compact"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Window Status bar */}
            <Footer graphicsEra={graphicsEra} />
          </div>
        ) : graphicsEra === '2026s' ? (
          <div className="flex-1 flex flex-col w-full relative overflow-hidden glass-panel p-2">
            {/* Sleek Header */}
            <div className="h-14 flex items-center justify-between px-6 shrink-0 border-b border-white/10 select-none">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#a855f7] animate-pulse text-[20px]">temp_preferences_custom</span>
                <span className="font-bold text-[14px] tracking-wider gradient-text-2026 font-label-caps">CYBER_CORE // LEARNING_FORGE</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleNewChat}
                  className="h-8 px-4 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-[11px] cursor-pointer transition-all active:scale-95 hover:border-[#a855f7]/30"
                  type="button"
                >
                  New Chat
                </button>
              </div>
            </div>

            {/* Window main canvas */}
            <div className="flex-1 flex flex-col justify-between overflow-hidden relative bg-transparent text-on-surface">
              {!activeFolder ? (
                <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto opacity-70">
                  <span className="material-symbols-outlined text-[64px] mb-6 text-[#a855f7]">folder_open</span>
                  <h2 className="font-bold text-[20px] font-label-caps tracking-widest text-white">SELECT A CONCEPT FOLDER</h2>
                  <p className="text-[13px] mt-3 max-w-md text-center text-white/60">Choose a concept from the sidebar to start a specialized knowledge forging session.</p>
                </div>
              ) : interactions.length === 0 ? (
                /* Welcome / Search Entry Screen */
                <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
                  <WelcomeScreen />
                  <ChatInput
                    concept={concept}
                    setConcept={setConcept}
                    onSubmit={handleSearch}
                    loading={loading}
                  />
                </div>
              ) : (
                /* Chat Interactions Log Screen */
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Scrollable history logs */}
                  <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar">
                    {interactions.map((interaction, idx) => {
                      const isExpanded =
                        idx === (expandedInteractionIndex ?? interactions.length - 1);
                      return (
                        <div key={idx} className="mb-6 flex flex-col">
                          {/* Interaction request prompt */}
                          <div className="flex items-center gap-3 mb-3 text-[12px] opacity-90">
                            <span className="text-[#a855f7] font-bold font-label-caps">&gt; CONCEPT_INTERROGATION:</span>
                            <span className="italic bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-white font-medium">
                              "{interaction.concept}"
                            </span>
                            <span className="ml-auto text-white/40 text-[10px]">{interaction.timestamp}</span>
                          </div>

                          {/* Decrypted generation rendering */}
                          {isExpanded ? (
                            <div className="flex-grow min-h-[580px] border border-white/10 bg-white/5 rounded-2xl relative mb-4 flex flex-col p-2 overflow-hidden shadow-2xl">
                              <div className="bg-white/5 px-5 py-3 border-b border-white/10 flex justify-between items-center text-[11px] font-bold font-label-caps text-white rounded-t-xl">
                                <span className="text-[#a855f7] flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7] animate-ping shrink-0"></span>
                                  [ MEDIUM: {interaction.experience.medium} ]
                                </span>
                                <span className="truncate max-w-[200px] md:max-w-md text-white/95">
                                  {interaction.experience.title}
                                </span>
                              </div>
                              <div className="flex-grow min-h-0 bg-transparent rounded-b-xl overflow-hidden">
                                {renderActiveRenderer(interaction)}
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setExpandedInteractionIndex(idx)}
                              className="w-full text-left bg-white/5 hover:bg-white/10 p-4 border border-white/10 rounded-xl flex items-center justify-between text-[12px] font-label-caps cursor-pointer text-white/80 transition-all hover:border-[#a855f7]/30"
                            >
                              <span className="flex items-center gap-2 truncate pr-2">
                                <span className="material-symbols-outlined text-[16px] text-[#a855f7]">visibility</span>
                                [ COLLAPSED MATRIX ]: {interaction.experience.title} ({interaction.experience.medium})
                              </span>
                              <span className="text-[10px] text-[#a855f7] opacity-80 shrink-0">RENDER EXPERIMENT</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Sticky bottom prompt execution field */}
                  <div className="px-6 py-4 border-t border-white/10 bg-transparent flex justify-center shrink-0">
                    <ChatInput
                      concept={concept}
                      setConcept={setConcept}
                      onSubmit={handleSearch}
                      loading={loading}
                      variant="compact"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Status Footer */}
            <Footer graphicsEra={graphicsEra} />
          </div>
        ) : (
          /* 1990s layout */
          <>
            <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
              {!activeFolder ? (
                <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto opacity-70">
                  <span className="material-symbols-outlined text-[48px] mb-4 text-primary-fixed-dim">folder_open</span>
                  <h2 className="font-bold text-[18px] font-label-caps tracking-widest text-primary-fixed-dim">SELECT A CONCEPT FOLDER</h2>
                  <p className="text-[12px] mt-2 max-w-md text-center">Choose a concept from the sidebar to start a specialized knowledge forging session.</p>
                </div>
              ) : interactions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
                  <WelcomeScreen />
                  <ChatInput
                    concept={concept}
                    setConcept={setConcept}
                    onSubmit={handleSearch}
                    loading={loading}
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar">
                    {interactions.map((interaction, idx) => {
                      const isExpanded =
                        idx === (expandedInteractionIndex ?? interactions.length - 1);
                      return (
                        <div key={idx} className="mb-6 flex flex-col">
                          <div className="flex items-center gap-2 mb-2 text-on-surface-variant font-mono text-[11px] opacity-75">
                            <span className="text-primary-fixed-dim font-bold">&gt; CONCEPT_INTERROGATION:</span>
                            <span className="text-white italic bg-surface-container-high px-2 py-0.5 bevel-sunken">
                              "{interaction.concept}"
                            </span>
                            <span className="ml-auto text-[9px] opacity-50">{interaction.timestamp}</span>
                          </div>
                          {isExpanded ? (
                            <div className="flex-grow min-h-[580px] border border-[#2a2a2a] bg-surface-container-lowest relative bevel-sunken mb-4 flex flex-col">
                              <div className="bg-surface-container px-4 py-2 border-b border-[#2a2a2a] flex justify-between items-center text-[10px] text-on-surface-variant font-bold font-label-caps">
                                <span className="text-primary-fixed-dim">
                                  [ MEDIUM: {interaction.experience.medium} ]
                                </span>
                                <span className="truncate max-w-[200px] md:max-w-md">
                                  {interaction.experience.title}
                                </span>
                              </div>
                              <div className="flex-grow min-h-0">
                                {renderActiveRenderer(interaction)}
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setExpandedInteractionIndex(idx)}
                              className="w-full text-left bg-surface-container hover:bg-surface-container-high p-3 border border-[#2a2a2a] bevel-raised flex items-center justify-between text-[11px] font-label-caps cursor-pointer text-on-surface-variant hover:text-primary-fixed-dim transition-colors mb-4"
                            >
                              <span className="flex items-center gap-2 truncate pr-2">
                                <span className="material-symbols-outlined text-[14px]">visibility</span>
                                [ COLLAPSED MATRIX ]: {interaction.experience.title} ({interaction.experience.medium})
                              </span>
                              <span className="text-[9px] opacity-60 shrink-0">CLICK TO RENDER</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="px-6 py-4 border-t border-[#1a1a1a] bg-[#000000] flex justify-center shrink-0">
                    <ChatInput
                      concept={concept}
                      setConcept={setConcept}
                      onSubmit={handleSearch}
                      loading={loading}
                      variant="compact"
                    />
                  </div>
                </div>
              )}
            </div>
            <Footer graphicsEra={graphicsEra} />
          </>
        )}
      </main>

      {/* Settings Dialog Overlay */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        crtEnabled={crtEnabled}
        onChangeCrt={setCrtEnabled}
        graphicsEra={graphicsEra}
        onChangeEra={setGraphicsEra}
        onClearSessions={handleClearSessions}
      />
    </div>
  );
}

export default App;
