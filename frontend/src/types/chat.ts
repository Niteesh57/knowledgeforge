export interface Panel {
  image_description: string;
  dialogue: string;
}

export interface Puzzle {
  context: string;
  question: string;
  answer: string;
  hint: string;
}

export interface Entity {
  name: string;
  type: string;
}

export interface CliCommand {
  command: string;
  expected_output: string;
  description: string;
}

// ─── Browser Simulator Types ──────────────────────────────────────────────────

export interface BrowserField {
  type: 'text' | 'select' | 'radio' | 'checkbox' | 'toggle';
  label: string;
  // text fields
  placeholder?: string;
  hint?: string;
  correct_value?: string | null;
  // select / radio
  options?: string[];
  correct?: string;
  explanation?: string;
  // checkbox / toggle
  correct_checked?: boolean;
  correct_on?: boolean;
}

export interface BrowserScreen {
  url: string;
  page_title: string;
  sidebar_items: string[];
  active_sidebar: string;
  heading: string;
  screen_tip: string;
  fields: BrowserField[];
  next_button: string;
}

// ─── Game Types ───────────────────────────────────────────────────────────────

export type GameTemplate =
  | 'CATCH_DROP'
  | 'WORD_DECODE'
  | 'MAZE_ESCAPE'
  | 'MEMORY_FLIP'
  | 'SEQUENCE_SORT'
  | 'BINARY_JUMP'
  | 'SPACE_SHOOTER'
  | 'CIRCUIT_CONNECT';

export interface GameItem {
  // CATCH_DROP
  label?: string;
  correct?: boolean;
  // MEMORY_FLIP
  term?: string;
  definition?: string;
  // SEQUENCE_SORT
  order?: number;
  // BINARY_JUMP
  question?: string;
  platform_label?: string;
  // WORD_DECODE
  answer?: string;
  clues?: string[];
  // MAZE_ESCAPE
  choice_label?: string;
  is_correct_path?: boolean;
  // CIRCUIT_CONNECT
  from_node?: string;
  to_node?: string;
}

export interface GameLevel {
  concept_title: string;
  concept_explanation: string;
  items: GameItem[];
  win_score: number;
  time_limit_seconds: number;
}

// ─── Codebook / Algorithm Visualizer Types ────────────────────────────────────

export type VizType =
  | 'ARRAY'
  | 'LINKED_LIST'
  | 'BINARY_TREE'
  | 'BINARY_SEARCH'
  | 'SORTING'
  | 'HEATMAP'
  | 'GRAPH'
  | 'STACK_QUEUE'
  | 'MEMORY'
  | 'HASH_TABLE';

export interface VizNode {
  id: string;
  label: string;
  value: string;
  active: boolean;
  // LINKED_LIST
  next?: string | null;
  // BINARY_TREE
  left?: string | null;
  right?: string | null;
  // SORTING
  height?: number;
  sorted?: boolean;
  // BINARY_SEARCH
  eliminated?: boolean;
  // GRAPH
  visited?: boolean;
  x?: number;
  y?: number;
}

export interface VizEdge {
  from: string;
  to: string;
  active: boolean;
  directed?: boolean;
}

export interface HeatCell {
  row: number;
  col: number;
  value: string;
  intensity: number;
  active: boolean;
}

export interface MemoryVariable {
  name: string;
  value: string;
  address: string;
  type: string;
  active: boolean;
}

export interface MemoryHeapItem {
  address: string;
  value: string;
  allocated: boolean;
  active: boolean;
}

export interface HashBucket {
  index: number;
  chain: { key: string; value: string; active: boolean }[];
}

export interface VizState {
  // ARRAY / SORTING / BINARY_SEARCH
  nodes?: VizNode[];
  pointer?: string | null;
  // LINKED_LIST
  head?: string;
  // BINARY_TREE
  root?: string;
  // BINARY_SEARCH
  left?: string;
  right?: string;
  mid?: string;
  target?: string | number;
  // SORTING
  comparing?: string[] | null;
  // HEATMAP
  rows?: number;
  cols?: number;
  cells?: HeatCell[];
  // GRAPH
  edges?: VizEdge[];
  queue?: string[];
  // STACK_QUEUE
  type?: 'stack' | 'queue';
  items?: VizNode[];
  operation?: string | null;
  // MEMORY
  variables?: MemoryVariable[];
  heap?: MemoryHeapItem[];
  // HASH_TABLE
  size?: number;
  buckets?: HashBucket[];
}

export interface CodeStep {
  code: string;
  highlight_lines: number[];
  explanation: string;
  viz_state: VizState;
}

export interface GameProposalOption {
  type: 'GAME' | 'ALTERNATIVE';
  template?: string;
  medium?: string;
  title: string;
  description: string;
}

// ─── Core Experience Types ────────────────────────────────────────────────────

export interface Experience {
  medium: 'COMIC' | 'ESCAPE_ROOM' | 'SIMULATION' | 'CLI' | 'BROWSER' | 'GAME' | 'CODEBOOK' | 'GAME_PROPOSAL';
  template: string;
  title: string;
  description: string;
  content: {
    // Existing
    panels?: Panel[];
    puzzles?: Puzzle[];
    entities?: Entity[];
    mechanics?: string;
    commands?: CliCommand[];
    // Browser
    browser_title?: string;
    screens?: BrowserScreen[];
    // Game
    game_template?: GameTemplate;
    instructions?: string;
    levels?: GameLevel[];
    // Codebook
    language?: string;
    viz_type?: VizType;
    is_finished?: boolean;
    code_steps?: CodeStep[];
    // Game Proposal
    options?: GameProposalOption[];
  };
}

export interface ChatInteraction {
  concept: string;
  experience: Experience;
  timestamp: string;
}

export interface Session {
  id: string;
  name: string;
  category: string;
  interactions: ChatInteraction[];
}

export type ThemeColor = 'green' | 'amber' | 'blue' | 'rose';
