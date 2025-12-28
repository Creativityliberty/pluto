
export interface SkillFile {
  name: string;
  path: string;
  content: string;
  language: string;
}

export interface SkillMetadata {
  shortDescription?: string;
  version: string;
  triggers: string[];
  capabilities: string[];
}

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  metadata: SkillMetadata;
  instructions: string; // Content of SKILL.md
  files: SkillFile[]; // Includes scripts, references, etc.
  updatedAt: number;
}

export type ViewType = 'overview' | 'workbench' | 'directory' | 'mcp' | 'cookbook' | 'settings';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  thought?: string;
}
