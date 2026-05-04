import { useState, useEffect } from 'react';
import { SiVite, SiShadcnui, SiReact, SiTailwindcss } from "react-icons/si";
import { ArrowRight, MousePointer2, Terminal, Code2 } from 'lucide-react';

export default function Home({ c }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    { name: "React", icon: <SiReact className="w-4 h-4" />, description: "Component-based library for building deterministic user interfaces.", url: "https://reactjs.org" },
    { name: "Vite", icon: <SiVite className="w-4 h-4" />, description: "Native ESM powered frontend tooling. Instant server start.", url: "https://vitejs.dev" },
    { name: "Shadcn UI", icon: <SiShadcnui className="w-4 h-4" />, description: "Radix UI and Tailwind CSS components designed for accessibility.", url: "https://ui.shadcn.com" },
    { name: "Tailwind", icon: <SiTailwindcss className="w-4 h-4" />, description: "Utility-first CSS framework for rapid UI development.", url: "https://tailwindcss.com" }
  ];

  return (
    <>
      <section className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-center gap-2 mb-6">
          <div className={`px-2 py-0.5 border ${c.border} rounded-sm`}>
            <span className={`text-[10px] font-bold font-mono uppercase tracking-tighter ${c.textMuted}`}>v1.0.4—stable</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
          Advanced tooling for <br/>modern web interfaces.
        </h1>
        <p className={`${c.textMuted} text-lg mb-10 leading-relaxed max-w-xl`}>
          A strictly typed, high-performance development stack utilizing React, Vite, Shadcn UI, and Tailwind CSS.
        </p>
        <div className="flex flex-wrap gap-4">
          <button className={`${c.accent} ${c.accentText} px-6 py-3 rounded-sm font-bold text-sm uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-opacity`}>
            Initialize <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <section id="demo" className="mt-24">
        <div className={`${c.card} border ${c.border} p-8 rounded-sm`}>
          <div className="flex items-center gap-2 mb-6">
            <MousePointer2 className={`w-4 h-4 ${c.textMuted}`} />
            <h2 className="text-sm font-bold uppercase tracking-widest font-mono text-[#F2EDED]">Runtime Demo</h2>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className={`text-xs font-mono ${c.textMuted} block mb-1 uppercase tracking-tight`}>Current_State:</span>
              <span className="text-4xl font-mono font-bold">{count.toString().padStart(2, '0')}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCount(Math.max(0, count - 1))} className={`w-12 h-12 border ${c.border} flex items-center justify-center font-mono text-xl hover:bg-[#B7B1B1]/10`}>-</button>
              <button onClick={() => setCount(count + 1)} className={`w-12 h-12 border ${c.border} flex items-center justify-center font-mono text-xl hover:bg-[#B7B1B1]/10`}>+</button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-24 space-y-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-4 h-4 text-[#B7B1B1]" />
            <h2 className="text-sm font-bold uppercase tracking-widest font-mono">Method_01: NPX</h2>
          </div>
          <div className={`${c.card} border ${c.border} p-6 font-mono text-sm leading-relaxed overflow-x-auto`}>
            <div className="text-[#B7B1B1] mb-2">PS C:\\Users\\belma&gt; <span className="text-[#F2EDED]">npx create-rvst</span></div>
            <div className="text-green-500">√ Enter your project name: <span className="text-[#B7B1B1]">... cool project</span></div>
            <div className="mt-4 flex items-center gap-2">
              <span>🚀</span>
              <span className="text-[#F2EDED]">Creating a new RVST-Stack project: <span className="text-indigo-400">cool project</span></span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span>📦</span>
              <span className="text-[#B7B1B1]">Installing dependencies...</span>
            </div>
            <div className="mt-2 animate-pulse text-[#F2EDED]">-</div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-4 h-4 text-[#B7B1B1]" />
            <h2 className="text-sm font-bold uppercase tracking-widest font-mono">Method_02: Clowy CLI</h2>
          </div>
          <div className={`${c.card} border ${c.border} p-6 font-mono text-sm leading-relaxed overflow-x-auto`}>
            <div className="text-[#B7B1B1] mb-2">PS C:\\Users\\belma&gt; <span className="text-[#F2EDED]">clowy -r</span></div>
            <div className="text-blue-400">? Enter your project name: <span className="text-[#F2EDED]">» my-rvst-app</span></div>
          </div>
        </div>
      </section>

      <section className="mt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#B7B1B1]/20 border border-[#B7B1B1]/20">
          {features.map((f) => (
            <div key={f.name} className={`${c.bg} p-8 hover:bg-[#1A1818] transition-colors group`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 flex items-center justify-center border ${c.border} group-hover:border-[#F2EDED]/50 transition-colors`}>{f.icon}</div>
                <h3 className="font-bold uppercase tracking-tight font-mono">{f.name}</h3>
              </div>
              <p className={`text-sm ${c.textMuted} leading-relaxed mb-6`}>{f.description}</p>
              <a href={f.url} className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold flex items-center gap-2 hover:underline">View_Docs —&gt;</a>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
