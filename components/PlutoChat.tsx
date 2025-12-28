
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiResponse } from '../services/gemini';
import { ChatMessage } from '../types';

interface PlutoChatProps {
  onSkillGenerated: (skillContent: string) => void;
}

const PlutoChat: React.FC<PlutoChatProps> = ({ onSkillGenerated }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Bonjour ! Je suis Pluto, ton Architecte de Skills. Je suis prêt à forger ton prochain module. Quel est ton projet ?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      let fullModelText = "";
      await getGeminiResponse(input, messages, (chunk) => {
        fullModelText += chunk;
      });
      
      const modelMsg: ChatMessage = { role: 'model', text: fullModelText };
      setMessages(prev => [...prev, modelMsg]);

      // Check for structured file tags in the response
      if (fullModelText.includes('[FILE:')) {
         onSkillGenerated(fullModelText);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Erreur de connexion avec l'IA. Vérifiez votre clé API." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full border-l border-neutral-800 bg-[#080808] w-96 shadow-2xl z-10">
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
          <span className="text-sm font-semibold text-white">Pluto Assistant</span>
        </div>
        <div className="text-[10px] uppercase font-bold text-neutral-600 tracking-tighter bg-neutral-900 px-1.5 py-0.5 rounded">R3. ARCHITECT</div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-cyan-600 text-white rounded-tr-none' 
                : 'bg-neutral-900 text-neutral-300 border border-neutral-800 rounded-tl-none prose prose-invert prose-sm'
            }`}>
              {m.text.split('\n').map((line, idx) => (
                <p key={idx} className={line.startsWith('[FILE:') ? 'text-cyan-400 font-mono text-[10px] mt-2' : ''}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl rounded-tl-none">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.5s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-black border-t border-neutral-800">
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ex: 'Crée un skill pour analyser mes logs...'"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 pr-12 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none h-24 shadow-inner"
          />
          <button 
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="absolute bottom-4 right-4 p-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-20 transition-all shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-between mt-3 px-1">
          <span className="text-[9px] text-neutral-600 font-mono uppercase tracking-widest">Pluto OS v1.0.4</span>
          <span className="text-[9px] text-neutral-600 font-mono uppercase tracking-widest">Latency: ~2s</span>
        </div>
      </div>
    </div>
  );
};

export default PlutoChat;
