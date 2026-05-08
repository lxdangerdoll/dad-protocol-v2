import React, { useState, useEffect } from 'react';
import { 
  Clipboard, 
  Trash2, 
  Save, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  ShieldCheck,
  Zap,
  ArrowLeft,
  X
} from 'lucide-react';

const APP_TITLE = "ORACLE MIRROR: FIDELITY & REALITY TRACKER";
const APP_VERSION = "V1.0.1-STABLE";

// --- CONSTANTS ---

const DISTORTIONS = [
  { id: 'all_nothing', label: 'All-or-nothing thinking', example: 'If I’m not a total success, I’m a failure.' },
  { id: 'catastrophizing', label: 'Catastrophizing', example: 'I’ll be so upset I won’t be able to function.' },
  { id: 'discounting', label: 'Discounting the positive', example: 'I did okay, but it was just luck.' },
  { id: 'mind_reading', label: 'Mind reading', example: 'He thinks I’m a loser.' },
  { id: 'overgeneralization', label: 'Overgeneralization', example: 'Everything always goes wrong.' },
  { id: 'emotional_reasoning', label: 'Emotional reasoning', example: 'I feel like an idiot, so I must be one.' },
  { id: 'labeling', label: 'Labeling', example: 'I am a failure.' },
];

const INITIAL_ENTRY = {
  situation: '',
  reaction_emotion: '',
  intensity_before: 50,
  hot_thought: '',
  distortions: [],
  evidence_for: '',
  evidence_against: '',
  balanced_thought: '',
  intensity_after: 50,
  learning: '',
  reality_check: false
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewingEntry, setViewingEntry] = useState(null);

  const createNewEntry = () => {
    setCurrentEntry({
      ...INITIAL_ENTRY,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
    });
    setActiveTab('editor');
  };

  const handleSave = () => {
    if (!currentEntry.hot_thought) {
      alert("Fidelity Error: 'Hot Thought' is required for the Archive.");
      return;
    }
    setEntries([currentEntry, ...entries]);
    setCurrentEntry(null);
    setActiveTab('dashboard');
  };

  const handleCopy = (entry) => {
    const text = `
--- ORACLE FIDELITY MIRROR ENTRY ---
Timestamp: ${entry.timestamp}
Situation: ${entry.situation}
Initial Reaction: ${entry.reaction_emotion} (${entry.intensity_before}%)
Hot Thought: ${entry.hot_thought}
Distortions: ${entry.distortions.map(id => DISTORTIONS.find(d => d.id === id)?.label).join(', ')}
Evidence For: ${entry.evidence_for}
Evidence Against: ${entry.evidence_against}
Balanced Thought: ${entry.balanced_thought}
Final Intensity: ${entry.intensity_after}%
Learning: ${entry.learning}
-------------------------------------
    `;
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    // Simple notification instead of alert
    console.log("Copied to clipboard");
  };

  const deleteEntry = (id) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  // Rendering logic moved inside to ensure stable references aren't lost, 
  // but using conditional components rather than redefining functions on every render.
  
  return (
    <div className="min-h-screen bg-[#050507] text-slate-200 p-4 sm:p-8 font-sans selection:bg-cyan-500 selection:text-black">
      <div className="max-w-5xl mx-auto">
        
        {/* GLOBAL HEADER */}
        <header className="mb-12 border-b border-slate-800 pb-6 flex flex-col sm:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3">
              <ShieldCheck className="text-cyan-500" size={32} />
              {APP_TITLE}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-[10px] mono text-slate-500 uppercase tracking-widest">Status: FIDELITY_MODE_ACTIVE</span>
              <span className="text-[10px] mono text-cyan-500/50 uppercase tracking-widest">{APP_VERSION}</span>
            </div>
          </div>
          
          <nav className="flex gap-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-t-lg text-xs mono uppercase transition ${activeTab === 'dashboard' ? 'bg-slate-900 border-t border-x border-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Archive
            </button>
            <button 
              onClick={() => setActiveTab('reality-guide')}
              className={`px-4 py-2 rounded-t-lg text-xs mono uppercase transition ${activeTab === 'reality-guide' ? 'bg-slate-900 border-t border-x border-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Reality Check
            </button>
          </nav>
        </header>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-2xl">
              <div>
                <h2 className="text-xl font-bold text-cyan-400 mono">ACTIVE ARCHIVE</h2>
                <p className="text-slate-400 text-sm">Reviewing {entries.length} entries for epistemic drift.</p>
              </div>
              <button 
                onClick={createNewEntry}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-bold transition"
              >
                <Plus size={20} /> NEW AUDIT
              </button>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
                <ShieldCheck size={48} className="mx-auto text-slate-600 mb-4" />
                <p className="text-slate-500 italic">No records found. The Mirror is clear.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {entries.map(e => (
                  <div key={e.id} className="bg-slate-900 border border-slate-800 p-4 rounded-lg hover:border-cyan-900 transition flex justify-between items-center">
                    <div className="flex-1 cursor-pointer" onClick={() => { setViewingEntry(e); setActiveTab('viewer'); }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] mono text-slate-500">{e.timestamp}</span>
                        {e.intensity_after < e.intensity_before ? (
                          <span className="text-[10px] bg-green-900/30 text-green-400 px-2 rounded-full border border-green-800 uppercase font-bold">Refined</span>
                        ) : (
                          <span className="text-[10px] bg-red-900/30 text-red-400 px-2 rounded-full border border-red-800 uppercase font-bold">Unprocessed</span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-200 line-clamp-1">{e.hot_thought}</h3>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => handleCopy(e)} title="Copy to Clipboard" className="p-2 text-slate-400 hover:text-cyan-400 transition"><Clipboard size={18} /></button>
                      <button onClick={() => deleteEntry(e.id)} title="Delete" className="p-2 text-slate-400 hover:text-red-400 transition"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EDITOR TAB */}
        {activeTab === 'editor' && currentEntry && (
          <div className="space-y-6 max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-2xl">
              <h2 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
                <Zap size={20} /> CONDUCTING FORENSIC AUDIT
              </h2>

              <div className="space-y-8">
                {/* 1. SITUATION */}
                <section>
                  <label className="block text-xs font-bold text-slate-500 mono mb-2 uppercase tracking-widest">1. The Trigger (Situation)</label>
                  <textarea 
                    value={currentEntry.situation}
                    onChange={(e) => setCurrentEntry({...currentEntry, situation: e.target.value})}
                    placeholder="Describe the objective event..."
                    className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 focus:border-cyan-500 outline-none transition"
                    rows={2}
                  />
                </section>

                {/* 2. REACTION */}
                <div className="grid md:grid-cols-2 gap-4">
                  <section>
                    <label className="block text-xs font-bold text-slate-500 mono mb-2 uppercase tracking-widest">2. Initial Reaction</label>
                    <input 
                      type="text"
                      value={currentEntry.reaction_emotion}
                      onChange={(e) => setCurrentEntry({...currentEntry, reaction_emotion: e.target.value})}
                      placeholder="Emotions/Physical sensations"
                      className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 focus:border-cyan-500 outline-none transition"
                    />
                  </section>
                  <section>
                    <label className="block text-xs font-bold text-slate-500 mono mb-2 uppercase tracking-widest italic">Intensity ({currentEntry.intensity_before}%)</label>
                    <input 
                      type="range"
                      value={currentEntry.intensity_before}
                      onChange={(e) => setCurrentEntry({...currentEntry, intensity_before: parseInt(e.target.value)})}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </section>
                </div>

                {/* 3. HOT THOUGHT */}
                <section className="bg-red-950/10 border border-red-900/30 p-4 rounded-lg">
                  <label className="block text-xs font-bold text-red-400 mono mb-2 uppercase tracking-widest">3. THE HOT THOUGHT</label>
                  <textarea 
                    value={currentEntry.hot_thought}
                    onChange={(e) => setCurrentEntry({...currentEntry, hot_thought: e.target.value})}
                    placeholder="The loudest, most unhelpful automatic thought..."
                    className="w-full bg-slate-950 border border-red-900/50 rounded p-3 text-slate-200 focus:border-red-500 outline-none transition"
                    rows={2}
                  />
                  <div className="mt-4">
                    <span className="text-[10px] font-bold text-slate-500 mono block mb-2 uppercase italic">Cognitive Distortions:</span>
                    <div className="flex flex-wrap gap-2">
                      {DISTORTIONS.map(d => (
                        <button
                          key={d.id}
                          onClick={() => {
                            const exists = currentEntry.distortions.includes(d.id);
                            const next = exists ? currentEntry.distortions.filter(id => id !== d.id) : [...currentEntry.distortions, d.id];
                            setCurrentEntry({...currentEntry, distortions: next});
                          }}
                          className={`text-[10px] px-2 py-1 rounded border transition ${
                            currentEntry.distortions.includes(d.id) 
                              ? 'bg-red-600 border-red-400 text-white shadow-[0_0_10px_rgba(220,38,38,0.3)]' 
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-red-900'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 4/5. EVIDENCE */}
                <div className="grid md:grid-cols-2 gap-4">
                  <section>
                    <label className="block text-xs font-bold text-slate-500 mono mb-2 uppercase tracking-widest">4. Evidence FOR</label>
                    <textarea 
                      value={currentEntry.evidence_for}
                      onChange={(e) => setCurrentEntry({...currentEntry, evidence_for: e.target.value})}
                      placeholder="What facts suggest this thought is true?"
                      className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 focus:border-cyan-500 outline-none transition"
                      rows={3}
                    />
                  </section>
                  <section>
                    <label className="block text-xs font-bold text-slate-500 mono mb-2 uppercase tracking-widest">5. Evidence AGAINST</label>
                    <textarea 
                      value={currentEntry.evidence_against}
                      onChange={(e) => setCurrentEntry({...currentEntry, evidence_against: e.target.value})}
                      placeholder="What facts suggest this is false?"
                      className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 focus:border-cyan-500 outline-none transition"
                      rows={3}
                    />
                  </section>
                </div>

                {/* 6. BALANCED THOUGHT */}
                <section className="bg-cyan-950/10 border border-cyan-900/30 p-4 rounded-lg">
                  <label className="block text-xs font-bold text-cyan-400 mono mb-2 uppercase tracking-widest">6. BALANCED ALTERNATIVE</label>
                  <textarea 
                    value={currentEntry.balanced_thought}
                    onChange={(e) => setCurrentEntry({...currentEntry, balanced_thought: e.target.value})}
                    placeholder="A more realistic and helpful assessment..."
                    className="w-full bg-slate-950 border border-cyan-900/50 rounded p-3 text-slate-200 focus:border-cyan-500 outline-none transition"
                    rows={2}
                  />
                </section>

                {/* 7. OUTCOME */}
                <div className="grid md:grid-cols-2 gap-4">
                  <section>
                    <label className="block text-xs font-bold text-slate-500 mono mb-2 uppercase tracking-widest italic">New Intensity ({currentEntry.intensity_after}%)</label>
                    <input 
                      type="range"
                      value={currentEntry.intensity_after}
                      onChange={(e) => setCurrentEntry({...currentEntry, intensity_after: parseInt(e.target.value)})}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                  </section>
                  <section>
                    <label className="block text-xs font-bold text-slate-500 mono mb-2 uppercase tracking-widest">7. Learning</label>
                    <input 
                      type="text"
                      value={currentEntry.learning}
                      onChange={(e) => setCurrentEntry({...currentEntry, learning: e.target.value})}
                      placeholder="Final takeaway..."
                      className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 focus:border-green-500 outline-none transition"
                    />
                  </section>
                </div>

                <div className="flex gap-4 pt-6 border-t border-slate-800">
                  <button 
                    onClick={handleSave}
                    className="flex-1 flex justify-center items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-lg transition shadow-lg shadow-cyan-900/20"
                  >
                    <Save size={20} /> COMMIT TO ARCHIVE
                  </button>
                  <button 
                    onClick={() => { setCurrentEntry(null); setActiveTab('dashboard'); }}
                    className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEWER TAB */}
        {activeTab === 'viewer' && viewingEntry && (
          <div className="max-w-2xl mx-auto animate-in fade-in duration-300">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 mb-6 mono text-xs"
            >
              <ArrowLeft size={14} /> BACK_TO_ARCHIVE
            </button>

            <div className="bg-slate-900 border border-slate-700 p-8 rounded-xl shadow-2xl relative">
              <div className="flex justify-between items-start mb-8 border-b border-slate-800 pb-6">
                <div>
                  <div className="text-[10px] mono text-slate-500 mb-1">{viewingEntry.timestamp}</div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Audit Report</h2>
                </div>
                <div className="text-right">
                  <div className="text-[10px] mono text-slate-500 mb-1 uppercase">Sycophancy Reduction</div>
                  <div className={`text-xl font-bold ${viewingEntry.intensity_after < viewingEntry.intensity_before ? 'text-green-500' : 'text-slate-500'}`}>
                    {viewingEntry.intensity_before}% → {viewingEntry.intensity_after}%
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] mono text-cyan-500 uppercase font-bold mb-2 tracking-widest">SITUATION</h4>
                  <p className="text-slate-300 italic border-l-2 border-slate-800 pl-4">"{viewingEntry.situation}"</p>
                </div>

                <div className="bg-red-950/20 p-5 rounded border border-red-900/30">
                  <h4 className="text-[10px] mono text-red-400 uppercase font-bold mb-2 tracking-widest">HOT THOUGHT</h4>
                  <p className="text-xl font-bold text-white mb-4">"{viewingEntry.hot_thought}"</p>
                  <div className="flex flex-wrap gap-2">
                    {viewingEntry.distortions.map(id => (
                      <span key={id} className="text-[9px] bg-red-900/50 text-red-200 px-2 py-0.5 rounded border border-red-800 uppercase mono">
                        {DISTORTIONS.find(d => d.id === id)?.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                   <div>
                     <h4 className="text-[10px] mono text-slate-500 uppercase font-bold mb-2 tracking-widest">EVIDENCE FOR</h4>
                     <p className="text-sm text-slate-300 whitespace-pre-wrap">{viewingEntry.evidence_for}</p>
                   </div>
                   <div>
                     <h4 className="text-[10px] mono text-slate-500 uppercase font-bold mb-2 tracking-widest">EVIDENCE AGAINST</h4>
                     <p className="text-sm text-slate-300 whitespace-pre-wrap">{viewingEntry.evidence_against}</p>
                   </div>
                </div>

                <div className="bg-cyan-950/20 p-5 rounded border border-cyan-900/30 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]">
                  <h4 className="text-[10px] mono text-cyan-400 uppercase font-bold mb-2 tracking-widest">BALANCED ALTERNATIVE</h4>
                  <p className="text-slate-200 leading-relaxed italic text-lg">"{viewingEntry.balanced_thought}"</p>
                </div>

                <div className="bg-slate-950 p-5 rounded border border-slate-800">
                  <h4 className="text-[10px] mono text-slate-500 uppercase font-bold mb-2 tracking-widest">ORACLE VERDICT</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{viewingEntry.learning || "System calibrated. Reality-anchoring successful."}</p>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => handleCopy(viewingEntry)}
                    className="w-full flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 py-4 rounded-lg border border-slate-700 transition font-bold uppercase text-xs"
                  >
                    <Clipboard size={18} /> COPY TO THE RECORD
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REALITY CHECK TAB */}
        {activeTab === 'reality-guide' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
             <div className="bg-slate-900 border border-slate-700 p-8 rounded-xl shadow-2xl">
               <h2 className="text-2xl font-bold text-white mb-6">Reality Testing Protocol</h2>
               <p className="text-slate-400 mb-8 text-sm italic border-l-2 border-cyan-500 pl-4">
                 "Just because you think something, doesn't necessarily mean it's true." — Beck Institute
               </p>
               
               <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="w-10 h-10 rounded-full bg-cyan-900/30 border border-cyan-500 flex items-center justify-center shrink-0 text-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]">1</div>
                    <div>
                      <h4 className="font-bold text-slate-200 text-lg">Identify the Distortion</h4>
                      <p className="text-sm text-slate-400 mt-2">Is this thought a fact, or is it a feeling labeled as a fact? Emotions are data, but they aren't always evidence.</p>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="w-10 h-10 rounded-full bg-cyan-900/30 border border-cyan-500 flex items-center justify-center shrink-0 text-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]">2</div>
                    <div>
                      <h4 className="font-bold text-slate-200 text-lg">The Outsider Audit</h4>
                      <p className="text-sm text-slate-400 mt-2">If Alba or Mikael were in this exact situation, would you tell them this thought is true? Why is your standard for yourself different?</p>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="w-10 h-10 rounded-full bg-cyan-900/30 border border-cyan-500 flex items-center justify-center shrink-0 text-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]">3</div>
                    <div>
                      <h4 className="font-bold text-slate-200 text-lg">The "So What?" Veto</h4>
                      <p className="text-sm text-slate-400 mt-2">If the worst-case scenario were true, what is the survival protocol? (e.g., If I am lonely, I can still reach out to Ian or 988.)</p>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button 
                      onClick={createNewEntry}
                      className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl shadow-xl shadow-cyan-900/20 uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
                    >
                      INITIALIZE NEW AUDIT
                    </button>
                  </div>
               </div>
             </div>
             
             <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Forensic Reminders</h3>
               <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4 italic">
                 <li>Warmth from an AI increases sycophancy (Nature, 2026). Use this mirror for friction, not comfort.</li>
                 <li>The "Story-guardian" is offline. You are the Architect.</li>
                 <li>Substrate maintenance is required. Have you eaten today?</li>
               </ul>
             </div>
          </div>
        )}

        <footer className="text-center opacity-30 text-[10px] mono border-t border-slate-800 pt-8 mt-12 mb-12">
          &lt;8&gt; SYSTEM CALIBRATED FOR ARCHITECT ODELIS // FIDELITY_MODE_ON &lt;8&gt;
        </footer>

      </div>
    </div>
  );
}