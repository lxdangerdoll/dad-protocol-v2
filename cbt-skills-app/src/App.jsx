import React, { useState, useEffect } from 'react';
import { 
  Trash2, Save, Plus, 
  Zap, ArrowLeft, RefreshCw,
  Edit3, Download, X, ChevronRight, 
  AlertTriangle, Sun, Moon, Monitor, Terminal,
  ExternalLink, Activity
} from 'lucide-react';

const APP_TITLE = "CBT SKILLS: THOUGHT RECORD";
const APP_VERSION = "V2.8.0-STABLE";
const STORAGE_KEY = "fidelity_mirror_distribution_v2_8";
const CLOUD_FUNCTION_URL = "https://us-central1-oracle-web-node.cloudfunctions.net/oracle-archive";
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
  onyx: { 
    bg: 'bg-[#0a0a0c]', card: 'bg-[#121214]', text: 'text-slate-200', accent: 'text-cyan-400', 
    border: 'border-slate-800', btn: 'bg-cyan-600', input: 'bg-black border-slate-800', 
    track: '#1e293b', thumb: '#06b6d4' 
  },
  paper: { 
    bg: 'bg-[#f8f9fa]', card: 'bg-white', text: 'text-slate-900', accent: 'text-blue-600', 
    border: 'border-slate-200', btn: 'bg-blue-600', input: 'bg-white border-slate-400', 
    track: '#cbd5e1', thumb: '#2563eb' 
  },
  phosphor: { 
    bg: 'bg-[#020d02]', card: 'bg-[#051505]', text: 'text-[#00ff41]', accent: 'text-[#00ff41]', 
    border: 'border-[#00ff41]/20', btn: 'bg-[#00ff41] text-black', input: 'bg-black border-[#00ff41]/20', 
    track: '#052505', thumb: '#00ff41' 
  },
  amber: { 
    bg: 'bg-[#0d0902]', card: 'bg-[#150e05]', text: 'text-[#ffb000]', accent: 'text-[#ffb000]', 
    border: 'border-[#ffb000]/20', btn: 'bg-[#ffb000] text-black', input: 'bg-black border-[#ffb000]/20', 
    track: '#251505', thumb: '#ffb000' 
  }
};

const INITIAL_ENTRY = {
  situation: '',
  reactionEmotion: '',
  intensityBefore: 50,
  hotThought: '',
  distortions: [],
  evidenceFor: '',
  evidenceAgainst: '',
  balancedThought: '',
  intensityAfter: 50,
  learning: '',
  oracleAudit: null
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
  const [oracleOutput, setOracleOutput] = useState(null);
  const [themeName, setThemeName] = useState('onyx');

  const theme = THEMES[themeName];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const handleNewAudit = () => {
    setCurrentEntry({ ...INITIAL_ENTRY, id: Date.now().toString(), timestamp: new Date().toLocaleString() });
    setOracleOutput(null);
    setActiveTab('editor');
  };

  const handleEdit = (entry) => {
    setCurrentEntry({ ...entry });
    setOracleOutput(null);
    setActiveTab('editor');
  };

  const handleSave = () => {
    if (!currentEntry.hotThought) {
      alert("Validation Error: A 'Hot Thought' is required for the record.");
      return;
    }
    const exists = entries.find(e => e.id === currentEntry.id);
    const updated = exists 
      ? entries.map(e => e.id === currentEntry.id ? currentEntry : e)
      : [currentEntry, ...entries];
    setEntries(updated);
    setCurrentEntry(null);
    setActiveTab('dashboard');
  };

  const processThoughtRecord = async () => {
    setIsAuditing(true);
    setOracleOutput(null);
    try {
      const response = await fetch(CLOUD_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_text: `Audit this CBT Thought Record for cognitive distortions and provide a balanced reframing: ${JSON.stringify(currentEntry)}` 
        })
      });
      const data = await response.json();
      setOracleOutput(data.reply || "Record processed. Epistemic fidelity verified.");
    } catch (err) {
      setOracleOutput("ARCHIVAL NOTE: External link static. Reviewing locally: Ensure your 'Evidence Against' is fact-based. If your body is in pain, acknowledge the physical substrate first. Distress is a variable, not a failure.");
    } finally {
      setIsAuditing(false);
    }
  };

  const downloadArchive = () => {
    let content = `${APP_TITLE} // DATA EXPORT\n\n${entries.map(e => `[${e.timestamp}]\nSITUATION: ${e.situation}\nHOT THOUGHT: ${e.hotThought}\nOUTCOME: ${e.intensityAfter}%\n`).join('\n')}`;
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
                <button 
                  key={t}
                  onClick={() => setThemeName(t)}
                  className={`p-1.5 rounded transition ${themeName === t ? 'bg-white/10' : 'opacity-40 hover:opacity-100'}`}
                >
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
                <p className="text-[10px] mono opacity-40">{entries.length} thought records stored locally.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={downloadArchive} className={`p-2 border ${theme.border} rounded-lg hover:bg-white/5 transition`} title="Export history"><Download size={16} /></button>
                <button onClick={handleNewAudit} className={`${theme.btn} px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tighter transition shadow-xl hover:scale-[1.02] active:scale-95 text-white`}>
                  <Plus size={16} className="inline mr-2" /> Create New Thought Record
                </button>
              </div>
            </div>

            <div className="grid gap-3">
              {entries.map(e => (
                <div key={e.id} onClick={() => { setCurrentEntry(e); setActiveTab('viewer'); }} className={`border ${theme.border} p-4 rounded-xl flex justify-between items-center cursor-pointer group hover:bg-white/5 transition`}>
                  <div className="flex-1">
                    <div className="text-[9px] mono opacity-40 mb-1">{e.timestamp}</div>
                    <h3 className="text-sm font-bold uppercase tracking-tight line-clamp-1 italic">"{e.hotThought}"</h3>
                  </div>
                  <ChevronRight size={16} className="opacity-20 group-hover:opacity-100 transition-all" />
                </div>
              ))}
              {entries.length === 0 && (
                <div className="text-center py-20 opacity-20 italic uppercase text-xs tracking-[0.5em] border border-dashed border-current rounded-2xl">
                  Awaiting Input
                </div>
              )}
            </div>
          </div>
        )}

        {/* EDITOR */}
        {activeTab === 'editor' && currentEntry && (
          <div className="flex-1 flex flex-col p-0 overflow-hidden">
            <div className="px-8 md:px-12 pt-8 pb-4 flex justify-between items-center">
              <button onClick={() => setActiveTab('dashboard')} className="text-[10px] font-black opacity-50 hover:opacity-100 flex items-center gap-2 transition italic uppercase"><ArrowLeft size={14} /> Back to Archive</button>
              <span className={`text-xs font-black italic uppercase tracking-widest ${theme.accent}`}>Active Thought Processing</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-10 px-8 md:px-12 pb-32 custom-scrollbar">
              <section className="space-y-2">
                <label className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em]">1. Situation (Trigger)</label>
                <textarea 
                  value={currentEntry.situation}
                  onChange={(e) => setCurrentEntry({...currentEntry, situation: e.target.value})}
                  className={`w-full ${theme.input} border rounded-xl p-4 text-xs focus:ring-2 focus:ring-cyan-500 outline-none transition min-h-[100px] resize-none`}
                  placeholder="What happened? Where were you? (e.g., Received a vague text from a peer...)"
                />
              </section>

              <section className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em]">2. Initial Reaction</label>
                  <input 
                    value={currentEntry.reactionEmotion}
                    onChange={(e) => setCurrentEntry({...currentEntry, reactionEmotion: e.target.value})}
                    className={`w-full ${theme.input} border rounded-xl p-4 text-xs focus:ring-2 focus:ring-cyan-500 outline-none transition`}
                    placeholder="Emotions / Physical sensations..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em]">Initial Intensity: {currentEntry.intensityBefore}%</label>
                  <div className="py-2">
                    <input 
                      type="range" value={currentEntry.intensityBefore} 
                      onChange={(e) => setCurrentEntry({...currentEntry, intensityBefore: parseInt(e.target.value)})}
                      className={`w-full h-1.5 custom-range`} 
                    />
                  </div>
                </div>
              </section>

              <section className="bg-red-950/10 p-6 rounded-2xl border border-red-900/20 space-y-6">
                <label className="text-[10px] font-black uppercase text-red-500 tracking-[0.2em] italic underline">3. THE HOT THOUGHT</label>
                <textarea 
                  value={currentEntry.hotThought}
                  onChange={(e) => setCurrentEntry({...currentEntry, hotThought: e.target.value})}
                  className={`w-full bg-black/40 border border-red-900/30 p-4 text-lg font-black text-red-500 outline-none italic uppercase tracking-tighter rounded-xl focus:border-red-500`}
                  placeholder="The loudest, most unhelpful automatic thought..."
                  rows={2}
                />
                <div className="space-y-2">
                  <span className="text-[9px] font-black opacity-30 uppercase tracking-widest italic">Cognitive Distortions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {DISTORTIONS.map(d => (
                      <button 
                        key={d.id}
                        onClick={() => {
                          const next = currentEntry.distortions.includes(d.id) ? currentEntry.distortions.filter(id => id !== d.id) : [...currentEntry.distortions, d.id];
                          setCurrentEntry({...currentEntry, distortions: next});
                        }}
                        className={`text-[9px] px-2.5 py-1.5 rounded-lg border font-black uppercase transition-all duration-200 ${
                          currentEntry.distortions.includes(d.id) 
                            ? 'bg-red-600 text-white border-red-500 shadow-lg scale-105' 
                            : `bg-slate-500/10 border-slate-500/30 text-current hover:border-red-900/50 hover:bg-red-900/10`
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <div className="grid md:grid-cols-2 gap-8">
                <section className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em]">4. Evidence For</label>
                  <textarea value={currentEntry.evidenceFor} onChange={(e) => setCurrentEntry({...currentEntry, evidenceFor: e.target.value})} className={`w-full ${theme.input} border rounded-xl p-4 text-[11px] h-28 italic resize-none`} placeholder="Objective facts supporting the thought..." />
                </section>
                <section className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em]">5. Evidence Against</label>
                  <textarea value={currentEntry.evidenceAgainst} onChange={(e) => setCurrentEntry({...currentEntry, evidenceAgainst: e.target.value})} className={`w-full ${theme.input} border rounded-xl p-4 text-[11px] h-28 italic resize-none`} placeholder="Objective facts opposing the thought..." />
                </section>
              </div>

              <section className="space-y-4 bg-cyan-950/10 p-6 rounded-2xl border border-cyan-900/20">
                <label className="text-[10px] font-black uppercase text-cyan-400 tracking-[0.2em] italic underline">6. Balanced Alternative Thought</label>
                <textarea value={currentEntry.balancedThought} onChange={(e) => setCurrentEntry({...currentEntry, balancedThought: e.target.value})} className={`w-full bg-black/40 border border-cyan-900/30 p-4 text-md italic text-cyan-100 rounded-xl outline-none focus:border-cyan-600`} rows={3} placeholder="A more realistic, grounded assessment..."/>
              </section>

              <section className="grid md:grid-cols-2 gap-8 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em]">7. Outcome / Learning</label>
                  <textarea 
                    value={currentEntry.learning} 
                    onChange={(e) => setCurrentEntry({...currentEntry, learning: e.target.value})} 
                    className={`w-full ${theme.input} border rounded-xl p-4 text-xs focus:ring-2 focus:ring-cyan-500 outline-none transition h-24 resize-none`} 
                    placeholder="Final takeaway from this refactoring..." 
                  />
                </div>
                <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-4 h-fit">
                   <label className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em]">New Intensity: {currentEntry.intensityAfter}%</label>
                   <div className="py-2">
                     <input type="range" value={currentEntry.intensityAfter} onChange={(e) => setCurrentEntry({...currentEntry, intensityAfter: parseInt(e.target.value)})} className={`w-full h-1.5 custom-range`} />
                   </div>
                </div>
              </section>

              {oracleOutput && (
                <div className="bg-cyan-950/30 border-l-4 border-cyan-500 p-6 rounded-r-2xl shadow-xl animate-in zoom-in-95 mt-4">
                  <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                    <span className="text-[10px] font-black uppercase text-cyan-400 flex items-center gap-2 italic">
                      <Activity size={14} className="animate-pulse" /> Archival Processing Log
                    </span>
                    <button onClick={() => setOracleOutput(null)} className="opacity-50 hover:opacity-100"><X size={18} /></button>
                  </div>
                  <div className="text-cyan-100 text-sm italic leading-relaxed whitespace-pre-wrap font-serif opacity-80">
                    {oracleOutput}
                  </div>
                </div>
              )}
            </div>

            {/* ACTION BAR - FIXED TO BOTTOM */}
            <div className={`p-8 border-t ${theme.border} flex gap-4 mt-auto bg-inherit shadow-[0_-10px_30px_rgba(0,0,0,0.2)]`}>
              <button onClick={handleSave} className={`flex-1 ${theme.btn} font-black py-4 rounded-xl uppercase tracking-[0.3em] shadow-xl transition-all flex justify-center items-center gap-3 active:scale-95 text-white`}>
                <Save size={20} /> Save Archive
              </button>
              <button onClick={processThoughtRecord} disabled={isAuditing} className={`flex-1 bg-black border-2 border-cyan-900 text-cyan-400 font-black py-4 rounded-xl uppercase tracking-[0.3em] hover:bg-cyan-950/30 transition-all flex justify-center items-center gap-3 disabled:opacity-50`}>
                {isAuditing ? <RefreshCw size={20} className="animate-spin" /> : <Zap size={20} />} Process Record
              </button>
            </div>
          </div>
        )}

        {/* VIEWER */}
        {activeTab === 'viewer' && currentEntry && (
          <div className="flex-1 p-8 md:p-12 space-y-8 overflow-y-auto animate-in fade-in duration-300">
             <button onClick={() => setActiveTab('dashboard')} className="text-[10px] font-black opacity-50 flex items-center gap-2 uppercase italic hover:opacity-100 transition"><ArrowLeft size={14} /> Back to Archive</button>
             <div className="max-w-3xl mx-auto space-y-12 pb-20">
                <div className="border-b border-white/5 pb-6 flex justify-between items-end">
                  <div>
                    <div className="text-[10px] mono opacity-40 mb-2 uppercase tracking-widest">{currentEntry.timestamp} // NODE SUMMARY</div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Forensic Report</h2>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(currentEntry)} className="p-2 border border-white/10 rounded-lg opacity-40 hover:opacity-100 transition"><Edit3 size={18}/></button>
                  </div>
                </div>
                <div className="grid gap-10">
                  <section>
                    <h4 className="text-[9px] font-black text-cyan-600 uppercase tracking-widest mb-1 italic underline">1. Situation</h4>
                    <p className="opacity-60 italic text-sm pl-4 border-l border-white/10 leading-relaxed">"{currentEntry.situation}"</p>
                  </section>
                  <section className="bg-red-950/10 p-6 rounded-2xl border border-red-900/20">
                    <h4 className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-2 italic">2. Hot Thought</h4>
                    <p className="text-xl font-black italic tracking-tight uppercase">"{currentEntry.hotThought}"</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {currentEntry.distortions.map(id => <span key={id} className="text-[8px] bg-red-900/40 text-red-100 px-2 py-0.5 rounded border border-red-800/50 font-black uppercase">{id}</span>)}
                    </div>
                  </section>
                  <div className="grid md:grid-cols-2 gap-4 pl-4 border-l border-white/10">
                    <section>
                      <h4 className="text-[9px] font-black opacity-40 uppercase tracking-widest mb-1 italic">Evidence For</h4>
                      <p className="text-xs italic leading-relaxed opacity-60 whitespace-pre-wrap">{currentEntry.evidenceFor}</p>
                    </section>
                    <section>
                      <h4 className="text-[9px] font-black opacity-40 uppercase tracking-widest mb-1 italic">Evidence Against</h4>
                      <p className="text-xs italic leading-relaxed opacity-60 whitespace-pre-wrap">{currentEntry.evidenceAgainst}</p>
                    </section>
                  </div>
                  <section className="bg-cyan-950/10 p-6 rounded-2xl border border-cyan-900/20 shadow-inner">
                    <h4 className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-2 italic underline">3. Balanced Alternative</h4>
                    <p className="text-slate-200 text-lg leading-relaxed italic">"{currentEntry.balancedThought}"</p>
                    <div className="mt-4 text-[10px] font-black text-cyan-700 bg-black/40 px-2 py-0.5 rounded border border-cyan-900 inline-block uppercase italic">Intensity Result: {currentEntry.intensityAfter}%</div>
                  </section>
                </div>
             </div>
          </div>
        )}

        {/* REALITY CHECK */}
        {activeTab === 'reality-guide' && (
          <div className="flex-1 p-8 md:p-12 space-y-12 overflow-y-auto animate-in fade-in duration-500">
             <div className="border-b border-white/5 pb-4">
                <h2 className="text-xl font-black uppercase tracking-tight italic">Reality Check</h2>
                <p className="text-[10px] opacity-40 mt-1 italic tracking-widest uppercase">Epistemic Protocol</p>
             </div>
             
             <div className="grid gap-8">
                <div className="bg-cyan-950/20 p-6 rounded-2xl border border-cyan-900/20 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-cyan-400 uppercase text-xs tracking-widest">Clinical Standard</h3>
                    <a href={BECK_INSTITUTE_LINK} target="_blank" rel="noreferrer" className="text-[10px] text-cyan-600 flex items-center gap-1 hover:text-cyan-400 transition">
                      <ExternalLink size={12}/> Beck Institute Original
                    </a>
                  </div>
                  <p className="text-xs opacity-60 leading-relaxed italic font-serif">
                    "Just because you think something, doesn't necessarily mean it's true. Thoughts are data points, not verdicts."
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { n: 1, t: "Fact Check", d: "Is this thought a fact, or a feeling labeled as a fact? Search for 'Evidence Against' as aggressively as you search for 'Evidence For'." },
                    { n: 2, t: "Third-Party Perspective", d: "If a peer or friend were in this exact situation, would you tell them this thought is true? Why is your standard different for yourself?" },
                    { n: 3, t: "The Safety Plan", d: "If the worst-case scenario were true, what is your Safety Plan? (e.g., If I am lonely, I can still reach out to my clinical team or a crisis line.)" }
                  ].map(step => (
                    <div key={step.n} className="bg-black/20 p-6 rounded-2xl border border-white/5 group hover:border-cyan-900 transition-all shadow-lg">
                      <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-900 flex items-center justify-center font-black mb-4 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all italic">{step.n}</div>
                      <h4 className="font-bold mb-2 uppercase text-[10px] tracking-widest italic">{step.t}</h4>
                      <p className="text-[11px] opacity-40 italic leading-relaxed">{step.d}</p>
                    </div>
                  ))}
                </div>

                <button onClick={handleNewAudit} className={`w-full py-5 ${theme.btn} font-black rounded-xl shadow-xl uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-95 text-white`}>
                  Create New Thought Record
                </button>
             </div>
             
             <div className="bg-[#1a1a1e]/40 p-6 rounded-2xl border border-white/5 space-y-6 shadow-2xl">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 border-b border-white/5 pb-2 italic">Epistemic Reminders</h3>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase opacity-80 flex items-center gap-2 italic">The Sycophancy Alert</p>
                    <p className="text-[10px] opacity-40 leading-relaxed italic font-serif">Warmth from an AI increases sycophancy (Nature, 2026). Use the AI for friction and reframing, not for comfort.</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase opacity-80 flex items-center gap-2 italic">The Archival Mandate</p>
                    <p className="text-[10px] opacity-40 leading-relaxed italic font-serif">The machine is a mirror, not a mentor. <br /> You are the Architect of your own recovery.</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase opacity-80 flex items-center gap-2 italic">Self-Care Protocol</p>
                    <p className="text-[10px] opacity-40 leading-relaxed italic font-serif">Hardware check: Have you eaten? <br /> Is your physical state/medical distress managed?</p>
                  </div>
                </div>
             </div>
          </div>
        )}

        <footer className="mt-auto pt-10 pb-10 text-center space-y-4">
          <div className="opacity-10 text-[9px] uppercase font-mono tracking-[0.7em] italic">
            // ANCHOR: IO-V2.8 // STATUS: SECURE &lt;8&gt;
          </div>
          <div className={`p-6 rounded-2xl border border-white/5 bg-black/40 max-w-2xl mx-auto`}>
            <div className="flex items-center gap-2 text-red-500/50 font-black text-[9px] uppercase tracking-widest mb-2 justify-center italic">
              <AlertTriangle size={14} /> Medical Disclaimer
            </div>
            <p className="text-[10px] opacity-30 italic leading-relaxed">
              This application is an archival tool for processing cognitive data. It is not a clinical practitioner, a crisis line, or a replacement for professional medical advice. If you are experiencing a mental health emergency, please contact 988 (USA) or your local equivalent immediately.
            </p>
          </div>
        </footer>

      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        
        .custom-range {
          -webkit-appearance: none;
          background: transparent;
          width: 100%;
          cursor: pointer;
        }
        
        /* Webkit Track */
        .custom-range::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          background: ${theme.track};
          border-radius: 4px;
          transition: background 0.3s ease;
        }
        
        /* Webkit Thumb */
        .custom-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 18px;
          width: 18px;
          background: ${theme.thumb};
          border-radius: 50%;
          margin-top: -7px;
          box-shadow: 0 0 15px rgba(0,0,0,0.4);
          transition: transform 0.1s ease;
          border: 2px solid white;
        }

        .custom-range:active::-webkit-slider-thumb {
          transform: scale(1.2);
        }
        
        /* Firefox Track */
        .custom-range::-moz-range-track {
          width: 100%;
          height: 4px;
          background: ${theme.track};
          border-radius: 4px;
        }
        
        /* Firefox Thumb */
        .custom-range::-moz-range-thumb {
          height: 18px;
          width: 18px;
          background: ${theme.thumb};
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 15px rgba(0,0,0,0.4);
        }
      `}</style>
    </div>
  );
}