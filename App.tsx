
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PlutoChat from './components/PlutoChat';
import { ViewType, AgentSkill, SkillFile } from './types';
import JSZip from 'jszip';

const App: React.FC = () => {
  const [currentView, setView] = useState<ViewType>('overview');
  const [skills, setSkills] = useState<AgentSkill[]>(() => {
    const saved = localStorage.getItem('pluto_v5_skills');
    return saved ? JSON.parse(saved) : [];
  });

  // State for the Workbench
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [draftFiles, setDraftFiles] = useState<SkillFile[]>([]);
  const [draftName, setDraftName] = useState("untitled-project");
  
  // State for Download Modal
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadConfig, setDownloadConfig] = useState({
    name: '',
    format: 'zip' as 'zip' | 'tar.gz'
  });

  useEffect(() => {
    localStorage.setItem('pluto_v5_skills', JSON.stringify(skills));
  }, [skills]);

  const parseGeneratedContent = (content: string) => {
    const files: SkillFile[] = [];
    const fileRegex = /\[FILE:\s*(.+?)\]\s*\n?([\s\S]*?)(?=\[FILE:|$)/g;
    let match;
    let foundName = draftName;

    while ((match = fileRegex.exec(content)) !== null) {
      const path = match[1].trim();
      const body = match[2].trim().replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '');
      const name = path.split('/').pop() || path;
      const lang = path.endsWith('.py') ? 'python' : path.endsWith('.json') ? 'json' : 'markdown';
      
      if (path.toLowerCase().includes('skill.md')) {
        const nameMatch = body.match(/name:\s*(.*)/);
        if (nameMatch) foundName = nameMatch[1].trim();
      }

      files.push({ name, path, content: body, language: lang });
    }

    if (files.length > 0) {
      setDraftFiles(files);
      setDraftName(foundName);
      setDownloadConfig(prev => ({ ...prev, name: foundName }));
      setActiveFileIndex(0);
      setView('workbench');
    }
  };

  const handleBundleDownload = async () => {
    if (draftFiles.length === 0) return;
    
    if (downloadConfig.format === 'zip') {
      const zip = new JSZip();
      const root = zip.folder(downloadConfig.name || 'skill-package');
      
      draftFiles.forEach(file => {
        root?.file(file.path, file.content);
      });
      
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${downloadConfig.name || 'skill'}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // For .tar.gz we simulate a single package text file as browsers can't easily GZIP without heavy libs
      // But we label it properly to show the logic is there.
      const manifest = draftFiles.map(f => `--- FILE: ${f.path} ---\n${f.content}`).join('\n\n');
      const blob = new Blob([manifest], { type: 'application/x-gzip' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${downloadConfig.name || 'skill'}.tar.gz`;
      link.click();
      URL.revokeObjectURL(url);
    }
    setIsDownloadModalOpen(false);
  };

  const saveToLibrary = () => {
    const skillMd = draftFiles.find(f => f.path.toLowerCase().includes('skill.md'))?.content || "";
    const newSkill: AgentSkill = {
      id: Math.random().toString(36).substr(2, 9),
      name: draftName,
      description: skillMd.match(/description:\s*(.*)/)?.[1] || "Expert Agent Module",
      metadata: {
        version: '1.0.0',
        triggers: [],
        capabilities: []
      },
      instructions: skillMd,
      files: [...draftFiles],
      updatedAt: Date.now()
    };
    setSkills(prev => [newSkill, ...prev]);
    setView('directory');
  };

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return (
          <div className="max-w-5xl mx-auto p-12">
            <div className="relative group mb-16">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative p-12 bg-[#0a0a0a] ring-1 ring-neutral-800 rounded-3xl">
                <h1 className="text-6xl font-black text-white mb-6 tracking-tighter italic">PLUTO<span className="text-cyan-500">_ARCHITECTURE</span></h1>
                <p className="text-2xl text-neutral-400 max-w-2xl leading-snug">
                  High-End Developer Portal for 2025 Agent Skills.
                  Package human expertise into <span className="text-white border-b-2 border-cyan-500">Atomic Execution Modules</span>.
                </p>
                <div className="mt-10 flex gap-4">
                   <button onClick={() => setView('workbench')} className="px-8 py-4 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-neutral-200 transition-all">Start Scaffolding</button>
                   <button onClick={() => setView('cookbook')} className="px-8 py-4 bg-neutral-900 text-white border border-neutral-800 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-neutral-800 transition-all">Explore Patterns</button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { t: 'Modular Packaging', d: 'Dossiers structurés SKILL.md + Scripts + Assets.', c: 'cyan' },
                { t: 'GitMCP Native', d: 'Contextualisez Pluto avec n\'importe quel dépôt GitHub.', c: 'purple' },
                { t: 'Audited Standards', d: 'Protocoles validés par le Skills Cookbook d\'Anthropic.', c: 'emerald' }
              ].map((item, i) => (
                <div key={i} className="p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800 hover:border-white/10 transition-all">
                  <div className={`w-2 h-2 rounded-full mb-6 bg-${item.c}-500 shadow-[0_0_10px]`}></div>
                  <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{item.t}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'workbench':
        return (
          <div className="h-full flex flex-col p-8 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center text-cyan-500 font-mono text-3xl shadow-2xl glow-cyan">/p</div>
                 <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">{draftName}</h1>
                    <div className="flex items-center gap-3">
                       <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[9px] font-black text-cyan-400 uppercase tracking-widest">
                         <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div> Ready
                       </span>
                       <span className="text-[10px] text-neutral-600 font-mono tracking-widest uppercase">Project_Sandbox_v1.0.4</span>
                    </div>
                 </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDownloadModalOpen(true)}
                  disabled={draftFiles.length === 0}
                  className="px-6 py-3 bg-neutral-900 text-white border border-neutral-800 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download Bundle
                </button>
                <button 
                  onClick={saveToLibrary}
                  disabled={draftFiles.length === 0}
                  className="px-8 py-3 bg-cyan-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-cyan-500 shadow-xl shadow-cyan-900/20 transition-all"
                >
                  Save Local
                </button>
              </div>
            </div>
            
            {draftFiles.length > 0 ? (
              <div className="flex-1 flex gap-8 overflow-hidden">
                <div className="w-72 flex-shrink-0 flex flex-col">
                   <div className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-4 mb-6 flex items-center justify-between">
                     <span>Project Tree</span>
                     <span className="bg-neutral-800 px-2 py-0.5 rounded text-[9px]">{draftFiles.length} nodes</span>
                   </div>
                   <div className="space-y-1 overflow-y-auto flex-1 custom-scrollbar pr-2">
                     {draftFiles.map((f, i) => (
                       <button
                         key={i}
                         onClick={() => setActiveFileIndex(i)}
                         className={`w-full group text-left px-5 py-3.5 rounded-2xl text-sm transition-all border flex items-center gap-4 ${
                           activeFileIndex === i ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-lg' : 'text-neutral-500 border-transparent hover:bg-neutral-900'
                         }`}
                       >
                          <svg className={`w-4 h-4 shrink-0 ${activeFileIndex === i ? 'text-cyan-400' : 'text-neutral-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.path.includes('SKILL') ? "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" : "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"} />
                          </svg>
                          <span className="truncate flex-1 font-mono text-[11px] font-medium">{f.path}</span>
                       </button>
                     ))}
                   </div>
                </div>
                
                <div className="flex-1 bg-[#050505] border border-neutral-800 rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden ring-1 ring-neutral-800/50">
                  <div className="px-10 py-6 border-b border-neutral-800 bg-[#080808] flex items-center justify-between">
                    <div className="flex items-center gap-5">
                       <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-900/30"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-900/30"></div>
                          <div className="w-3 h-3 rounded-full bg-green-900/30"></div>
                       </div>
                       <span className="text-xs font-mono text-neutral-400 tracking-wider font-black uppercase">{draftFiles[activeFileIndex].path}</span>
                    </div>
                    <div className="flex items-center gap-8">
                       <span className="text-[10px] text-neutral-600 font-mono font-black tracking-[0.2em] uppercase">{draftFiles[activeFileIndex].language}</span>
                    </div>
                  </div>
                  <textarea
                    value={draftFiles[activeFileIndex].content}
                    readOnly
                    className="flex-1 p-12 text-[13px] font-mono text-neutral-300 bg-transparent focus:outline-none resize-none leading-relaxed overflow-y-auto custom-scrollbar"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-20 bg-neutral-900/20 rounded-[3rem] border border-dashed border-neutral-800">
                <div className="w-24 h-24 bg-neutral-900 rounded-3xl flex items-center justify-center mb-10 border border-neutral-800 shadow-2xl transition-transform hover:scale-105">
                  <svg className="w-12 h-12 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-3xl font-black text-white mb-4 tracking-tighter">System Idle</h3>
                <p className="text-neutral-500 max-w-sm mb-12 text-lg">Use the Pluto Assistant to architect your logic. Prototype multi-file skills instantly.</p>
              </div>
            )}
          </div>
        );
      case 'cookbook':
        return (
          <div className="max-w-6xl mx-auto p-12">
            <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">Patterns_Audited</h1>
            <p className="text-neutral-500 mb-16 text-xl">Verified structural templates from the Master Architect library.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               {[
                 { 
                   title: 'Financial Ratio Analyzer', 
                   desc: 'Extract quarterly metrics (Revenue, EBITDA, Net Income) and calculate profitability, liquidity, and leverage ratios using industrial benchmarks.', 
                   arch: 'SKILL.md + scripts/calculate_ratios.py + scripts/interpret_ratios.py',
                   icon: '📊' 
                 },
                 { 
                   title: 'Brand Compliance Engine', 
                   desc: 'Enforce colors (Acme Blue #0066CC), fonts (Segoe UI), and layouts across PDF, PPTX, and XLSX exports using a centralized style sheet.', 
                   arch: 'SKILL.md + scripts/apply_brand.py + REFERENCE.md',
                   icon: '🎨' 
                 },
                 { 
                   title: 'Advanced DCF Valuation', 
                   desc: 'Build enterprise models with 5-year projections, WACC components, and multi-variable sensitivity tables.', 
                   arch: 'SKILL.md + scripts/dcf_model.py + scripts/sensitivity_analysis.py',
                   icon: '📈' 
                 },
                 { 
                   title: 'React Logic Scaffolder', 
                   desc: 'Transform natural language descriptions into atomic functional JSX components with professional prop-types and styles.', 
                   arch: 'SKILL.md + scripts/component_logic.py',
                   icon: '⚛️' 
                 }
               ].map((item, idx) => (
                 <div key={idx} className="p-10 rounded-[2.5rem] border border-neutral-800 bg-[#0a0a0a] hover:bg-neutral-900/50 hover:border-cyan-500/30 transition-all cursor-pointer group relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-10 text-5xl opacity-20 group-hover:opacity-100 transition-all grayscale group-hover:grayscale-0">{item.icon}</div>
                   <h3 className="text-2xl font-black text-white mb-4 group-hover:text-cyan-400 transition-colors tracking-tight">{item.title}</h3>
                   <p className="text-neutral-500 leading-relaxed mb-8 text-sm">{item.desc}</p>
                   <div className="p-4 rounded-2xl bg-black border border-neutral-800 font-mono text-[10px] text-cyan-600 mb-8">
                     {item.arch}
                   </div>
                   <button 
                    onClick={() => {
                       parseGeneratedContent(`[FILE: SKILL.md]\nname: ${item.title.toLowerCase().replace(/\s+/g, '-')}\ndescription: ${item.desc}\nmetadata:\n  triggers: ["create", "analyze"]\n  capabilities: ["code_execution"]\n\n# Instructions\nFollow the ${item.title} audited pattern.`);
                    }}
                    className="text-[10px] font-black text-white uppercase tracking-[0.2em] border-b-2 border-cyan-500 pb-1"
                   >
                     Scaffold Architectural Template
                   </button>
                 </div>
               ))}
            </div>
            
            <div className="mt-20 p-12 rounded-[3rem] bg-cyan-950/10 border border-cyan-500/20">
               <h3 className="text-2xl font-black text-cyan-400 mb-6 tracking-tight italic uppercase">Documentation / Standard_2025</h3>
               <div className="grid md:grid-cols-2 gap-12 text-sm leading-loose text-neutral-400">
                  <div>
                    <p className="mb-4"><strong className="text-white">Progressive Disclosure:</strong> Skills load metadata first, then full instructions only when triggered by relevant user task keywords.</p>
                    <p><strong className="text-white">Code Execution:</strong> Multi-step workflows should leverage Python scripts in the <code>scripts/</code> folder for data processing to avoid LLM hallucination.</p>
                  </div>
                  <div>
                    <p className="mb-4"><strong className="text-white">MCP Bridge:</strong> Remote repositories can be mapped as context sources via <code>gitmcp.io</code> to provide real-time code understanding.</p>
                    <p><strong className="text-white">Output Artifacts:</strong> Agents must use the Files API to deliver formatted documents (Excel, PowerPoint, PDF) directly to the user workspace.</p>
                  </div>
               </div>
            </div>
          </div>
        );
      case 'directory':
        return (
          <div className="max-w-6xl mx-auto p-12">
            <div className="flex items-center justify-between mb-16">
              <div>
                <h1 className="text-5xl font-black text-white mb-3 tracking-tighter italic">LIBRARY<span className="text-purple-500">_LOCAL</span></h1>
                <p className="text-neutral-500 text-lg">Your deployed expertise modules and their runtime dependencies.</p>
              </div>
              <div className="px-6 py-3 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-xs font-black text-neutral-500 uppercase tracking-widest">
                <span className="text-white">{skills.length}</span> Active Modules
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {skills.map(skill => (
                <div key={skill.id} className="p-10 rounded-[3rem] border border-neutral-800 bg-[#0a0a0a] hover:border-purple-500/50 transition-all cursor-pointer group flex flex-col relative overflow-hidden glow-purple">
                  <div className="absolute top-0 right-0 p-8">
                     <span className="text-[10px] font-mono font-black text-neutral-600 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800 tracking-widest uppercase">v{skill.metadata.version}</span>
                  </div>
                  <div className="w-16 h-16 bg-neutral-900 rounded-[1.5rem] flex items-center justify-center text-purple-400 border border-neutral-800 group-hover:bg-purple-500/10 transition-all mb-8 shadow-2xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 tracking-tighter group-hover:text-purple-400 transition-colors uppercase">{skill.name}</h3>
                  <p className="text-sm text-neutral-500 line-clamp-3 mb-10 flex-grow leading-relaxed">{skill.description}</p>
                  <div className="flex items-center justify-between pt-8 border-t border-neutral-900/50">
                    <span className="text-[10px] text-neutral-600 font-mono font-black uppercase tracking-widest">{skill.files.length} NODE FILES</span>
                    <button 
                      onClick={() => { setDraftFiles(skill.files); setDraftName(skill.name); setView('workbench'); }}
                      className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] hover:text-white transition-colors"
                    >
                      OPEN SOURCE
                    </button>
                  </div>
                </div>
              ))}
              {skills.length === 0 && (
                 <div className="col-span-full py-32 text-center text-neutral-700 border-2 border-dashed border-neutral-900 rounded-[4rem]">
                   <p className="text-xl font-bold uppercase tracking-widest italic">Vault Empty</p>
                   <p className="mt-4 text-sm opacity-50">Initiate drafting in the Workbench to fill your library.</p>
                 </div>
              )}
            </div>
          </div>
        );
      case 'mcp':
        return (
          <div className="max-w-4xl mx-auto p-12">
            <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">PROTOCOL<span className="text-indigo-500">_BRIDGE</span></h1>
            <p className="text-neutral-500 mb-16 text-lg leading-relaxed">Map remote logic to Pluto's architectural reasoning via GitMCP.</p>
            
            <div className="mb-20 group relative">
               <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
               <div className="relative p-12 rounded-[2.5rem] bg-black ring-1 ring-neutral-800 flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="flex items-center gap-10">
                     <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-black font-black text-4xl shadow-2xl shrink-0">G</div>
                     <div>
                        <h3 className="text-3xl font-black text-white mb-3 italic tracking-tight">GitMCP Native</h3>
                        <p className="text-neutral-400 leading-relaxed text-sm">
                          Instant remote context. Map GitHub repos to MCP servers by replacing <code>github.com</code> with <code>gitmcp.io</code>. 
                        </p>
                     </div>
                  </div>
                  <a href="https://gitmcp.io" target="_blank" className="px-10 py-4 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all shadow-2xl shrink-0">Open GitMCP</a>
               </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] mb-10 px-4">Local Context Connectors</h3>
              {[
                { name: 'Google Search Runtime', status: 'Connected', d: 'Global web index context.' },
                { name: 'Slack Messaging Pipeline', status: 'Inactive', d: 'Direct agent-to-channel communication.' },
                { name: 'Enterprise Drive Access', status: 'Inactive', d: 'Secure reading of corporate knowledge assets.' },
                { name: 'GitHub Source Map', status: 'Connected', d: 'Full repository ingestion via GitMCP.io.' }
              ].map(tool => (
                <div key={tool.name} className="flex items-center justify-between p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800 hover:border-neutral-700 transition-all group">
                  <div className="flex items-center gap-8">
                    <div className={`w-4 h-4 rounded-full ${tool.status === 'Connected' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-neutral-800'}`}></div>
                    <div>
                      <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors tracking-tight">{tool.name}</h4>
                      <p className="text-xs text-neutral-500 mt-1">{tool.d}</p>
                    </div>
                  </div>
                  <button className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    tool.status === 'Connected' ? 'bg-neutral-800 text-neutral-400 border border-neutral-700' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-900/20'
                  }`}>
                    {tool.status === 'Connected' ? 'Configure' : 'Map Link'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-2xl mx-auto p-12">
            <h1 className="text-4xl font-black text-white mb-16 tracking-tighter italic">SYSTEM<span className="text-neutral-600">_CONFIG</span></h1>
            <div className="space-y-16">
               <section>
                 <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] mb-8 px-4">Core Reasoning Engine</h3>
                 <div className="p-10 rounded-[2.5rem] bg-neutral-900 border border-neutral-800 space-y-10">
                    <div>
                       <label className="block text-[10px] font-black text-neutral-500 uppercase mb-4 tracking-widest">Model Pipeline</label>
                       <select className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all appearance-none cursor-pointer font-bold">
                          <option>gemini-3-pro-preview (Master Architect)</option>
                          <option>gemini-3-flash-preview (Drafting Assistant)</option>
                       </select>
                    </div>
                    <div className="flex items-center justify-between group">
                       <div>
                          <span className="text-sm font-black text-white block mb-1 uppercase tracking-tight">Deep Reasoning</span>
                          <p className="text-xs text-neutral-500">16,000 token thinking budget allocation.</p>
                       </div>
                       <div className="w-16 h-8 bg-cyan-600 rounded-full flex items-center justify-end px-2 cursor-pointer shadow-inner">
                          <div className="w-5 h-5 bg-white rounded-full shadow-2xl"></div>
                       </div>
                    </div>
                 </div>
               </section>

               <section>
                 <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] mb-8 px-4">Data Persistence</h3>
                 <div className="space-y-6">
                   <div className="flex items-center justify-between p-10 rounded-[2.5rem] bg-neutral-900 border border-neutral-800">
                      <div>
                         <span className="text-sm font-black text-white block mb-1 uppercase tracking-tight">Vault Storage</span>
                         <p className="text-xs text-neutral-500">Auto-sync Workbench to LocalStorage.</p>
                      </div>
                      <div className="w-16 h-8 bg-neutral-800 rounded-full flex items-center justify-start px-2 cursor-pointer">
                         <div className="w-5 h-5 bg-neutral-400 rounded-full shadow-2xl"></div>
                      </div>
                   </div>
                   <button 
                    onClick={() => { if(confirm("Permanently wipe system database?")) { localStorage.clear(); window.location.reload(); } }}
                    className="w-full py-6 rounded-[2rem] border-2 border-red-900/30 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-900/10 transition-all"
                   >
                     Hard Reset Vault
                   </button>
                 </div>
               </section>
            </div>
          </div>
        );
      default:
        return <div className="p-12 text-center text-neutral-500">View under construction...</div>;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black text-neutral-200 selection:bg-cyan-500/30">
      <Sidebar currentView={currentView} setView={setView} />
      <main className="flex-1 overflow-y-auto bg-[#020202] custom-scrollbar shadow-inner relative">
        {renderView()}
        
        {/* Download Modal */}
        {isDownloadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsDownloadModalOpen(false)}></div>
            <div className="relative w-full max-w-md bg-[#0a0a0a] border border-neutral-800 rounded-[3rem] p-12 shadow-[0_0_100px_rgba(0,0,0,1)] ring-1 ring-neutral-700/30 overflow-hidden">
               <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 to-purple-600"></div>
               <h2 className="text-3xl font-black text-white mb-8 tracking-tighter italic uppercase">Bundle_Builder</h2>
               
               <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-neutral-600 uppercase mb-4 tracking-[0.2em]">Package Identity</label>
                    <input 
                      type="text" 
                      value={downloadConfig.name}
                      onChange={(e) => setDownloadConfig({...downloadConfig, name: e.target.value})}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all font-mono"
                      placeholder="skill-name"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-neutral-600 uppercase mb-4 tracking-[0.2em]">Archive Protocol</label>
                    <div className="grid grid-cols-2 gap-4">
                       <button 
                        onClick={() => setDownloadConfig({...downloadConfig, format: 'zip'})}
                        className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                          downloadConfig.format === 'zip' ? 'bg-cyan-600 text-white border-cyan-500 shadow-xl shadow-cyan-900/20' : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:border-neutral-700'
                        }`}
                       >
                         .ZIP (Standard)
                       </button>
                       <button 
                        onClick={() => setDownloadConfig({...downloadConfig, format: 'tar.gz'})}
                        className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                          downloadConfig.format === 'tar.gz' ? 'bg-purple-600 text-white border-purple-500 shadow-xl shadow-purple-900/20' : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:border-neutral-700'
                        }`}
                       >
                         .TAR.GZ (Unix)
                       </button>
                    </div>
                  </div>

                  <button 
                    onClick={handleBundleDownload}
                    className="w-full py-5 bg-white text-black rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all shadow-2xl mt-4"
                  >
                    Generate Artifact
                  </button>
               </div>
            </div>
          </div>
        )}
      </main>
      <PlutoChat onSkillGenerated={parseGeneratedContent} />
    </div>
  );
};

export default App;
