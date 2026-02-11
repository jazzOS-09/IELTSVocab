
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { fetchTopicsForBand, fetchVocabForTopic, playTTS } from './services/geminiService';
import { IELTSTopic, IELTSVocab, BandScore } from './types';

const AIProcessingScreen = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
    <div className="relative mb-10">
      <div className="w-24 h-24 rounded-full border-t-2 border-emerald-500 animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
      </div>
    </div>
    <p className="text-zinc-500 font-medium tracking-widest uppercase text-[10px] animate-pulse">{message}</p>
  </div>
);

const App: React.FC = () => {
  const [inputBand, setInputBand] = useState("");
  const [band, setBand] = useState<BandScore>("");
  const [topics, setTopics] = useState<IELTSTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<IELTSTopic | null>(null);
  const [vocabList, setVocabList] = useState<IELTSVocab[]>([]);
  const [activeVocab, setActiveVocab] = useState<IELTSVocab | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingVocab, setLoadingVocab] = useState(false);
  
  const [showPractice, setShowPractice] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleBandSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const val = inputBand || band;
    if (!val) return;
    
    setBand(val);
    setLoading(true);
    setSelectedTopic(null);
    setVocabList([]);
    try {
      const data = await fetchTopicsForBand(val);
      setTopics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopic = async (topic: IELTSTopic) => {
    setSelectedTopic(topic);
    setLoadingVocab(true);
    try {
      const data = await fetchVocabForTopic(band, topic.title);
      setVocabList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVocab(false);
    }
  };

  const resetAll = () => {
    setBand("");
    setInputBand("");
    setTopics([]);
    setSelectedTopic(null);
    setVocabList([]);
    setShowPractice(false);
  };

  const renderHome = () => (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Next-Gen IELTS Learning
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none font-heading">
          BỨT PHÁ <br />
          <span className="gradient-green">VOCABULARY</span>
        </h1>
        <p className="text-zinc-500 max-w-lg mx-auto text-lg">
          Trợ lý AI phân tích band điểm và cung cấp lộ trình từ vựng chuyên sâu mỗi ngày.
        </p>
      </div>

      <div className="relative max-w-xl mx-auto group">
        <form onSubmit={handleBandSubmit} className="relative z-10 flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-2xl focus-within:border-emerald-500/50 transition-all">
          <input 
            type="text" 
            placeholder="Gõ Band điểm của bạn (ví dụ: 3.0, 7.5)..." 
            value={inputBand}
            onChange={(e) => setInputBand(e.target.value)}
            className="flex-1 bg-transparent px-6 py-4 text-white placeholder:text-zinc-600 font-medium"
          />
          <button 
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-xl font-bold transition-all active:scale-95"
          >
            Bắt đầu
          </button>
        </form>
        <div className="absolute -inset-4 bg-emerald-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 opacity-60">
        {["4.0", "5.5", "6.5", "7.5", "8.5"].map(b => (
          <button 
            key={b} 
            onClick={() => { setInputBand(b); setBand(b); handleBandSubmit(); }}
            className="px-6 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-sm font-semibold transition-all"
          >
            Band {b}
          </button>
        ))}
      </div>
    </div>
  );

  const renderTopics = () => (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-8">
        <div>
          <button onClick={resetAll} className="text-zinc-500 hover:text-emerald-500 text-xs font-bold uppercase tracking-widest mb-4 transition-colors flex items-center gap-2">
            ← Đổi Band điểm
          </button>
          <h2 className="text-4xl md:text-5xl font-black font-heading tracking-tighter">
            CHỦ ĐỀ <span className="text-zinc-700 italic">BAND {band}</span>
          </h2>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1">AI Recommendation</p>
          <p className="text-emerald-500 font-bold">12 Topics Selected</p>
        </div>
      </div>

      {loading ? (
        <AIProcessingScreen message="AI đang phân tích các chủ đề phù hợp..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map(t => (
            <button 
              key={t.id}
              onClick={() => handleSelectTopic(t)}
              className="glass-card p-8 rounded-[2rem] text-left transition-all group relative overflow-hidden active:scale-95"
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
              <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-4">{t.commonInPart}</p>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{t.title}</h3>
              <p className="text-zinc-500 text-xs font-bold uppercase mb-4 tracking-wider">{t.vietnameseTitle}</p>
              <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2">{t.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderVocab = () => (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <button onClick={() => setSelectedTopic(null)} className="text-zinc-500 hover:text-emerald-500 text-xs font-bold uppercase tracking-widest mb-2 transition-colors">
            ← Quay lại chủ đề
          </button>
          <h2 className="text-5xl md:text-7xl font-black font-heading tracking-tighter uppercase leading-none">
            {selectedTopic?.title}
          </h2>
          <p className="text-zinc-500 text-lg">{selectedTopic?.vietnameseTitle} • Band {band}</p>
        </div>
        {!loadingVocab && (
          <button 
            onClick={() => { setCurrentCardIndex(0); setIsFlipped(false); setShowPractice(true); }}
            className="bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 px-8 py-4 rounded-2xl text-white font-bold transition-all shadow-xl flex items-center gap-3 active:scale-95"
          >
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            Luyện Flashcards
          </button>
        )}
      </div>

      {loadingVocab ? (
        <AIProcessingScreen message="AI đang lựa chọn 20 từ vựng đắt giá nhất..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vocabList.map((v, i) => (
            <div 
              key={i} 
              onClick={() => setActiveVocab(v)}
              className="glass-card p-6 rounded-2xl flex items-center justify-between group cursor-pointer hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-600 font-black text-sm group-hover:bg-emerald-500 group-hover:text-black transition-all">
                  {(i + 1).toString().padStart(2, '0')}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">{v.phrase}</h4>
                  <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{v.vietnameseMeaning}</p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); playTTS(v.phrase); }}
                className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center text-zinc-500"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="min-h-[80vh]">
        {!band ? renderHome() : !selectedTopic ? renderTopics() : renderVocab()}
      </div>

      {/* Vocab Modal */}
      {activeVocab && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-xl glass-card rounded-[3rem] p-10 relative animate-in zoom-in-95 duration-300 space-y-8">
            <button onClick={() => setActiveVocab(null)} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="space-y-4">
              <h3 className="text-5xl font-black font-heading tracking-tighter text-white">{activeVocab.phrase}</h3>
              <p className="text-2xl font-black text-zinc-700 italic">{activeVocab.pronunciation}</p>
              <div className="h-px w-20 bg-emerald-500"></div>
              <p className="text-2xl font-bold text-emerald-400">{activeVocab.vietnameseMeaning}</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em]">Definition</p>
                <p className="text-zinc-400 italic leading-relaxed">{activeVocab.meaning}</p>
              </div>
              <div className="bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700/30">
                <p className="text-zinc-200 font-semibold italic">"{activeVocab.exampleSentence}"</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeVocab.synonyms.map((s, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-500 font-bold">{s}</span>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => setActiveVocab(null)}
              className="w-full py-4 bg-zinc-900 text-zinc-500 font-black uppercase tracking-widest rounded-2xl border border-zinc-800 hover:text-white transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Practice Modal */}
      {showPractice && vocabList.length > 0 && (
        <div className="fixed inset-0 z-[110] bg-[#09090b] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="w-full max-w-lg space-y-8">
              <div className="flex items-center justify-between">
                <button onClick={() => setShowPractice(false)} className="p-2 text-zinc-600 hover:text-white">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em]">Practice Mode</p>
                  <p className="text-xl font-black">{currentCardIndex + 1} / {vocabList.length}</p>
                </div>
                <div className="w-10"></div>
              </div>

              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative w-full aspect-[4/5] perspective-1000 cursor-pointer group"
              >
                <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden bg-zinc-900 border-2 border-zinc-800 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl">
                    <p className="text-[10px] font-black uppercase text-zinc-700 tracking-[0.5em] mb-12">IELTS Term</p>
                    <h3 className="text-4xl md:text-5xl font-black font-heading leading-tight mb-6 group-hover:text-emerald-400 transition-colors">
                      {vocabList[currentCardIndex].phrase}
                    </h3>
                    <p className="text-zinc-600 font-mono tracking-widest">{vocabList[currentCardIndex].pronunciation}</p>
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-zinc-900 border-2 border-emerald-500/20 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl">
                    <p className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.5em] mb-12">Meaning</p>
                    <h3 className="text-3xl md:text-4xl font-black leading-tight mb-8">
                      {vocabList[currentCardIndex].vietnameseMeaning}
                    </h3>
                    <div className="space-y-4">
                      <p className="text-zinc-500 text-sm leading-relaxed italic">{vocabList[currentCardIndex].meaning}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6">
                <button 
                  disabled={currentCardIndex === 0}
                  onClick={() => { setCurrentCardIndex(p => p - 1); setIsFlipped(false); }}
                  className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 hover:text-white disabled:opacity-20 transition-all"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button 
                  onClick={() => playTTS(vocabList[currentCardIndex].phrase)}
                  className="w-20 h-20 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-2xl shadow-emerald-500/20 active:scale-90 transition-all"
                >
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                </button>
                <button 
                  onClick={() => { 
                    if (currentCardIndex < vocabList.length - 1) {
                      setCurrentCardIndex(p => p + 1); setIsFlipped(false);
                    } else {
                      setShowPractice(false);
                    }
                  }}
                  className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 hover:text-white transition-all"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
           </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
