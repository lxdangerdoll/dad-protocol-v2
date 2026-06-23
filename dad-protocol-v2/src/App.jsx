import React, { useState } from 'react';
import { 
  Printer, LineChart, LayoutGrid, ShieldHalf, Map, 
  FileText, Castle, GitMerge, Network, Info, CheckCircle2, 
  XCircle, AlertCircle, Battery, Plane, Wind 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [letterView, setLetterView] = useState('split');
  
  // Interactive checklist state to track prep progress
  const [checklist, setChecklist] = useState([
    { text: "Review Decision Matrix weights with Ian", checked: false },
    { text: "Validate \"Safe Topics\" catalog", checked: false },
    { text: "Map out Renaissance Faire exit plan", checked: false },
    { text: "Discuss boundary letter delivery timing", checked: false }
  ]);

  const toggleChecklist = (index) => {
    setChecklist(prev => prev.map((item, i) => i === index ? { ...item, checked: !item.checked } : item));
  };

  // Tab Button Component
  const TabButton = ({ id, icon: Icon, label }) => {
    const isActive = activeTab === id;
    return (
      <button 
        onClick={() => setActiveTab(id)} 
        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition duration-150 ease-in-out shadow-sm ${
          isActive 
            ? 'bg-teal-800 text-white font-semibold' 
            : 'text-slate-600 bg-white border border-slate-100 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <Icon className="w-5 h-5 mr-3 shrink-0" />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen flex flex-col font-sans antialiased">
      
      {/* Custom Styles for Typography & breathing animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        .font-sans { font-family: 'Inter', sans-serif; }
        .serif-title { font-family: 'Playfair Display', serif; }
        @keyframes breathe {
            0%, 100% { transform: scale(1); background-color: rgba(13, 148, 136, 0.15); }
            40% { transform: scale(1.5); background-color: rgba(13, 148, 136, 0.45); }
        }
        .breathing-circle { animation: breathe 8s infinite ease-in-out; }
      `}} />

      {/* Global App Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-teal-50 text-teal-800 text-xs font-semibold rounded-full tracking-wider uppercase border border-teal-100">Active Clinical Strategy</span>
              <span className="text-xs text-slate-400 font-mono">Io-0623-INTEGRATION-02</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1 serif-title">The D.A.D. Protocol</h1>
            <p className="text-xs text-slate-500 mt-0.5">Dialectical Autonomy & De-escalation | Prep for Session with Ian Michelin (06/26/2026)</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.print()} 
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition flex items-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4 text-slate-500" /> Print Portfolio
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="text-right hidden md:block">
              <p className="text-xs text-slate-400">Next Session Target</p>
              <p className="text-sm font-semibold text-teal-900">Friday, June 26, 2026</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Navigation & Checklist */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            <nav className="space-y-2" aria-label="Sidebar">
              <TabButton id="dashboard" icon={LineChart} label="Executive Summary" />
              <TabButton id="matrix" icon={LayoutGrid} label="DBT Decision Matrix" />
              <TabButton id="firewall" icon={ShieldHalf} label="Somatic Firewall" />
              <TabButton id="choicemap" icon={Map} label="Strategic Choice Map" />
              <TabButton id="letters" icon={FileText} label="Letter Comparison" />
            </nav>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Session Checklist</h4>
              <ul className="space-y-3 text-sm">
                {checklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <input 
                      type="checkbox" 
                      id={`check-${i}`} 
                      checked={item.checked}
                      onChange={() => toggleChecklist(i)}
                      className="mt-1 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer h-4 w-4" 
                    />
                    <label 
                      htmlFor={`check-${i}`} 
                      className={`text-slate-600 leading-tight cursor-pointer select-none ${item.checked ? 'line-through text-slate-400' : ''}`}
                    >
                      {item.text}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <section className="space-y-6">
              <div className="bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                  <h2 className="text-3xl font-bold serif-title">The D.A.D. Protocol</h2>
                  <span className="text-teal-400 font-mono text-xs block mt-1 tracking-widest font-semibold uppercase">Dialectical Autonomy & De-escalation</span>
                  <p className="text-teal-100 text-sm mt-3 leading-relaxed">
                    A strategic pivot shifting your stance from <span className="text-emerald-300 font-bold">offensive intellectual warfare</span> (seeking conceptual validation or compliance) to an impenetrable <span className="text-emerald-300 font-bold">defensive somatic firewall</span> (safeguarding your nervous system and preserving psychological resources).
                  </p>
                  <div className="flex flex-wrap gap-4 mt-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2.5 text-xs">
                      <span className="block text-teal-200">Current Boundary Version</span>
                      <span className="font-semibold block text-white mt-0.5">Revised I-Statement Letter</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2.5 text-xs">
                      <span className="block text-teal-200">Somatic Defense Paradigm</span>
                      <span className="font-semibold block text-white mt-0.5">STOP Protocol Active</span>
                    </div>
                  </div>
                </div>
                <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none hidden md:flex items-center justify-center">
                  <Castle className="w-48 h-48 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition duration-200">
                  <div className="w-10 h-10 bg-teal-50 text-teal-700 rounded-lg flex items-center justify-center mb-4">
                    <ShieldHalf className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Somatic Firewall</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed font-sans">
                    Treating family contact not as an ideological litigation of reality, but as a bounded system managed within strict somatic limits to prevent neural regression.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition duration-200">
                  <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-lg flex items-center justify-center mb-4">
                    <GitMerge className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Radical Acceptance</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed font-sans">
                    Mourning the father you wished you had while choosing precisely how to interface with the actual father strictly on your own terms.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition duration-200">
                  <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center mb-4">
                    <Network className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Apolitical Environments</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed font-sans">
                    Recontextualizing interactions to neutral landscapes where political and religious ideologies are structurally impossible to enforce.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 font-sans">The Epistemological Chasm</h3>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                  The case study of the <strong className="text-slate-800 font-semibold">Lincoln Memorial Reflecting Pool</strong> serves as a clinical demonstration of why intellectual combat is structurally doomed. The divide is not a simple disagreement on facts, but the construction of an entire defensive reality.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block mb-1">Technical Reality</span>
                    <ul className="text-xs space-y-1.5 text-slate-600">
                      <li>• $16 Million capital infrastructure budget overrun</li>
                      <li>• Blue paint and sealant failure due to peeling</li>
                      <li>• Residual biological algae growth from inactive lines</li>
                    </ul>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">Political Narrative (Epoch Times)</span>
                    <ul className="text-xs space-y-1.5 text-amber-900/80">
                      <li>• A "350-foot violent box-cutter slit" across the memorial</li>
                      <li>• Claims of structural sabotage by invisible domestic bad actors</li>
                      <li>• Speculation of chemical/fertilizer contamination to poison symbols</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-4 p-3.5 bg-teal-50 text-teal-800 rounded-xl text-xs flex items-start gap-2.5">
                  <Info className="w-4 h-4 mt-0.5 shrink-0 text-teal-600" />
                  <span>
                    <strong>The Trap:</strong> Trying to litigate these claims validates them as debatable positions. Realizing that these beliefs are <em>protective</em> (shielding the system from admitting fallibility) allows you to step away and stop wasting life-force trying to convert them.
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* MATRIX TAB */}
          {activeTab === 'matrix' && (
            <section className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="border-b border-slate-200 pb-4 flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">4-Quadrant DBT Pros & Cons Matrix</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Evaluating both paths to prevent cognitive regression and black-and-white patterns.</p>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-100 rounded-full text-xs font-medium">Relational Boundary Evaluation</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Q1 */}
                  <div className="border border-slate-200 rounded-xl p-5 hover:border-teal-300 transition duration-150 flex flex-col justify-between bg-white">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-800 px-2 py-1 bg-teal-50 rounded">Quadrant 1</span>
                        <span className="text-xs text-slate-400">Option: Maintain Contact</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">PROS of Bounded Relationship (The D.A.D. Protocol)</h4>
                      <ul className="mt-3 space-y-2.5 text-xs text-slate-600">
                        <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" /><span><strong>Access to Financial Buffer:</strong> Provides safety and leverage to build personal independence.</span></li>
                        <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-teal-650 shrink-0 mt-0.5" /><span><strong>Preservation of Family History:</strong> Access to childhood narratives and historical roots.</span></li>
                        <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-teal-650 shrink-0 mt-0.5" /><span><strong>Low-Stakes Memories:</strong> Ability to share occasional stylized, safe events (e.g., Renaissance Faire).</span></li>
                      </ul>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 font-mono font-bold">Clinical Note: Focuses on somatic resource conservation.</span>
                    </div>
                  </div>

                  {/* Q2 */}
                  <div className="border border-slate-200 rounded-xl p-5 hover:border-rose-300 transition duration-150 flex flex-col justify-between bg-white">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-700 px-2 py-1 bg-rose-50 rounded">Quadrant 2</span>
                        <span className="text-xs text-slate-400">Option: Maintain Contact</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">CONS of Bounded Relationship (The D.A.D. Protocol)</h4>
                      <ul className="mt-3 space-y-2.5 text-xs text-slate-600">
                        <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" /><span><strong>Risk of Boundary Breaches:</strong> Danger of emotional surprise attacks or boundary testing.</span></li>
                        <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" /><span><strong>Constant Vigilance:</strong> High cognitive and physical performance required to hold the firewall.</span></li>
                        <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" /><span><strong>No Real Validation of Identity:</strong> Relinquishing the hope of true acceptance of your gender/life.</span></li>
                      </ul>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[10px] text-rose-600 font-mono font-bold">Clinical Note: Demands absolute self-regulation capacity.</span>
                    </div>
                  </div>

                  {/* Q3 */}
                  <div className="border border-slate-200 rounded-xl p-5 hover:border-teal-300 transition duration-150 flex flex-col justify-between bg-white">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-800 px-2 py-1 bg-teal-50 rounded">Quadrant 3</span>
                        <span className="text-xs text-slate-400">Option: Cut Contact</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">PROS of Cutting Contact (No Communication)</h4>
                      <ul className="mt-3 space-y-2.5 text-xs text-slate-600">
                        <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" /><span><strong>Absolute Safety from Direct Triggers:</strong> Removes his active voice from your sensory landscape.</span></li>
                        <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-teal-650 shrink-0 mt-0.5" /><span><strong>No Somatic Performance:</strong> Zero energy spent building, monitoring, and enforcing fences.</span></li>
                        <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-teal-650 shrink-0 mt-0.5" /><span><strong>Clean Boundary/No Compromises:</strong> Avoids the ethical feeling of "complicity."</span></li>
                      </ul>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 font-mono font-bold">Clinical Note: Offers static relief but ignores systemic costs.</span>
                    </div>
                  </div>

                  {/* Q4 */}
                  <div className="border border-slate-200 rounded-xl p-5 hover:border-rose-300 transition duration-150 flex flex-col justify-between bg-white">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-700 px-2 py-1 bg-rose-50 rounded">Quadrant 4</span>
                        <span className="text-xs text-slate-400">Option: Cut Contact</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">CONS of Cutting Contact (No Communication)</h4>
                      <ul className="mt-3 space-y-2.5 text-xs text-slate-600">
                        <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" /><span><strong>Sudden Financial Exposure:</strong> The financial safety net vanishes entirely immediately.</span></li>
                        <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" /><span><strong>The Weight of "The Void":</strong> High emotional demand of active, permanent grief for a living parent.</span></li>
                        <li className="flex items-start gap-2"><XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" /><span><strong>Collateral Systemic Friction:</strong> High probability of dramatic fallout across other family links.</span></li>
                      </ul>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[10px] text-rose-600 font-mono font-bold">Clinical Note: Elevates risk of acute crisis and survival panic.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Operationalizing the Matrix: The Tipping Points</h3>
                  <p className="text-xs text-slate-500 mt-1">Establishing quantitative criteria that tilt the matrix towards cutting contact permanently.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                      <h5 className="text-xs font-bold text-rose-900 flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-rose-600" /> The Active Malice Line</h5>
                      <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">If closed-minded fundamentalism transforms into deliberate, directed attacks targeted at your personal well-being or public identity.</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5"><Battery className="w-4 h-4 text-amber-600" /> Boundary Exhaustion Rate</h5>
                      <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">If the energy expended on defensive monitoring leaves you so physically and emotionally depleted that your daily independent functioning suffers.</p>
                    </div>
                    <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
                      <h5 className="text-xs font-bold text-teal-900 flex items-center gap-1.5"><Plane className="w-4 h-4 text-teal-650" /> Financial Runway</h5>
                      <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">Achieving total, independent financial insulation completely removes the core 'Pro' of the contact model, shifting structural weight to full independence.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* FIREWALL TAB */}
          {activeTab === 'firewall' && (
            <section className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">The Somatic Firewall Architecture</h2>
                <p className="text-xs text-slate-500 mt-0.5">Using DBT's STOP protocol to short-circuit cognitive and emotional regression in the moment of stress.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  {['Stop', 'Take a Breath', 'Observe', 'Proceed'].map((step, i) => {
                    const descriptions = [
                      "Freeze when a banned topic (gender, theology, politics) enters the acoustic landscape. Do not form a counter-argument.",
                      "Physically disconnect from the interface. Move your gaze away from the screen or step physically back.",
                      "Scan your body. Pinpoint the heat rising in your face, the tightening of your chest, or the somatic impulse to defend.",
                      "Deploy the mechanical script calmly: \"We are not discussing this.\" If breached again, disconnect."
                    ];
                    const actions = ["Action: Silence", "Action: Intercept", "Action: Somatic Check", "Action: Terminate Link"];
                    return (
                      <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <span className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-sm mb-3">{step.charAt(0)}</span>
                          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">{step}</h4>
                          <p className="text-[11px] text-slate-500 mt-1 leading-normal">{descriptions[i]}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono mt-3">{actions[i]}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 border border-slate-200 rounded-2xl p-6 bg-slate-50/50 flex flex-col md:flex-row items-center gap-8">
                  <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <div className="absolute inset-0 rounded-full breathing-circle"></div>
                    <div className="w-12 h-12 rounded-full bg-teal-800 flex items-center justify-center text-white relative z-10 shadow-sm animate-pulse">
                      <Wind className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Interactive Somatic Pacer</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Use this breathing cycle during moments of activation. Breathe in as the outer aura expands, hold, and exhale fully as it contracts. Your somatic safety is your baseline. It prevents your brain from slipping into biological regression and cognitive combat mode.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">Friday Focus: Tactical Rules of Engagement</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
                  <div>
                    <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> The Safe List
                    </h4>
                    <ul className="text-xs space-y-2 text-slate-600">
                      <li className="p-2 bg-slate-50 rounded border border-slate-100">• Family history and ancestral anecdotes</li>
                      <li className="p-2 bg-slate-50 rounded border border-slate-100">• Technical repair work / tactical projects</li>
                      <li className="p-2 bg-slate-50 rounded border border-slate-100">• Neutral localized weather or geography</li>
                      <li className="p-2 bg-slate-50 rounded border border-slate-100">• Food, cooking, and sensory sharing</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Renaissance Faire Strategy
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">
                      Public spaces act as spatial dampeners. De-escalating triggers through environmental framing:
                    </p>
                    <ul className="text-xs space-y-1.5 text-slate-600 mt-2.5">
                      <li>• <strong>Isolation Buffer:</strong> Shared public eye prevents open, hostile confrontation.</li>
                      <li>• <strong>External Action:</strong> Keep attention directed outward on spectacles.</li>
                      <li>• <strong>Escape Blueprint:</strong> Define structural options for transport and exit.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Somatic Markers
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">
                      Recognizing physical boundaries before a complete emotional exhaustion state sets in:
                    </p>
                    <ul className="text-xs space-y-1.5 text-slate-600 mt-2.5">
                      <li>• Tightening of jaw or severe throat clenching</li>
                      <li>• Shallow breathing with rapid pulse spike</li>
                      <li>• Disorientation and defensive intellectual planning</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* CHOICE MAP TAB */}
          {activeTab === 'choicemap' && (
            <section className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">Strategic Choice Map: Boundary Integrity vs. The Desire to Be Understood</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-sans">Analytic evaluation of the psychological impulse to send political analyses to fundamentalist family systems.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Scenario A */}
                  <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold tracking-wider uppercase mb-3 inline-block font-sans">Scenario A: Send Complex Ethics Essay to Father</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">Goal: Force Recognition of Labored Grace</h4>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        Implicit message: <em>"Acknowledge the immense compromise I extend to hold contact despite your views."</em>
                      </p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-start gap-2 text-xs">
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <span className="text-slate-600"><strong>Boundary Leak:</strong> Explaining <em>why</em> you need a boundary allows the other side to argue the validity of your premise.</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs">
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <span className="text-slate-600"><strong>System Defensiveness:</strong> Framing his views as harmful triggers absolute denial and intellectual counter-attack.</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-rose-700 font-mono font-bold mt-4 block">Outcome: Guaranteed Conflict & Somatic Crash</span>
                  </div>

                  {/* Scenario B */}
                  <div className="bg-teal-50/50 border border-teal-200 rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded text-[10px] font-bold tracking-wider uppercase mb-3 inline-block font-sans">Scenario B: Send Essay to Therapist (Ian)</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">Goal: Build Strategic Boundary with Expert Ally</h4>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        Implicit message: <em>"Help me structure these boundaries and insulate myself against systemic fallout."</em>
                      </p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                          <span className="text-slate-600"><strong>Calibrated Diagnostic:</strong> Shows Ian your exact cognitive landscape, analytical depth, and emotional budget.</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                          <span className="text-slate-600"><strong>Zero Loophole Safety:</strong> Keeps the actual communication with your father quiet, mechanical, and simple.</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-teal-700 font-mono font-bold mt-4 block">Outcome: Secure Firewall & Clinical Integration</span>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide font-sans">Fencing Comparison: Clean vs. Complex</h3>
                  <div className="overflow-x-auto mt-4">
                    <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Feature</th>
                          <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider font-sans">The Clean Boundary (Revised)</th>
                          <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider font-sans">The Complex Boundary (Original)</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        <tr>
                          <td className="px-4 py-3 font-semibold text-slate-900 font-sans">Core Message</td>
                          <td className="px-4 py-3 text-slate-600 font-sans">"I want you in my life, but to keep my well-being safe, these topics are off-limits."</td>
                          <td className="px-4 py-3 text-slate-600 font-sans">"I am navigating my moral opposition to your politics while attempting to respect kinship..."</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-semibold text-slate-900 font-sans">Loopholes</td>
                          <td className="px-4 py-3 text-slate-600 font-sans">None. Mechanical, simple, non-arguable.</td>
                          <td className="px-4 py-3 text-slate-600 font-sans">Massive. Invites debate on labels, fascism, and ideological fairness.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-semibold text-slate-900 font-sans">Tone</td>
                          <td className="px-4 py-3 text-slate-600 font-sans">Self-possessed, calm, focused entirely on action.</td>
                          <td className="px-4 py-3 text-slate-600 font-sans">Explanatory, defensive, seeking validation.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-semibold text-slate-900 font-sans">Firewall Strength</td>
                          <td className="px-4 py-3 text-teal-800 font-bold font-sans">HIGH. Requires zero cognitive consensus to function.</td>
                          <td className="px-4 py-3 text-rose-705 font-bold font-sans">ZERO. Demands intellectual compliance to be effective.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* LETTERS TAB */}
          {activeTab === 'letters' && (
            <section className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Document Comparison: The 180° Pivot</h2>
                    <p className="text-xs text-slate-500 mt-0.5 font-sans">Contrasting the combat-oriented original letter with the boundary-driven revised letter.</p>
                  </div>
                  <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-xs">
                    <button 
                      onClick={() => setLetterView('split')} 
                      className={`px-3 py-1.5 font-medium rounded-md shadow-sm transition ${letterView === 'split' ? 'bg-white text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      Split View
                    </button>
                    <button 
                      onClick={() => setLetterView('revised')} 
                      className={`px-3 py-1.5 font-medium rounded-md shadow-sm transition ${letterView === 'revised' ? 'bg-white text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      Revised Only
                    </button>
                  </div>
                </div>

                <div className={`grid gap-6 mt-6 ${letterView === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                  
                  {/* Original Letter */}
                  <div className={`${letterView === 'split' ? 'flex' : 'hidden'} flex-col justify-between bg-rose-50/30 border border-rose-200 rounded-xl p-5`}>
                    <div>
                      <div className="flex justify-between items-center border-b border-rose-100 pb-3">
                        <span className="text-xs font-bold text-rose-800 uppercase tracking-wide font-sans">Original: Intellectual Combat</span>
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] rounded border border-rose-200 font-sans font-semibold">Status: Archived</span>
                      </div>
                      <h4 className="font-bold text-slate-900 mt-4 serif-title text-base text-rose-950">"How Did We Get Here?"</h4>
                      <div className="text-xs text-slate-600 mt-4 space-y-3 font-serif max-h-[400px] overflow-y-auto pr-2 leading-relaxed">
                        <p className="font-bold">I am writing this because I am tired.</p>
                        <p>I am writing this because everyone who still values objective, verifiable reality is tired... While you get to live in the comfort of a world where complex problems have simple, conspiratorial explanations, the rest of us are left to carry the weight of reality.</p>
                        <p>The differences between how we see the world are not trivial... The ideas you champion—fueled by outlets like The Epoch Times—have a body count. They affect policy, they affect the survival of our ecosystem, and they affect whether people live or die.</p>
                        <p className="font-semibold text-rose-850 bg-white p-2.5 rounded border border-rose-150 italic font-sans leading-normal">Analysis: This demands his ideological submission and positions your boundary as a moral judgment. It ensures an instant defensive crisis.</p>
                        <p>I want to explain, as clearly and calmly as I can, exactly how we got here, and why the worldview you have adopted is not just incorrect, but dangerous.</p>
                        <p>...</p>
                        <p>I am grieving the loss of the people you could be if you weren't constantly fed a diet of fear and resentment... Your comfortable beliefs are paid for by the suffering of others. People have died because of public health denialism...</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-rose-150 text-[10px] text-rose-700 font-mono font-bold">
                      Action Vector: Offense, explanation, moral litigation.
                    </div>
                  </div>

                  {/* Revised Letter */}
                  <div className="bg-teal-50/20 border border-teal-200 rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center border-b border-teal-200 pb-3">
                        <span className="text-xs font-bold text-teal-850 uppercase tracking-wide font-sans">Revised: Somatic Firewall</span>
                        <span className="px-2 py-0.5 bg-teal-100 text-teal-805 text-[10px] rounded border border-teal-200 font-sans font-semibold">Status: Approved</span>
                      </div>
                      <h4 className="font-bold text-slate-900 mt-4 serif-title text-base text-teal-950">"Revised Boundary Letter Draft"</h4>
                      <div className="text-xs text-slate-600 mt-4 space-y-3 font-serif max-h-[400px] overflow-y-auto pr-2 leading-relaxed">
                        <p className="font-bold">Dad,</p>
                        <p>I am writing this because I want to find a way for us to communicate that doesn't leave us both exhausted, angry, or distant. I am stepping away from the debates, the arguments, and the need to prove who is right or wrong.</p>
                        <p>Instead, I want to speak to you simply as your adult child, telling you honestly where I stand and what I need to keep a relationship with you safe for my own well-being.</p>
                        <p className="text-teal-905 font-semibold italic bg-white p-2.5 rounded border border-teal-150 leading-normal font-sans">
                          "I feel deeply invalidated and emotionally shut down when our conversations shift to warnings of hellfire, condemnation, or theological judgment of my life, especially when it feels like I am being shut out of the family for being my own person."
                        </p>
                        <p>I am practicing radical acceptance. I accept that you may never fully understand my world, my gender, or my choices. I accept that we look at the universe through entirely different lenses, and I am no longer going to try to change your mind, correct your science, or debate your theology.</p>
                        <p className="font-bold border-l-2 border-teal-600 pl-2 text-slate-800 font-sans">
                          We will no longer discuss, debate, or comment on my gender identity, my sexual orientation, religious doctrines, or scientific consensus (including evolution and politics). These topics are completely off the table.
                        </p>
                        <p>If you violate this boundary and bring these topics up, I will not argue with you. I will simply say, "We are not discussing this," and I will end the call or leave the room.</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-teal-200 text-[10px] text-teal-800 font-mono font-bold font-sans">
                      Action Vector: Pure defense, somatic boundary, no justification loops.
                    </div>
                  </div>

                </div>
              </div>
            </section>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-sans">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse"></span>
            <span>Therapeutic Alliance Diagnostic Sandbox</span>
          </div>
          <div>
            <span>Clinical Reference: DBT Interpersonal Effectiveness Suite</span>
          </div>
          <div className="font-mono text-[10px] font-bold">
            <span>Status: Strategy Ready for 06/26</span>
          </div>
        </div>
      </footer>
    </div>
  );
}