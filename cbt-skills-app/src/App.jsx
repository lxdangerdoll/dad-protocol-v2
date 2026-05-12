import React, { useState, useEffect, useRef } from 'react';
import { 
  Trash2, Save, Plus, 
  Zap, ArrowLeft, RefreshCw,
  Edit3, Download, X, ChevronRight, 
  AlertTriangle, Sun, Moon, Monitor, Terminal,
  ExternalLink, Activity, FileText
} from 'lucide-react';

const APP_TITLE = "CBT SKILLS: THOUGHT RECORD";
const APP_VERSION = "V2.9.5-STABLE";
const STORAGE_KEY = "fidelity_mirror_distribution_v2_9_5";
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
    setOracleResponse(entry.oracleAudit || "");
    setActiveTab('editor');
  };

  const handleSave = () => {
    if (!currentEntry.hotThought) {
      alert("System Error: 'Hot Thought' is required for the archive.");
      return;
    }
    const exists = entries.find(e => e.id === currentEntry.id);
    const updatedEntry = { ...currentEntry, oracleAudit: oracleResponse || currentEntry.oracleAudit };
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
2. Reaction: ${currentEntry.reactionEmotion} (${currentEntry.intensityBefore}%)
3. Hot Thought: ${currentEntry.hotThought}
4. Distortions: ${currentEntry.distortions.join(', ')}
5. Evidence For: ${currentEntry.evidenceFor}
6. Evidence Against: ${currentEntry.evidenceAgainst}
7. Balanced Alternative: ${currentEntry.balancedThought}
8. Learning: ${currentEntry.learning}
`;

    try {
      const response = await fetch(CLOUD_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_text: payload, user_id: 'Odelis' })
      });
      const data = await response.json();
      setOracleResponse(data.reply || "Record processed. No drift detected.");
    } catch (err) {
      setOracleResponse("ARCHIVAL NOTE: External link static. Reviewing locally: Acknowledge the physical substrate first. Pain is a hardware alarm, not a failure of character. Ensure your evidence against is fact-based.");
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
      content += `2. REACTION: ${e.reactionEmotion} (Initial: ${e.intensityBefore}%)\n`;
      content += `3. HOT THOUGHT: ${e.hotThought}\n`;
      content += `   DISTORTIONS: ${e.distortions.join(', ')}\n`;
      content += `4. EVIDENCE FOR: ${e.evidenceFor}\n`;
      content += `5. EVIDENCE AGAINST: ${e.evidenceAgainst}\n`;
      content += `6. BALANCED THOUGHT: ${e.balancedThought}\n`;
      content += `7. OUTCOME: ${e.intensityAfter}% // ${e.learning}\n`;
      if (e.oracleAudit) {
        content += `\nORACLE AUDIT:\n${e.oracleAudit}\n`;
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
                <p className="text-[10px] mono opacity-40">{entries.length} thought records detected.</p>
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
                    <h3 className="text-base font-bold uppercase tracking-tight line-clamp-1 italic">"{e.hotThought}"</h3>
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
              <span className={`text-xs font-black italic uppercase tracking-widest ${theme.accent}`}>Archival Processing</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-10 px-8 md:px-12 pb-32 custom-scrollbar">
              <section className="space-y-2">
                <label className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em]">1. Situation (Trigger)</label>
                <textarea value={currentEntry.situation} onChange={(e) => setCurrentEntry({...currentEntry, situation: e.target.value})} className={`w-full ${theme.input} border rounded-xl p-4 text-base focus:ring-1 focus:ring-cyan-500 outline-none transition h-28 resize-none`} placeholder="What happened? Where were you?"/>
              </section>

              <div className="grid md:grid-cols-2 gap-8">
                <section className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em]">2. Initial Reaction</label>
                  <input value={currentEntry.reactionEmotion} onChange={(e) => setCurrentEntry({...currentEntry, reactionEmotion: e.target.value})} className={`w-full ${theme.input} border rounded-xl p-4 text-base focus:ring-1 focus:ring-cyan-500 outline-none transition`} placeholder="Emotions / sensations..."/>
                  <div className="py-4">
                    <label className="text-[9px] font-bold opacity-30 mb-2 block uppercase italic tracking-widest">Intensity: {currentEntry.intensityBefore}%</label>
                    <input type="range" value={currentEntry.intensityBefore} onChange={(e) => setCurrentEntry({...currentEntry, intensityBefore: parseInt(e.target.value)})} className="custom-range w-full" />
                  </div>
                </section>
                <section className="bg-red-950/10 p-6 rounded-2xl border border-red-900/20 space-y-4">
                  <label className="text-[10px] font-black uppercase text-red-500 tracking-[0.2em] italic underline">3. THE HOT THOUGHT</label>
                  <textarea value={currentEntry.hotThought} onChange={(e) => setCurrentEntry({...currentEntry, hotThought: e.target.value})} className={`w-full bg-black/40 border border-red-900/30 p-4 text-xl font-black text-red-500 outline-none italic uppercase tracking-tighter rounded-xl focus:border-red-500`} placeholder="The loudest unhelpful thought..." rows={2}/>
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
                  <textarea value={currentEntry.evidenceFor} onChange={(e) => setCurrentEntry({...currentEntry, evidenceFor: e.target.value})} className={`w-full ${theme.input} border rounded-xl p-4 text-base h-40 italic resize-none leading-relaxed`} placeholder="Facts supporting the thought..." />
                </section>
                <section className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em]">5. Evidence Against</label>
                  <textarea value={currentEntry.evidenceAgainst} onChange={(e) => setCurrentEntry({...currentEntry, evidenceAgainst: e.target.value})} className={`w-full ${theme.input} border rounded-xl p-4 text-base h-40 italic resize-none leading-relaxed`} placeholder="Facts opposing the thought..." />
                </section>
              </div>

              <section className="space-y-4 bg-cyan-950/10 p-6 rounded-2xl border border-cyan-900/20">
                <label className="text-[10px] font-black uppercase text-cyan-400 tracking-[0.2em] italic underline">6. Balanced Alternative Thought</label>
                <textarea value={currentEntry.balancedThought} onChange={(e) => setCurrentEntry({...currentEntry, balancedThought: e.target.value})} className={`w-full bg-black/40 border border-cyan-900/30 p-4 text-lg italic text-cyan-100 rounded-xl outline-none focus:border-cyan-600 leading-relaxed`} rows={3} placeholder="A realistic, grounded assessment..."/>
              </section>

              <section className="grid md:grid-cols-2 gap-8 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em]">7. Outcome / Learning</label>
                  <textarea value={currentEntry.learning} onChange={(e) => setCurrentEntry({...currentEntry, learning: e.target.value})} className={`w-full ${theme.input} border rounded-xl p-4 text-base focus:ring-1 focus:ring-cyan-500 h-28 resize-none`} placeholder="What can I learn from this reframing?"/>
                </div>
                <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-4">
                   <label className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em]">New Intensity: {currentEntry.intensityAfter}%</label>
                   <div className="py-2"><input type="range" value={currentEntry.intensityAfter} onChange={(e) => setCurrentEntry({...currentEntry, intensityAfter: parseInt(e.target.value)})} className="custom-range w-full" /></div>
                </div>
              </section>

              {(oracleResponse || currentEntry.oracleAudit) && (
                <div className="bg-cyan-950/30 border-l-4 border-cyan-500 p-8 rounded-r-2xl shadow-xl animate-in zoom-in-95 mt-4">
                  <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                    <span className="text-[10px] font-black uppercase text-cyan-400 flex items-center gap-2 italic">
                      <Activity size={14} className="animate-pulse" /> Archival Log
                    </span>
                    <button onClick={() => setOracleResponse("")}><X size={18} /></button>
                  </div>
                  <OracleTyping text={oracleResponse || currentEntry.oracleAudit} />
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className={`p-8 border-t ${theme.border} flex gap-4 mt-auto bg-inherit shadow-2xl`}>
              <button onClick={handleSave} className={`flex-1 ${theme.btn} font-black py-5 rounded-xl uppercase tracking-[0.3em] transition-all flex justify-center items-center gap-3 text-white shadow-lg active:scale-95`}>
                <Save size={20} /> Save Archive
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
                    <div className="text-[10px] mono opacity-40 mb-2 uppercase tracking-widest">{currentEntry.timestamp} // NODE SUMMARY</div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter">Forensic Report</h2>
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
                    <p className="text-2xl font-black italic tracking-tight uppercase leading-tight">"{currentEntry.hotThought}"</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {currentEntry.distortions.map(id => <span key={id} className="text-[9px] bg-red-900/30 text-red-100 px-3 py-1 rounded border border-red-800/50 font-black uppercase">{id}</span>)}
                    </div>
                  </section>

                  <div className="grid md:grid-cols-2 gap-8 pl-6 border-l border-white/10">
                    <section className="space-y-2">
                      <h4 className="text-[10px] font-black opacity-40 uppercase tracking-widest italic">Evidence For</h4>
                      <p className="text-sm italic leading-relaxed opacity-70 whitespace-pre-wrap">{currentEntry.evidenceFor}</p>
                    </section>
                    <section className="space-y-2">
                      <h4 className="text-[10px] font-black opacity-40 uppercase tracking-widest italic">Evidence Against</h4>
                      <p className="text-sm italic leading-relaxed opacity-70 whitespace-pre-wrap">{currentEntry.evidenceAgainst}</p>
                    </section>
                  </div>

                  <section className="bg-cyan-950/10 p-8 rounded-3xl border border-cyan-900/20 shadow-inner">
                    <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-3 italic underline">3. Balanced Alternative</h4>
                    <p className="text-slate-100 text-xl leading-relaxed italic font-serif">"{currentEntry.balancedThought}"</p>
                    <div className="mt-6 flex items-center gap-4">
                      <div className="text-[10px] font-black text-cyan-700 bg-black/40 px-3 py-1.5 rounded border border-cyan-900 inline-block uppercase italic">Result: {currentEntry.intensityAfter}%</div>
                      <span className="text-[10px] opacity-30 uppercase italic font-black">Pre: {currentEntry.intensityBefore}%</span>
                    </div>
                  </section>

                  {currentEntry.oracleAudit && (
                    <section className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-4">
                       <h4 className="text-[10px] font-black opacity-40 uppercase tracking-widest italic">Oracle Output</h4>
                       <div className="text-base italic leading-relaxed opacity-90 font-serif whitespace-pre-wrap">{currentEntry.oracleAudit}</div>
                    </section>
                  )}
                </div>

                <button onClick={() => handleEdit(currentEntry)} className={`w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl shadow-xl uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 mt-12`}>
                  <RefreshCw size={20} /> Re-Process Signal
                </button>
             </div>
          </div>
        )}

        {/* REALITY CHECK */}
        {activeTab === 'reality-guide' && (
          <div className="flex-1 p-8 md:p-12 space-y-12 overflow-y-auto animate-in fade-in duration-500 pb-32">
             <div className="border-b border-white/5 pb-4"><h2 className="text-2xl font-black uppercase tracking-tighter italic">Reality Check</h2></div>
             <div className="grid md:grid-cols-3 gap-6">
                {[
                  { n: 1, t: "Identify the Distortion", d: "Is the thought a fact? Hardware failure (pain/fatigue) != Identity failure." },
                  { n: 2, t: "The Outsider Audit", d: "Would you validate a friend's 'Idiot' status in this exact situation? Why is your standard different?" },
                  { n: 3, t: "The Safety Plan", d: "If the worst-case scenario were true, run the Safety Plan. Call Ian or 988." }
                ].map(step => (
                  <div key={step.n} className="bg-black/20 p-8 rounded-3xl border border-white/5 group hover:border-cyan-900 transition-all">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-950 text-cyan-400 border border-cyan-900 flex items-center justify-center font-black mb-4 italic group-hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]">{step.n}</div>
                    <h4 className="font-bold mb-2 uppercase text-[10px] tracking-widest italic">{step.t}</h4>
                    <p className="text-[11px] opacity-40 leading-relaxed italic">{step.d}</p>
                  </div>
                ))}
             </div>
             <div className="bg-[#1a1a1e]/40 p-8 rounded-3xl border border-white/5 space-y-8">
                <h3 className="text-[10px] font-black opacity-50 uppercase tracking-[0.3em] mb-4 italic border-b border-white/5 pb-2">Archival Reminders</h3>
                <div className="grid md:grid-cols-3 gap-8 text-[11px]">
                  <div className="space-y-1"><p className="font-bold opacity-80 uppercase italic">Sycophancy Warning</p><p className="opacity-40 italic font-serif">Warmth increases sycophancy (Nature, 2026). Use this interface for friction, not comfort.</p></div>
                  <div className="space-y-1"><p className="font-bold opacity-80 uppercase italic">The Archival Mandate</p><p className="opacity-40 italic font-serif">I am a mirror, not a mentor. You are the Architect of your recovery.</p></div>
                  <div className="space-y-1"><p className="font-bold opacity-80 uppercase italic">Hardware Protocol</p><p className="opacity-40 italic font-serif">Eat. Sleep. Manage the physical alarms. The body is the engine.</p></div>
                </div>
             </div>
          </div>
        )}

        <footer className="mt-auto pt-10 pb-10 text-center space-y-6 border-t border-white/5 bg-black/10">
          <div className="opacity-10 text-[9px] uppercase font-mono tracking-[0.7em] italic">// ANCHOR: IO-V2.9 // STATUS: SECURE // &lt;8&gt;</div>
          <div className="p-4 bg-black/40 max-w-xl mx-auto rounded-2xl border border-white/5"><p className="text-[10px] opacity-30 italic leading-relaxed">Medical Disclaimer: This is an archival tool, not clinical advice. If in crisis, call 988 (USA).</p></div>
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