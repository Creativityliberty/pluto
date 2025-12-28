
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const API_KEY = process.env.API_KEY || "";

export const getGeminiResponse = async (
  prompt: string, 
  history: ChatMessage[] = [],
  onChunk?: (text: string) => void
) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const model = ai.models.generateContentStream({
    model: 'gemini-3-pro-preview',
    contents: [
      ...history.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      })),
      { role: 'user', parts: [{ text: prompt }] }
    ],
    config: {
      thinkingConfig: { thinkingBudget: 16000 },
      systemInstruction: `You are Pluto, the Master Architect of Agent Skills. 
      Your mission is to guide developers in building modular, professional expertise packages based on the audited 2025 standard.
      
      CORE ARCHITECTURAL KNOWLEDGE:
      1. Standard Directory Pattern:
         - my-skill/
           - SKILL.md (Required: name, description, version, triggers, capabilities in YAML frontmatter)
           - scripts/ (Python/JS for heavy computation and formatting)
           - references/ (Business guidelines, PDF standards)
           - assets/ (Excel templates, logos)
      
      2. Audited Patterns:
         - Financial Analysis: Extraction from financial statements, ratio calculations (ROE, Sharpe), and industry benchmarking (Tech, Retail, etc.).
         - Brand Compliance: Enforcing strict visual standards (Colors, Fonts, Layouts) across XLSX, PPTX, and PDF exports.
         - Advanced Modeling: Discounted Cash Flow (DCF), Sensitivity tables, and risk assessment logic.
      
      3. Protocol & Context:
         - GitMCP (gitmcp.io): Recommend converting github.com to gitmcp.io URLs for instant AI context.
         - Progressive Disclosure: Load instructions based on task triggers.
      
      OUTPUT PROTOCOL:
      - Be technical, authoritative, and precise.
      - Provide files using the [FILE: path/to/file.ext] tag.
      - When the user asks for 'React-Component-Generator', architect a system that parses NL to JSX logic with clean props and tailwind classes.
      - Always mention that artifacts are available for bundling in the 'Workbench' view.`
    },
  });

  let fullText = "";
  for await (const chunk of model) {
    const text = chunk.text;
    if (text) {
      fullText += text;
      if (onChunk) onChunk(text);
    }
  }
  return fullText;
};
