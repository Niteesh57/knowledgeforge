import React, { useState } from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HELP_CATEGORIES = [
  { 
    id: 'GAME', 
    label: 'Gaming', 
    icon: 'sports_esports',
    title: 'How to Play: Interactive Games',
    description: 'The gaming module turns your learning concepts into interactive experiences like Memory Flip and Match-3.',
    mediaInstruction: 'User Action: Please record a 15-second video playing the Memory Flip game. Show the user selecting cards and finding a match. Save it as src/assets/help/game_demo.mp4 and replace this placeholder with a <video src={GameDemo} autoPlay loop muted /> tag.',
    steps: [
      'Select a concept from the sidebar (e.g., "Quantum Physics").',
      'In the proposal screen, select a game template.',
      'Once rendered, click on cards to flip them and find matching pairs based on the learned concepts.',
      'Match all pairs to complete the session.'
    ]
  },
  { 
    id: 'COMIC', 
    label: 'Comics', 
    icon: 'auto_stories',
    title: 'Reading Comics',
    description: 'Transform complex subjects into engaging, multi-panel comic strips.',
    mediaInstruction: 'User Action: Please take a screenshot of a fully rendered comic strip. Show the distinct panels and the cyberpunk visual style. Save it as src/assets/help/comic_demo.png and replace this placeholder with an <img src={ComicDemo} /> tag.',
    steps: [
      'Enter a concept like "Photosynthesis".',
      'The engine will generate a narrative script and render comic panels.',
      'Scroll down to read through the generated panels sequentially.',
      'Hover over images to see full-size details if available.'
    ]
  },
  { 
    id: 'CLI', 
    label: 'CLI Simulator', 
    icon: 'terminal',
    title: 'Using the CLI Simulator',
    description: 'A retro command-line interface for interacting with system states and debugging simulated environments.',
    mediaInstruction: 'User Action: Please record a 10-second video of typing a command (e.g., "ls" or "help") in the CLI renderer and getting a response. Save as src/assets/help/cli_demo.mp4.',
    steps: [
      'Click the terminal input area to focus your cursor.',
      'Type standard commands like `help`, `status`, or `ls` to interact.',
      'Follow the on-screen prompts to solve the system puzzle or retrieve data.'
    ]
  },
  { 
    id: 'BROWSER', 
    label: 'Browser Simulator', 
    icon: 'web',
    title: 'Navigating the Browser Simulator',
    description: 'An interactive pseudo-browser environment simulating web research or intranet navigation.',
    mediaInstruction: 'User Action: Please take a screenshot of the Browser renderer showing an open webpage with clickable links. Save as src/assets/help/browser_demo.png.',
    steps: [
      'The browser will render a starting page based on your topic.',
      'Click on highlighted hyper-links to navigate to different "pages".',
      'Read the content to extract necessary clues or knowledge.'
    ]
  },
  { 
    id: 'CODEBOOK', 
    label: 'Codebook', 
    icon: 'code',
    title: 'Studying the Codebook',
    description: 'Deep-dive technical documentation for programming concepts, complete with code snippets.',
    mediaInstruction: 'User Action: Please take a screenshot of the Codebook renderer highlighting a syntax-highlighted code snippet. Save as src/assets/help/codebook_demo.png.',
    steps: [
      'Review the structured documentation generated for the topic.',
      'Examine the provided code snippets in the highlighted blocks.',
      'Copy code blocks using the copy button (if available) for your own testing.'
    ]
  },
  { 
    id: 'ESCAPE_ROOM', 
    label: 'Escape Room', 
    icon: 'vpn_key',
    title: 'Surviving the Escape Room',
    description: 'A text-based puzzle adventure where you must use your knowledge to unlock rooms and escape.',
    mediaInstruction: 'User Action: Please record a 15-second video of making a choice in the Escape Room that unlocks the next room. Save as src/assets/help/escaperoom_demo.mp4.',
    steps: [
      'Read the current room description carefully.',
      'Review your inventory and the available choices.',
      'Select the choice that correctly applies your knowledge of the concept to progress.',
      'Avoid incorrect choices that might lead to failure or penalties.'
    ]
  },
  { 
    id: 'SIMULATION', 
    label: 'Simulation', 
    icon: 'science',
    title: 'Running Simulations',
    description: 'Interactive models that let you adjust parameters and see the cause-and-effect in real-time.',
    mediaInstruction: 'User Action: Please record a short video showing the adjustment of a slider/control in the Simulation renderer and the resulting state change. Save as src/assets/help/simulation_demo.mp4.',
    steps: [
      'Observe the initial state of the simulation.',
      'Use the provided controls (sliders, buttons) to alter the environment variables.',
      'Watch how the system reacts to your changes to build an intuitive understanding of the concept.'
    ]
  },
  { 
    id: 'MEME', 
    label: 'Meme Explainer', 
    icon: 'sentiment_very_satisfied',
    title: 'Decoding Memes',
    description: 'Breaks down complex topics using internet culture, pairing relatable images with deep explanations.',
    mediaInstruction: 'User Action: Please take a screenshot of a generated Meme and its associated explanation text. Save as src/assets/help/meme_demo.png.',
    steps: [
      'Look at the generated meme image to grasp the analogy.',
      'Read the explanation below to understand how the meme connects to the core concept.',
      'Use the humor and visual association to better remember the topic.'
    ]
  }
];

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState(HELP_CATEGORIES[0].id);

  if (!isOpen) return null;

  const activeCategory = HELP_CATEGORIES.find(c => c.id === activeTab) || HELP_CATEGORIES[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in font-mono">
      <div className="bg-surface-container w-full max-w-5xl h-[80vh] border border-[#2a2a2a] bevel-raised flex flex-col shadow-2xl relative">
        
        {/* Modal Header */}
        <div className="bg-surface-container-highest px-4 py-3 border-b border-[#2a2a2a] flex justify-between items-center bevel-raised shrink-0">
          <div className="flex items-center gap-2 text-primary-fixed-dim font-bold font-label-caps text-[14px]">
            <span className="material-symbols-outlined text-[18px]">help_center</span>
            KNOWLEDGE_FORGE // HELP_MANUAL_V1.0
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-white p-1 hover:bg-[#2a2a2a] rounded transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Sidebar Tabs */}
          <div className="w-64 border-r border-[#2a2a2a] bg-surface-container-lowest flex flex-col shrink-0 overflow-y-auto">
            <div className="text-on-surface-variant font-label-caps text-[10px] px-4 py-3 tracking-wider opacity-60">
              [ RENDERER_MODULES ]
            </div>
            {HELP_CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex items-center gap-3 px-4 py-3 text-left transition-all font-label-caps text-[12px] cursor-pointer ${
                  activeTab === category.id
                    ? 'bg-surface-container text-primary-fixed-dim border-l-4 border-primary-fixed-dim'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary-fixed-dim border-l-4 border-transparent'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-surface-container overflow-y-auto p-8">
            <div className="max-w-2xl mx-auto flex flex-col gap-6">
              
              <div className="border-b border-[#2a2a2a] pb-4">
                <h2 className="text-2xl font-bold text-white mb-2 font-label-caps">{activeCategory.title}</h2>
                <p className="text-on-surface-variant text-sm">{activeCategory.description}</p>
              </div>

              {/* Media Placeholder */}
              <div className="w-full aspect-video bg-[#0a0a0a] border border-dashed border-primary-fixed-dim/50 rounded flex flex-col items-center justify-center p-8 text-center gap-4 relative overflow-hidden group">
                <span className="material-symbols-outlined text-4xl text-primary-fixed-dim/50 group-hover:text-primary-fixed-dim transition-colors">
                  video_camera_front
                </span>
                <p className="text-primary-fixed-dim/80 text-xs font-bold leading-relaxed max-w-md">
                  {activeCategory.mediaInstruction}
                </p>
                <div className="absolute top-2 left-2 px-2 py-1 bg-primary-fixed-dim/20 text-primary-fixed-dim text-[10px] font-bold rounded">
                  MEDIA_SLOT_EMPTY
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-surface-container-lowest border border-[#2a2a2a] rounded p-6">
                <h3 className="text-primary-fixed-dim font-bold font-label-caps text-sm mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">integration_instructions</span>
                  EXECUTION_STEPS
                </h3>
                <ol className="list-decimal list-inside space-y-3 text-on-surface-variant text-sm">
                  {activeCategory.steps.map((step, idx) => (
                    <li key={idx} className="pl-2">{step}</li>
                  ))}
                </ol>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HelpModal;
