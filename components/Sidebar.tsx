
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: 'M12 4.5l7.5 7.5-7.5 7.5M4.5 12h15' },
    { id: 'workbench', label: 'Workbench', icon: 'M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'cookbook', label: 'Patterns', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'directory', label: 'Library', icon: 'M4 6h16M4 12h16M4 18h16' },
    { id: 'mcp', label: 'Protocol Bridge', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  ];

  const adminItems = [
    { id: 'settings', label: 'System', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <aside className="w-72 border-r border-neutral-800 flex flex-col h-full bg-[#050505] text-neutral-400">
      <div className="p-10 border-b border-neutral-800 flex items-center gap-5">
        <div className="w-12 h-12 bg-cyan-600 rounded-[1.2rem] flex items-center justify-center text-black font-black text-2xl shadow-[0_0_25px_rgba(6,182,212,0.3)] glow-cyan">P</div>
        <div>
           <span className="text-white font-black tracking-tighter text-xl block leading-none">PLUTO</span>
           <span className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">Architects</span>
        </div>
      </div>

      <div className="flex-1 py-8 overflow-y-auto px-6">
        <div className="mb-6 text-[10px] font-black text-neutral-700 uppercase tracking-[0.3em] px-4">Workspace</div>
        <nav className="space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewType)}
              className={`w-full flex items-center gap-5 px-5 py-4 text-sm rounded-[1.5rem] transition-all duration-500 group ${
                currentView === item.id 
                  ? 'bg-neutral-800 text-white shadow-2xl border border-neutral-700' 
                  : 'hover:bg-neutral-900 hover:text-neutral-200 border border-transparent'
              }`}
            >
              <svg className={`w-5 h-5 shrink-0 transition-transform duration-500 group-hover:scale-110 ${currentView === item.id ? 'text-cyan-500' : 'text-neutral-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
              </svg>
              <span className="font-bold tracking-tight uppercase text-[11px] tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-12 mb-6 text-[10px] font-black text-neutral-700 uppercase tracking-[0.3em] px-4">System_Core</div>
        <nav className="space-y-2">
          {adminItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewType)}
              className={`w-full flex items-center gap-5 px-5 py-4 text-sm rounded-[1.5rem] transition-all duration-500 group ${
                currentView === item.id 
                  ? 'bg-neutral-800 text-white shadow-xl border border-neutral-700' 
                  : 'hover:bg-neutral-900 hover:text-neutral-200 border border-transparent'
              }`}
            >
              <svg className={`w-5 h-5 shrink-0 group-hover:rotate-45 transition-transform duration-700 ${currentView === item.id ? 'text-purple-500' : 'text-neutral-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
              </svg>
              <span className="font-bold tracking-tight uppercase text-[11px] tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      <div className="p-8 border-t border-neutral-800">
        <div className="bg-[#0a0a0a] p-5 rounded-[2rem] border border-neutral-800 group transition-all hover:border-cyan-500/40 relative overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-500/20"></div>
          <div className="text-xs font-mono text-cyan-400 flex items-center justify-between mb-2">
            <span className="font-black italic">OS_v1.0.9</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
          </div>
          <div className="text-[9px] text-neutral-600 uppercase font-black tracking-[0.2em] leading-none">Architect_Encrypted</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
