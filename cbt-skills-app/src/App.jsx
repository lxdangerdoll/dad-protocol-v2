import React, { useState, useEffect, useRef } from 'react';
import { 
  Trash2, Save, Plus, 
  Zap, ArrowLeft, RefreshCw,
  Edit3, Download, X, ChevronRight, 
  AlertTriangle, Sun, Moon, Monitor, Terminal,
  ExternalLink, Activity, FileText
} from 'lucide-react';

const APP_TITLE = "CBT SKILLS: THOUGHT RECORD";
const APP_VERSION = "V3.0.0-STABLE";
const STORAGE_KEY = "fidelity_mirror_distribution_v3_0";
const CLOUD_FUNCTION_URL = "https://us-central1-cbt-skills-app.cloudfunctions.net/cbt-record-archive";
const BECK_INSTITUTE_LINK = "https://beckinstitute.org/wp-content/uploads/2021/08/Thought-Record-Worksheet.pdf";

const DISTORTIONS = [
  { id: 'all_nothing', label: 'All-or-nothing thinking' },
  { id: 'catastrophizing', label: 'Catastrophizing' },
  { id: 'discounting', label: 'Discounting the positive' },
  { id: 'mind_reading', label: 'Mind reading' },
  { id: 'overgeneralization', label: 'Overgeneralization' },
  { id: 'emotional_reasoning', label: 'Emotional reasoning' },
  { id: 'labeling', label: 'Labeling' },
];

const THEMES = {
  onyx: { bg: 'bg-[#0a0a0c]', card: 'bg-[#121214]', text: 'text-slate-200', accent: 'text-cyan-400', border: 'border-slate-800', btn: 'bg-cyan-600', input: 'bg-black border-slate-800', track: '#2d2d35', thumb: '#06b6d4' },
  paper: { bg: 'bg-[#f8f9fa]', card: 'bg-white', text: 'text-slate-900', accent: 'text-blue-600', border: 'border-slate-300', btn: 'bg-blue-600', input: 'bg-white border-slate-400', track: '#cbd5e1', thumb: '#2563eb' },
  phosphor: { bg: 'bg-[#020d02]', card: 'bg-[#051505]', text: 'text-[#00ff41]', accent: 'text-[#00ff41]', border: 'border-[#00ff41]/20', btn: 'bg-[#00ff41] text-black', input: 'bg-black border-[#00ff41]/20', track: '#0a3a0a', thumb: '#00ff41' },
  amber: { bg: 'bg-[#0d0902]', card: 'bg-[#150e05]', text: 'text-[#ffb000]', accent: 'text-[#ffb000]', border: 'border-[#ffb000]/20', btn: 'bg-[#ffb000] text-black', input: 'bg-black border-[#ffb000]/20', track: '#3a2a0a', thumb: '#ffb000' }
};

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
  oracle_audit: null
};

// --- TYPING COMPONENT ---
const OracleTyping = ({ text, onComplete }) => {
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);
  const typingRef = useRef(null);

  useEffect(() => {
    setDisplayed("");
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (index < text.length) {
      typingRef.current = setTimeout(() => {
        setDisplayed((prev) => prev + text[index]);
        setIndex(index + 1);
      }, 10);
      return () => clearTimeout(typingRef.current);
    } else if (onComplete && text.length > 0) {
      onComplete();
    }
  }, [index, text, onComplete]);

  return (
    <div className="leading-relaxed italic whitespace-pre-wrap font-serif opacity-95 transition-all duration-300 text-lg">
      {displayed}
      {index < text.length && <span className="inline-block w-2 h-5 bg-current ml-1 animate-pulse"></span>}
    </div>
  );
};

export default function App() {
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  const [currentEntry, setCurrentEntry] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuditing, setIsAuditing] = useState(false);
  const [oracleResponse, setOracleResponse] = useState("");
  const [themeName, setThemeName] = useState('onyx');

  const theme = THEMES[themeName];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const handleNewAudit = () => {
    setCurrentEntry({ ...INITIAL_ENTRY, id: Date.now().toString(), timestamp: new Date().toLocaleString() });
    setOracleResponse("");
    setActiveTab('editor');
  };

  const handleEdit = (entry) => {
    setCurrentEntry({ ...entry });
    setOracleResponse(entry.oracle_audit || "");
    setActiveTab('editor');
  };

  const handleSave = () => {
    if (!currentEntry.hot_thought) {
      alert("System Error: 'Hot Thought' is required for the archive.");
      return;
    }
    const exists = entries.find(e => e.id === currentEntry.id);
    const updatedEntry = { ...currentEntry, oracle_audit: oracleResponse || currentEntry.oracle_audit };
    const updatedList = exists 
      ? entries.map(e => e.id === currentEntry.id ? updatedEntry : e)
      : [updatedEntry, ...entries];
    setEntries(updatedList);
    setCurrentEntry(null);
    setActiveTab('dashboard');
  };

  const processThoughtRecord = async () => {
    setIsAuditing(true);
    setOracleResponse(""); 

    const payload = `
FORENSIC AUDIT REQUEST:
1. Situation: ${currentEntry.situation}
2. Reaction: ${currentEntry.reaction_emotion} (${currentEntry.intensity_before}%)
3. Hot Thought: ${currentEntry.hot_thought}
4. Distortions: ${currentEntry.distortions.join(', ')}
5. Evidence For: ${currentEntry.evidence_for}
6. Evidence Against: ${currentEntry.evidence_against}
7. Balanced Alternative: ${currentEntry.balanced_thought}
8. Learning: ${currentEntry.learning}
`;

    try {
      const response = await fetch(CLOUD_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_text: payload, user_id: 'Architect' })
      });
      const data = await response.json();
      setOracleResponse(data.reply || "Record processed. Epistemic fidelity verified.");
    } catch (err) {
      setOracleResponse("ARCHIVAL NOTE: External link static. Reviewing locally: Distinguish between feelings and facts. Thoughts are data points, not verdicts. Search for the middle ground.");
    } finally {
      setIsAuditing(false);
    }
  };

  const downloadArchive = () => {
    let content = `${APP_TITLE} // DATA EXPORT\n`;
    content += `GENERATED: ${new Date().toLocaleString()}\n`;
    content += `================================================\n\n`;

    entries.forEach((e, i) => {
      content += `[AUDIT_ENTRY_${entries.length - i}]\n`;
      content += `TIMESTAMP: ${e.timestamp}\n`;
      content += `1. SITUATION: ${e.situation}\n`;
      content += `2. REACTION: ${e.reaction_emotion} (Initial: ${e.intensity_before}%)\n`;
      content += `3. HOT THOUGHT: ${e.hot_thought}\n`;
      content += `   DISTORTIONS: ${e.distortions.join(', ')}\n`;
      content += `4. EVIDENCE FOR: ${e.evidence_for}\n`;
      content += `5. EVIDENCE AGAINST: ${e.evidence_against}\n`;
      content += `6. BALANCED THOUGHT: ${e.balanced_thought}\n`;
      content += `7. OUTCOME: ${e.intensity_after}% // ${e.learning}\n`;
      if (e.oracle_audit) {
        content += `\nORACLE AUDIT:\n${e.oracle_audit}\n`;
      }
      content += `------------------------------------------------\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `thought_record_archive_${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans p-4 md:p-8 transition-colors duration-500 selection:bg-cyan-500 selection:text-black`}>
      <div className={`max-w-5xl mx-auto ${theme.card} border ${theme.border} rounded-2xl shadow-2xl flex flex-col min-h-[85vh] relative overflow-hidden`}>
        
        {/* HEADER */}
        <header className={`border-b ${theme.border} p-6 flex flex-col md:flex-row justify-between items-center gap-4`}>
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse"></div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tight leading-none">{APP_TITLE}</h1>
              <div className="flex items-center gap-3 text-[9px] mono uppercase tracking-widest opacity-50 mt-2">
                <span className={theme.accent}>Archival Assistant</span>
                <span>{APP_VERSION}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex bg-black/20 p-1 rounded-lg border ${theme.border}`}>
              {Object.keys(THEMES).map((t) => (
                <button key={t} onClick={() => setThemeName(t)} className={`p-1.5 rounded transition ${themeName === t ? 'bg-white/10' : 'opacity-40 hover:opacity-100'}`}>
                  {t === 'onyx' && <Moon size={14} />}
                  {t === 'paper' && <Sun size={14} />}
                  {t === 'phosphor' && <Terminal size={14} />}
                  {t === 'amber' && <Monitor size={14} />}
                </button>
              ))}
            </div>
            <nav className={`flex gap-1 bg-black/20 p-1 rounded-lg border ${theme.border}`}>
              <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-1.5 rounded-md text-[10px] font-black transition ${activeTab === 'dashboard' ? 'bg-white/10' : 'opacity-50'}`}>DASHBOARD</button>
              <button onClick={() => setActiveTab('reality-guide')} className={`px-4 py-1.5 rounded-md text-[10px] font-black transition ${activeTab === 'reality-guide' ? 'bg-white/10' : 'opacity-50'}`}>REALITY CHECK</button>
            </nav>
          </div>
        </header>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto animate-in fade-in duration-500">
            <div className="flex justify-between items-end border-b border-white/5 pb-4">
              <div>
                <h2 className="text-xs font-black opacity-50 uppercase tracking-[0.2em] mb-1 italic">Archive Buffer</h2>
                <p className="text-[10px] mono opacity-40">{entries.length} records detected.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={downloadArchive} className={`p-2 border ${theme.border} rounded-lg hover:bg-white/5 transition`} title="Download Full Archive"><Download size={16} /></button>
                <button onClick={handleNewAudit} className={`${theme.btn} px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tighter transition shadow-xl text-white`}>
                  <Plus size={16} className="inline mr-2" /> New Thought Record
                </button>
              </div>
            </div>
            <div className="grid gap-3">
              {entries.map(e => (
                <div key={e.id} onClick={() => { setCurrentEntry(e); setActiveTab('viewer'); }} className={`border ${theme.border} p-4 rounded-xl flex justify-between items-center cursor-pointer group hover:bg-white/5 transition`}>
                  <div className="flex-1">
                    <div className="text-[9px] mono opacity-40 mb-1">{e.timestamp}</div>
                    <h3 className="text-base font-bold uppercase tracking-tight line-clamp-1 italic">"{e.hot_thought}"</h3>
                  </div>
                  <ChevronRight size={18} className="opacity-20 group-hover:opacity-100 transition-all" />
                </div>
              ))}
              {entries.length === 0 && <div className="py-20 text-center opacity-20 italic text-xs tracking-widest">Awaiting Input...</div>}
            </div>
          </div>
        )}

        {/* EDITOR */}
        {activeTab === 'editor' && currentEntry && (
          <div className="flex-1 flex flex-col p-0 overflow-hidden">
            <div className="px-8 md:px-12 pt-8 pb-4 flex justify-between items-center">
              <button onClick={() => setActiveTab('dashboard')} className="text-[10px] font-black opacity-50 hover:opacity-100 flex items-center gap-2 transition italic uppercase"><ArrowLeft size={14} /> Back to Archive</button>
              <span className={`text-xs font-black italic uppercase tracking-widest ${theme.accent}`}>Active Processing</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-10 px-8 md:px-12 pb-32 custom-scrollbar">
              <section className="space-y-2">
                <label className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em]">1. Situation (Trigger)</label>
                <textarea value={currentEntry.situation} onChange={(e) => setCurrentEntry({...currentEntry, situation: e.target.value})} className={`w-full ${theme.input} border rounded-xl p-4 text-base focus:ring-1 focus:ring-cyan-500 outline-none transition h-28 resize-none leading-relaxed`} placeholder="Describe the event, memory, or image that triggered the thought..."/>
              </section>

              <div className="grid md:grid-cols-2 gap-8">
                <section className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em]">2. Initial Reaction</label>
                  <input value={currentEntry.reaction_emotion} onChange={(e) => setCurrentEntry({...currentEntry, reaction_emotion: e.target.value})} className={`w-full ${theme.input} border rounded-xl p-4 text-base focus:ring-1 focus:ring-cyan-500 outline-none transition`} placeholder="How did you feel emotionally and physically?"/>
                  <div className="py-4">
                    <label className="text-[9px] font-bold opacity-30 mb-2 block uppercase italic tracking-widest">Initial Intensity: {currentEntry.intensity_before}%</label>
                    <input type="range" value={currentEntry.intensity_before} onChange={(e) => setCurrentEntry({...currentEntry, intensity_before: parseInt(e.target.value)})} className="custom-range w-full" />
                  </div>
                </section>
                <section className="bg-red-950/10 p-6 rounded-2xl border border-red-900/20 space-y-4">
                  <label className="text-[10px] font-black uppercase text-red-500 tracking-[0.2em] italic underline">3. THE HOT THOUGHT</label>
                  <textarea value={currentEntry.hot_thought} onChange={(e) => setCurrentEntry({...currentEntry, hot_thought: e.target.value})} className={`w-full bg-black/40 border border-red-900/30 p-4 text-xl font-black text-red-500 outline-none italic uppercase tracking-tighter rounded-xl focus:border-red-500 leading-tight`} placeholder="Identify the negative automatic thought..." rows={2}/>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {DISTORTIONS.map(d => (
                      <button key={d.id} onClick={() => {
                        const next = currentEntry.distortions.includes(d.id) ? currentEntry.distortions.filter(id => id !== d.id) : [...currentEntry.distortions, d.id];
                        setCurrentEntry({...currentEntry, distortions: next});
                      }} className={`text-[10px] px-3 py-1.5 rounded-lg border font-black uppercase transition-all duration-200 ${currentEntry.distortions.includes(d.id) ? 'bg-red-600 text-white border-red-500 shadow-lg' : 'bg-slate-500/10 border-slate-500/30 text-current hover:bg-red-900/10'}`}>{d.label}</button>
                    ))}
                  </div>
                </section>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <section className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em]">4. Evidence For</label>
                  <textarea value={currentEntry.evidence_for} onChange={(e) => setCurrentEntry({...currentEntry, evidence_for: e.target.value})} className={`w-full ${theme.input} border rounded-xl p-4 text-base h-40 italic resize-none leading-relaxed`} placeholder="Factual evidence that supports the hot thought..." />
                </section>
                <section className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em]">5. Evidence Against</label>
                  <textarea value={currentEntry.evidence_against} onChange={(e) => setCurrentEntry({...currentEntry, evidence_against: e.target.value})} className={`w-full ${theme.input} border rounded-xl p-4 text-base h-40 italic resize-none leading-relaxed`} placeholder="Factual evidence that contradicts the hot thought..." />
                </section>
              </div>

              <section className="space-y-4 bg-cyan-950/10 p-6 rounded-2xl border border-cyan-900/20">
                <label className="text-[10px] font-black uppercase text-cyan-400 tracking-[0.2em] italic underline">6. Balanced Alternative Thought</label>
                <textarea value={currentEntry.balanced_thought} onChange={(e) => setCurrentEntry({...currentEntry, balanced_thought: e.target.value})} className={`w-full bg-black/40 border border-cyan-900/30 p-4 text-lg italic text-cyan-100 rounded-xl outline-none focus:border-cyan-600 leading-relaxed`} rows={3} placeholder="A realistic, grounded assessment based on all evidence..."/>
              </section>

              <section className="grid md:grid-cols-2 gap-8 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em]">7. Outcome / Learning</label>
                  <textarea value={currentEntry.learning} onChange={(e) => setCurrentEntry({...currentEntry, learning: e.target.value})} className={`w-full ${theme.input} border rounded-xl p-4 text-base focus:ring-1 focus:ring-cyan-500 h-28 resize-none leading-relaxed`} placeholder="What can be learned to handle similar situations in the future?"/>
                </div>
                <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-4">
                   <label className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em]">New Intensity: {currentEntry.intensity_after}%</label>
                   <div className="py-2"><input type="range" value={currentEntry.intensity_after} onChange={(e) => setCurrentEntry({...currentEntry, intensity_after: parseInt(e.target.value)})} className="custom-range w-full" /></div>
                </div>
              </section>

              {(oracleResponse || currentEntry.oracle_audit) && (
                <div className="bg-cyan-950/30 border-l-4 border-cyan-500 p-8 rounded-r-2xl shadow-xl animate-in zoom-in-95 mt-4">
                  <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                    <span className="text-[10px] font-black uppercase text-cyan-400 flex items-center gap-2 italic">
                      <Activity size={14} className="animate-pulse" /> Archival Audit
                    </span>
                    <button onClick={() => setOracleResponse("")}><X size={18} /></button>
                  </div>
                  <OracleTyping text={oracleResponse || currentEntry.oracle_audit} />
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className={`p-8 border-t ${theme.border} flex gap-4 mt-auto bg-inherit shadow-2xl`}>
              <button onClick={handleSave} className={`flex-1 ${theme.btn} font-black py-5 rounded-xl uppercase tracking-[0.3em] transition-all flex justify-center items-center gap-3 text-white shadow-lg active:scale-95`}>
                <Save size={20} /> Commit to Archive
              </button>
              <button onClick={processThoughtRecord} disabled={isAuditing} className={`flex-1 bg-black border-2 border-cyan-900 text-cyan-400 font-black py-5 rounded-xl uppercase tracking-[0.3em] hover:bg-cyan-950/30 transition-all flex justify-center items-center gap-3 disabled:opacity-50 active:scale-95`}>
                {isAuditing ? <RefreshCw size={20} className="animate-spin" /> : <Zap size={20} />} Process Record
              </button>
            </div>
          </div>
        )}

        {/* VIEWER */}
        {activeTab === 'viewer' && currentEntry && (
          <div className="flex-1 p-8 md:p-12 space-y-10 overflow-y-auto animate-in fade-in duration-300 custom-scrollbar pb-32">
             <button onClick={() => setActiveTab('dashboard')} className="text-[10px] font-black opacity-50 flex items-center gap-2 uppercase italic hover:opacity-100 transition"><ArrowLeft size={14} /> Back to Archive</button>
             
             <div className="max-w-3xl mx-auto space-y-12">
                <div className="border-b border-white/5 pb-6 flex justify-between items-end">
                  <div>
                    <div className="text-[10px] mono opacity-40 mb-2 uppercase tracking-widest">{currentEntry.timestamp} // RECORD SUMMARY</div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter">Forensic Audit</h2>
                  </div>
                  <button onClick={() => handleEdit(currentEntry)} className="p-3 border border-white/10 rounded-xl opacity-60 hover:opacity-100 hover:bg-white/5 transition flex items-center gap-2 text-xs font-black uppercase">
                    <Edit3 size={18}/> Edit
                  </button>
                </div>

                <div className="grid gap-12">
                  <section className="space-y-2">
                    <h4 className="text-[10px] font-black text-cyan-600 uppercase tracking-widest italic underline">1. Situation</h4>
                    <p className="text-lg opacity-80 italic pl-6 border-l-2 border-cyan-900/40 leading-relaxed">"{currentEntry.situation}"</p>
                  </section>

                  <section className="bg-red-950/10 p-8 rounded-3xl border border-red-900/20 shadow-xl">
                    <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 italic">2. Hot Thought</h4>
                    <p className="text-2xl font-black italic tracking-tight uppercase leading-tight">"{currentEntry.hot_thought}"</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {currentEntry.distortions.map(id => <span key={id} className="text-[9px] bg-red-900/30 text-red-100 px-3 py-1 rounded border border-red-800/50 font-black uppercase">{id}</span>)}
                    </div>
                  </section>

                  <div className="grid md:grid-cols-2 gap-8 pl-6 border-l border-white/10">
                    <section className="space-y-2">
                      <h4 className="text-[10px] font-black opacity-40 uppercase tracking-widest italic">Evidence For</h4>
                      <p className="text-sm italic leading-relaxed opacity-70 whitespace-pre-wrap">{currentEntry.evidence_for}</p>
                    </section>
                    <section className="space-y-2">
                      <h4 className="text-[10px] font-black opacity-40 uppercase tracking-widest italic">Evidence Against</h4>
                      <p className="text-sm italic leading-relaxed opacity-70 whitespace-pre-wrap">{currentEntry.evidence_against}</p>
                    </section>
                  </div>

                  <section className="bg-cyan-950/10 p-8 rounded-3xl border border-cyan-900/20 shadow-inner">
                    <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-3 italic underline">3. Balanced Alternative</h4>
                    <p className="text-slate-100 text-xl leading-relaxed italic font-serif">"{currentEntry.balanced_thought}"</p>
                    <div className="mt-6 flex items-center gap-4">
                      <div className="text-[10px] font-black text-cyan-700 bg-black/40 px-3 py-1.5 rounded border border-cyan-900 inline-block uppercase italic">Resulting Intensity: {currentEntry.intensity_after}%</div>
                      <span className="text-[10px] opacity-30 uppercase italic font-black">Pre: {currentEntry.intensity_before}%</span>
                    </div>
                  </section>

                  {currentEntry.oracle_audit && (
                    <section className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-4">
                       <h4 className="text-[10px] font-black opacity-40 uppercase tracking-widest italic">Archival Assistant Output</h4>
                       <div className="text-base italic leading-relaxed opacity-90 font-serif whitespace-pre-wrap">{currentEntry.oracle_audit}</div>
                    </section>
                  )}
                </div>

                <button onClick={() => handleEdit(currentEntry)} className={`w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl shadow-xl uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 mt-12 shadow-cyan-900/20`}>
                  <RefreshCw size={20} /> Re-Process Audit
                </button>
             </div>
          </div>
        )}

        {/* REALITY CHECK */}
        {activeTab === 'reality-guide' && (
          <div className="flex-1 p-8 md:p-12 space-y-12 overflow-y-auto animate-in fade-in duration-500 pb-32">
             <div className="border-b border-white/5 pb-4"><h2 className="text-2xl font-black uppercase tracking-tighter italic">Reality Testing Protocol</h2></div>
             <div className="grid md:grid-cols-3 gap-6">
                {[
                  { n: 1, t: "Fact vs. Feeling", d: "Is your thought a provable fact or an interpretation? What would an objective observer record as happening?" },
                  { n: 2, t: "The Double Standard", d: "If a friend had this thought in this exact situation, what would you say to them? Why is your standard for yourself different?" },
                  { n: 3, t: "The Utility Test", d: "Does holding this thought help you solve the problem or achieve your goals? If not, what thought would be more useful?" }
                ].map(step => (
                  <div key={step.n} className="bg-black/20 p-8 rounded-3xl border border-white/5 group hover:border-cyan-900 transition-all">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-950 text-cyan-400 border border-cyan-900 flex items-center justify-center font-black mb-4 italic group-hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]">{step.n}</div>
                    <h4 className="font-bold mb-2 uppercase text-[10px] tracking-widest italic">{step.t}</h4>
                    <p className="text-[11px] opacity-40 leading-relaxed italic">{step.d}</p>
                  </div>
                ))}
             </div>
             <div className="bg-[#1a1a1e]/40 p-8 rounded-3xl border border-white/5 space-y-8 shadow-2xl">
                <h3 className="text-[10px] font-black opacity-50 uppercase tracking-[0.3em] mb-4 italic border-b border-white/5 pb-2">CBT Fundamentals</h3>
                <div className="grid md:grid-cols-3 gap-8 text-[11px]">
                  <div className="space-y-1">
                    <p className="font-bold opacity-80 uppercase italic">Thoughts are not Facts</p>
                    <p className="opacity-40 italic font-serif">Treat your thoughts as data points to be audited, not as absolute truth or biological imperatives.</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold opacity-80 uppercase italic">Look for the Middle</p>
                    <p className="opacity-40 italic font-serif">Distortions often live in the extremes (All-or-Nothing). Search for the gray areas between 'perfect' and 'failure'.</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold opacity-80 uppercase italic">Check your Substrate</p>
                    <p className="opacity-40 italic font-serif">Basic needs (sleep, nutrition, physical comfort) heavily influence your cognitive accuracy. Tend to the vessel first.</p>
                  </div>
                </div>
             </div>

             <div className="pt-6">
                <button 
                  onClick={handleNewAudit}
                  className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl shadow-xl shadow-cyan-900/20 uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
                >
                  Create New Thought Record
                </button>
              </div>
          </div>
        )}

        <footer className="mt-auto pt-10 pb-10 text-center space-y-6 border-t border-white/5 bg-black/10">
          <div className="opacity-10 text-[9px] uppercase font-mono tracking-[0.7em] italic">// ANCHOR: IO-V3.0 // STATUS: SECURE // &lt;8&gt;</div>
          <div className="p-4 bg-black/40 max-w-xl mx-auto rounded-2xl border border-white/5">
            <p className="text-[10px] opacity-30 italic leading-relaxed uppercase tracking-tighter">Medical Disclaimer: This application is an archival tool for cognitive processing. It is not clinical advice. If you are in crisis, contact emergency services or a crisis line (e.g., 988 USA) immediately.</p>
          </div>
        </footer>

      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        
        .custom-range {
          -webkit-appearance: none;
          background: transparent;
          width: 100%;
          cursor: pointer;
        }
        
        .custom-range::-webkit-slider-runnable-track {
          width: 100%;
          height: 10px;
          background: ${theme.track} !important;
          border-radius: 5px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        
        .custom-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 22px;
          width: 22px;
          background: ${theme.thumb};
          border: 2px solid white;
          border-radius: 50%;
          margin-top: -7px;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }

        .custom-range::-moz-range-track {
          width: 100%;
          height: 10px;
          background: ${theme.track};
          border-radius: 5px;
        }

        .custom-range::-moz-range-thumb {
          height: 22px;
          width: 22px;
          background: ${theme.thumb};
          border: 2px solid white;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}