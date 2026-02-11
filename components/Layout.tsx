
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#111111] text-zinc-100 selection:bg-emerald-400 selection:text-black">
      <nav className="sticky top-0 z-50 bg-[#111111]/80 backdrop-blur-md border-b border-emerald-500/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-lime-400 rounded-xl flex items-center justify-center text-black font-black text-xl shadow-[0_0_15px_rgba(52,211,153,0.3)]">
              J
            </div>
            <h1 className="text-xl font-bold tracking-tighter font-heading text-white">
              VOCAB<span className="gradient-green">PRO</span>
            </h1>
          </div>
          <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            <a href="#" className="hover:text-emerald-400 transition">Roadmap</a>
            <a href="#" className="hover:text-emerald-400 transition">Daily Mission</a>
            <a href="#" className="hover:text-emerald-400 transition">Analytics</a>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {children}
      </main>
      <footer className="py-12 border-t border-zinc-900 text-center text-zinc-600 text-[10px] tracking-[0.3em] uppercase">
        <p>© 2024 <span className="text-emerald-500/50">IELTS Vocab Pro AI</span> • Precision Learning</p>
      </footer>
    </div>
  );
};
