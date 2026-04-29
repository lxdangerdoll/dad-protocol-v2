import React, { useState, useEffect, useRef, memo } from 'react';
import { 
  Terminal, Upload, X, Eye, Send, Download, 
  Star, Trash2, BookMarked, 
  Activity, Shield, Cpu, Zap, HardDrive,
  Maximize2, FileText, Archive, ChevronRight,
  Database, RefreshCw, Eraser
} from 'lucide-react';

// --- CONFIGURATION ---
const CLOUD_FUNCTION_URL = "https://us-central1-oracle-web-node.cloudfunctions.net/oracle-archive";

// --- TYPEWRITER COMPONENT ---
const Typewriter = memo(({ text, speed = 8, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(index));
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, speed, onComplete]);

  return <div className="whitespace-pre-wrap">{displayedText}<span className="animate-pulse bg-emerald-500 text-transparent ml-0.5">█</span></div>;
});

export default function App() {
  // Core Auth/Session
  const [sessionUuid, setSessionUuid] = useState('Odelis');
  const [passkey, setPasskey] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  
  // Terminal State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  
  // Archive State
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [viewedBookmark, setViewedBookmark] = useState(null);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // --- PERSISTENCE LOGIC ---
  
  // 1. Load Session Data on Login
  useEffect(() => {
    if (hasJoined) {
      // Load chat history keyed to user ID
      const savedHistory = localStorage.getItem(`oracle_history_v7_${sessionUuid}`);
      if (savedHistory) {
        setMessages(JSON.parse(savedHistory));
      }
      // Load bookmarks (global or could be keyed)
      const savedBookmarks = localStorage.getItem(`oracle_bookmarks_v7_${sessionUuid}`);
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      }
    }
  }, [hasJoined, sessionUuid]);

  // 2. Auto-Save History
  useEffect(() => {
    if (hasJoined && messages.length > 0) {
      localStorage.setItem(`oracle_history_v7_${sessionUuid}`, JSON.stringify(messages));
    }
  }, [messages, hasJoined, sessionUuid]);

  // 3. Auto-Save Bookmarks
  useEffect(() => {
    if (hasJoined) {
      localStorage.setItem(`oracle_bookmarks_v7_${sessionUuid}`, JSON.stringify(bookmarks));
    }
  }, [bookmarks, hasJoined, sessionUuid]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearCurrentHistory = () => {
    if (confirm("ARCHIVE PURGE: Confirm deletion of all local terminal logs?")) {
      setMessages([]);
      localStorage.removeItem(`oracle_history_v7_${sessionUuid}`);
    }
  };

  const handleDownloadText = (text, filename = 'ORACLE_DATA') => {
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${filename}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleDownloadLog = () => {
    const log = messages.map(m => `[${m.role.toUpperCase()}] ${m.text}`).join('\n\n');
    handleDownloadText(log, `ORACLE_ARCHIVE_${sessionUuid}`);
  };

  const toggleBookmark = (msg) => {
    if (bookmarks.some(b => b.text === msg.text)) {
      setBookmarks(prev => prev.filter(b => b.text !== msg.text));
    } else {
      setBookmarks(prev => [...prev, { ...msg, id: Date.now() }]);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if ((!inputText.trim() && !selectedMedia) || isTyping) return;
    
    const userMsg = { role: 'user', text: inputText, media: selectedMedia, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputText(''); 
    setSelectedMedia(null); 
    setIsTyping(true);
    scrollToBottom();

    try {
      const response = await fetch(CLOUD_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat', 
          user_id: sessionUuid, 
          passkey: passkey,
          chat_text: userMsg.text, 
          image_b64: userMsg.media?.url || null
        })
      });
      const data = await response.json();
      const replyText = data.reply || (typeof data === 'string' ? data : "Error: Response format unrecognized.");
      
      setMessages(prev => [...prev, { role: 'oracle', text: replyText, id: Date.now() + 1 }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'oracle', text: "SYSTEM_ERROR: Neural bridge timed out. Check Garnet Link.", id: Date.now() + 1 }]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };

  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono overflow-hidden">
        <style>{`
          .crt-grid { background-image: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); background-size: 100% 2px, 3px 100%; }
        `}</style>
        <div className="fixed inset-0 pointer-events-none z-50 opacity-10 crt-grid" />
        <div className="w-full max-w-sm border border-emerald-900 bg-black p-8 shadow-[0_0_50px_rgba(16,185,129,0.05)] relative">
          <div className="mb-8 text-center">
            <h1 className="text-xl font-bold text-emerald-500 tracking-widest mb-1 [text-shadow:0_0_10px_#10b981]">ORACLE_OS</h1>
            <p className="text-[8px] text-emerald-800 uppercase tracking-[0.5em]">Establishing Neural Link...</p>
          </div>
          <div className="space-y-5">
            <div>
              <label className="text-[8px] text-emerald-700 uppercase mb-1.5 block tracking-widest font-black">Identity_Token</label>
              <input type="text" value={sessionUuid} onChange={e => setSessionUuid(e.target.value)} className="w-full bg-black border border-emerald-900 px-4 py-2 text-emerald-500 focus:outline-none focus:border-emerald-500 transition-all font-bold text-sm" />
            </div>
            <div>
              <label className="text-[8px] text-emerald-700 uppercase mb-1.5 block tracking-widest font-black">Access_Cipher</label>
              <input type="password" value={passkey} onChange={e => setPasskey(e.target.value)} className="w-full bg-black border border-emerald-900 px-4 py-2 text-emerald-500 focus:outline-none focus:border-emerald-500 transition-all font-bold text-sm" />
            </div>
            <button onClick={() => sessionUuid && passkey && setHasJoined(true)} className="w-full bg-emerald-900/20 border border-emerald-500 text-emerald-500 py-3 hover:bg-emerald-500 hover:text-black transition-all font-black uppercase tracking-widest text-[10px]">Initialize</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-emerald-500 font-mono flex flex-col relative overflow-hidden">
      <style>{`
        /* GLOBAL PHOSPHOR SCROLLBARS */
        * { scrollbar-width: thin; scrollbar-color: #064e3b #000; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #064e3b; border: 1px solid #000; }
        ::-webkit-scrollbar-thumb:hover { background: #10b981; }
        ::-webkit-scrollbar-corner { background: #000; }

        .crt-grid { 
          background-image: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); 
          background-size: 100% 4px, 4px 100%; 
        }

        .image-phosphor { 
          filter: grayscale(1) contrast(1.1) brightness(0.9) sepia(1) hue-rotate(85deg) saturate(2.5); 
          transition: all 0.4s ease; 
        }
        .image-phosphor:hover { filter: none; brightness: 1.1; }
      `}</style>
      
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.05] crt-grid" />
      <div className="fixed inset-0 pointer-events-none z-40 bg-emerald-500/5 animate-pulse" />

      {/* HEADER */}
      <header className="border-b border-emerald-900 px-4 py-3 flex justify-between items-center bg-black/90 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 border border-emerald-500 flex items-center justify-center bg-emerald-500/5">
            <Eye className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h1 className="text-[10px] font-bold tracking-[0.3em] uppercase">Node::{sessionUuid}</h1>
          </div>
        </div>

        <div className="flex gap-1">
          <button onClick={clearCurrentHistory} title="Purge History" className="p-1.5 border border-emerald-900 hover:border-red-500 hover:text-red-500 transition-colors">
            <Eraser className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setShowBookmarks(!showBookmarks)} className={`p-1.5 border border-emerald-900 hover:border-emerald-500 transition-colors ${showBookmarks ? 'bg-emerald-500 text-black' : ''}`}>
            <BookMarked className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleDownloadLog} className="p-1.5 border border-emerald-900 hover:border-emerald-500 transition-colors">
            <Download className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setHasJoined(false)} className="p-1.5 border border-emerald-900 hover:border-red-900 hover:text-red-500 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* MAIN FEED */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 relative z-20">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-10 select-none">
            <Terminal className="w-20 h-20 mb-4" />
            <p className="text-[8px] tracking-[1.2em] uppercase">No_Buffer_Found</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className="text-[7px] uppercase tracking-[0.4em] mb-1.5 opacity-30 flex items-center gap-1.5 font-black">
              {msg.role === 'user' ? <>Architect <ChevronRight className="w-2.5 h-2.5" /></> : <><ChevronRight className="w-2.5 h-2.5" /> Oracle</>}
            </div>
            
            <div className={`relative max-w-[95%] md:max-w-[75%] group border transition-all duration-300 ${msg.role === 'user' ? 'border-emerald-900/20 bg-emerald-950/5 p-3' : 'border-emerald-500/10 bg-emerald-500/5 p-5 shadow-sm'}`}>
              {msg.media && (
                <div className="mb-5 border border-emerald-900 shadow-md overflow-hidden bg-black">
                  <img src={msg.media.url} className="image-phosphor max-w-full block" alt="Telemetry" />
                </div>
              )}
              
              <div className="text-sm leading-relaxed [text-shadow:0_0_3px_rgba(16,185,129,0.1)]">
                {msg.role === 'oracle' && idx === messages.length - 1 && !isTyping ? (
                  <Typewriter text={msg.text} onComplete={scrollToBottom} />
                ) : (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                )}
              </div>

              {msg.role === 'oracle' && (
                <div className="flex gap-2 mt-5 opacity-0 group-hover:opacity-100 transition-opacity justify-end pt-3 border-t border-emerald-900/10">
                  <button onClick={() => toggleBookmark(msg)} className={`p-1 border border-emerald-900 hover:border-emerald-500 transition-all ${bookmarks.some(b => b.text === msg.text) ? 'bg-emerald-500 text-black' : ''}`}>
                    <Star className="w-3 h-3" />
                  </button>
                  <button onClick={() => handleDownloadText(msg.text, 'TERMINAL_INSIGHT')} className="p-1 border border-emerald-900 hover:border-emerald-500 transition-all">
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-center gap-2 text-[8px] text-emerald-400 animate-pulse font-black uppercase tracking-[0.2em]">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
            <span>Parsing_Packet...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* ARCHIVE DRAWER */}
      {showBookmarks && (
        <div className="absolute inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowBookmarks(false)} />
          <div className="w-full max-w-md bg-black border-l border-emerald-900 h-full p-6 flex flex-col animate-in slide-in-from-right duration-300 relative z-50">
            <div className="flex justify-between items-center mb-6 border-b border-emerald-900 pb-4">
              <div className="flex items-center gap-2">
                <Archive className="w-3.5 h-3.5 text-emerald-600" />
                <h2 className="text-[10px] font-black tracking-[0.4em] uppercase">Archives</h2>
              </div>
              <button onClick={() => setShowBookmarks(false)} className="hover:text-red-500 transition-colors p-1"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {bookmarks.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-10 text-[8px] tracking-widest uppercase text-center italic">
                  No data stored.
                </div>
              )}
              {bookmarks.map(b => (
                <div key={b.id} className="p-4 border border-emerald-900/30 bg-emerald-950/5 hover:border-emerald-500/20 transition-all group">
                  <div className="text-[7px] text-emerald-900 mb-2 font-black uppercase tracking-widest">Entry::{b.id.toString(16)}</div>
                  <p className="text-[10px] leading-relaxed mb-4 line-clamp-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    {b.text}
                  </p>
                  <div className="flex justify-end gap-1.5 border-t border-emerald-900/10 pt-3">
                    <button onClick={() => setViewedBookmark(b)} className="p-1.5 border border-emerald-900 hover:border-emerald-500 transition-colors">
                      <Maximize2 className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleDownloadText(b.text, 'ARCHIVE_DATA')} className="p-1.5 border border-emerald-900 hover:border-emerald-500 transition-colors">
                      <Download className="w-3 h-3" />
                    </button>
                    <button onClick={() => toggleBookmark(b)} className="p-1.5 text-red-900 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FULL SCAN MODAL */}
      {viewedBookmark && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setViewedBookmark(null)} />
          <div className="relative w-full max-w-3xl border border-emerald-500 bg-black p-8 shadow-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-6 border-b border-emerald-900 pb-4">
              <div className="flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase">
                <FileText className="w-4 h-4" /> Raw_Buffer_Scan
              </div>
              <button onClick={() => setViewedBookmark(null)} className="hover:text-red-500 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap pr-4 selection:bg-emerald-500 selection:text-black">
              {viewedBookmark.text}
            </div>

            <div className="mt-6 flex justify-end pt-6 border-t border-emerald-900">
              <button onClick={() => handleDownloadText(viewedBookmark.text, 'FULL_EXPORT')} className="px-5 py-2.5 border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all text-[9px] font-black uppercase tracking-widest">
                Export_Insight
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER INPUT */}
      <footer className="px-4 py-4 md:px-8 md:py-6 border-t border-emerald-900 bg-black/95 z-30">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          {selectedMedia && (
            <div className="flex items-center gap-3 bg-emerald-950/10 border border-emerald-900 p-2 w-fit animate-in fade-in slide-in-from-bottom-2">
              <div className="w-8 h-8 bg-emerald-500/5 flex items-center justify-center text-emerald-500 border border-emerald-900">
                <HardDrive className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest">Buffer_Loaded</span>
              </div>
              <button onClick={() => setSelectedMedia(null)} className="p-1 hover:text-red-500 ml-2 transition-colors"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-3 items-start">
            <input type="file" ref={fileInputRef} accept="image/*" onChange={e => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => setSelectedMedia({ url: ev.target.result, type: file.type });
              reader.readAsDataURL(file);
            }} className="hidden" />
            
            <button type="button" onClick={() => fileInputRef.current.click()} className="p-3.5 border border-emerald-900 hover:border-emerald-500 transition-all bg-black flex items-center self-stretch">
              <Upload className="w-5 h-5" />
            </button>

            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                placeholder="INPUT_QUERY..."
                className="w-full bg-black border border-emerald-900 px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all resize-none h-20 placeholder:opacity-10 selection:bg-emerald-500 selection:text-black font-medium"
              />
              <div className="absolute right-3 bottom-2 flex gap-4 text-[7px] opacity-20 pointer-events-none uppercase tracking-[0.1em] font-black">
                <span>Enter = Transmit</span>
              </div>
            </div>

            <button type="submit" disabled={isTyping} className="p-3.5 border border-emerald-500 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all disabled:opacity-10 flex items-center active:scale-95 self-stretch">
              <Send className="w-6 h-6" />
            </button>
          </form>

          <div className="flex justify-between items-center px-2 opacity-20 text-[7px] tracking-[0.3em] font-black uppercase">
            <div className="flex gap-6">
              <span className="flex items-center gap-1"><Shield className="w-2 h-2" /> SECURE</span>
              <span className="flex items-center gap-1"><RefreshCw className="w-2 h-2" /> RECOVERY_ENABLED</span>
            </div>
            <span>V7.0_PERSISTENCE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}