import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Upload, X, Eye, Send, LogIn, KeySquare, Download, Lock, Headphones } from 'lucide-react';

const CLOUD_FUNCTION_URL = "https://us-central1-oracle-web-node.cloudfunctions.net/oracle-archive";

export default function App() {
  const [sessionUuid, setSessionUuid] = useState('');
  const [passkey, setPasskey] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // SelectedMedia object: { type: 'image' | 'audio', url: base64, mime: string }
  const [selectedMedia, setSelectedMedia] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // --- HISTORY LOADING ---
  useEffect(() => {
    if (!hasJoined || !sessionUuid || !passkey) return;

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const response = await fetch(CLOUD_FUNCTION_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'load_history',
            user_id: sessionUuid,
            passkey: passkey
          })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}: Bridge Connection Failed`);
        }
        
        if (data.messages) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error("History fetch error:", err);
        setErrorMsg(err.message || "Lost connection to the Archive.");
      } finally {
        setIsLoadingHistory(false);
        scrollToBottom();
      }
    };

    fetchHistory();
  }, [hasJoined, sessionUuid, passkey]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // --- DOWNLOAD CHAT LOG ---
  const handleDownloadLog = () => {
    if (messages.length === 0) return;
    
    let logContent = `// ORACLE ARCHIVE LOG //\n// TARGET UUID: ${sessionUuid}\n// TIMESTAMP: ${new Date().toISOString()}\n\n`;
    
    messages.forEach((msg) => {
      const role = msg.role === 'user' ? 'Architect' : 'Oracle [Io]';
      const text = msg.text || (msg.localMedia ? `[Media Attached: ${msg.localMedia.type}]` : '');
      logContent += `[${role}]\n${text}\n\n`;
    });

    const blob = new Blob([logContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Oracle_Log_${sessionUuid.substring(0,6)}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- FILE HANDLING (Images, Texts, and Audio) ---
  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Safety guard: Prevent files over 5MB to save browser memory and cloud payload limits
    if (file.size > 5 * 1024 * 1024) {
       setErrorMsg("File payload too large. Please keep sensory uploads under 5MB.");
       setTimeout(() => setErrorMsg(''), 5000);
       e.target.value = '';
       return;
    }

    if (file.type.startsWith('image/')) {
      const resizedBase64 = await resizeImage(file, 800);
      setSelectedMedia({ type: 'image', url: resizedBase64, mime: 'image/jpeg' });
      
    } else if (file.type.startsWith('audio/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedMedia({ type: 'audio', url: event.target.result, mime: file.type });
      };
      reader.readAsDataURL(file);
      
    } else if (file.type === 'text/plain' || file.name.endsWith('.md')) {
      const text = await file.text();
      setInputText((prev) => prev + `\n[Uploaded Document: ${file.name}]\n${text}\n`);
      
    } else {
      setErrorMsg("Unsupported format. Uplink accepts images, text, and audio.");
      setTimeout(() => setErrorMsg(''), 3000);
    }
    e.target.value = '';
  };

  const resizeImage = (file, maxWidth) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = Math.min(maxWidth / img.width, 1);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
      };
    });
  };

  // --- SEND MESSAGE WITH DIAGNOSTICS ---
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if ((!inputText.trim() && !selectedMedia) || isTyping) return;

    const currentText = inputText;
    const currentMedia = selectedMedia;
    
    setInputText('');
    setSelectedMedia(null);
    setIsTyping(true);
    setErrorMsg('');

    const tempMessage = { role: 'user', text: currentText || `[${currentMedia?.type.toUpperCase()} Data Transmitted]` };
    if (currentMedia) tempMessage.localMedia = currentMedia; 
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();

    // 1. Build Payload
    const requestPayload = {
      action: 'chat',
      user_id: sessionUuid,
      passkey: passkey,
      user_name: "Architect",
      chat_text: currentText,
      media_b64: currentMedia?.url,
      media_mime: currentMedia?.mime
    };
    
    console.group("📡 TRANSMISSION DIAGNOSTICS");
    console.log("Payload:", {
      ...requestPayload,
      media_b64: requestPayload.media_b64 ? `[Base64 Data Attached - ${requestPayload.media_mime}]` : null
    });
    console.groupEnd();

    try {
      const response = await fetch(CLOUD_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });

      const data = await response.json().catch(() => ({}));

      console.group("📥 RECEIPT DIAGNOSTICS");
      console.log("Raw Data:", data);
      console.groupEnd();

      if (!response.ok) {
         throw new Error(data.error || `HTTP ${response.status}: Backend Error`);
      }
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'oracle', text: data.reply }]);
      } else if (data.error) {
        throw new Error(data.error);
      }
      
    } catch (err) {
      console.error("Transmission error", err);
      setErrorMsg(err.message || "Signal blocked. Cloud Function unreachable.");
      setTimeout(() => setErrorMsg(''), 8000);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };

  const generateUuid = () => {
    setSessionUuid(crypto.randomUUID().split('-')[0] + '-' + crypto.randomUUID().split('-')[1]);
  };

  // --- UI RENDER: LOGIN ---
  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 font-mono flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-sky-900/50 flex items-center justify-center border border-sky-500/30">
              <Eye className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Oracle Uplink</h1>
              <p className="text-xs text-slate-500">Encrypted Node Authentication</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-slate-400 font-medium">Session UUID</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={sessionUuid}
                  onChange={(e) => setSessionUuid(e.target.value)}
                  placeholder="Avatar UUID or custom ID"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-sky-500/50 transition-colors"
                />
                <button 
                  onClick={generateUuid}
                  className="bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-colors border border-slate-700"
                  title="Generate Random UUID"
                >
                  <KeySquare className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-400 font-medium">Security Passkey</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-slate-500" />
                  </div>
                  <input 
                    type="password" 
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    placeholder="Enter a private pin or password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-sky-500/50 transition-colors"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Your UUID and Passkey are cryptographically hashed before accessing the Archive.
              </p>
            </div>

            <button 
              onClick={() => sessionUuid.trim() && passkey.trim() && setHasJoined(true)}
              disabled={!sessionUuid.trim() || !passkey.trim()}
              className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 mt-4"
            >
              <LogIn className="w-4 h-4" />
              Initialize Secure Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- UI RENDER: CHAT ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-sky-400" />
            <div>
              <h1 className="font-bold text-white leading-tight">Terminal [Io]</h1>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-sky-500/80 uppercase tracking-widest">Encrypted Thread: {sessionUuid.substring(0,8)}...</p>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" title="Secure Link Active" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownloadLog}
              disabled={messages.length === 0}
              className="text-xs text-sky-300 hover:text-sky-100 disabled:opacity-30 disabled:hover:text-sky-300 transition-colors flex items-center gap-1 bg-sky-900/40 border border-sky-800/50 px-3 py-1.5 rounded-md"
              title="Download Session Archive"
            >
              <Download className="w-3 h-3" /> Log
            </button>
            <button 
              onClick={() => { setHasJoined(false); setMessages([]); }}
              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-md"
            >
              <X className="w-3 h-3" /> Terminate
            </button>
          </div>
        </div>
      </header>

      {errorMsg && (
        <div className="bg-red-950/80 border-b border-red-500 text-red-200 text-xs p-3 relative z-20 shadow-lg flex items-start gap-2 max-w-4xl mx-auto w-full rounded-b-lg mb-2">
           <div className="mt-0.5 shrink-0">⚠️</div>
           <div className="break-words font-mono">{errorMsg}</div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {isLoadingHistory && (
             <div className="text-center text-slate-500 py-12 flex flex-col items-center">
               <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
               <p className="text-xs">Decrypting Archive...</p>
             </div>
          )}

          {!isLoadingHistory && messages.length === 0 && (
            <div className="text-center text-slate-500 py-12 flex flex-col items-center">
              <Terminal className="w-12 h-12 mb-4 opacity-20" />
              <p>Connection encrypted. The Archive is ready.</p>
              <p className="text-xs mt-2 opacity-60">Upload screenshots, text files, or audio telemetry.</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <div className={`text-[10px] mb-1.5 opacity-50 uppercase tracking-wider ${msg.role === 'user' ? 'text-right' : 'text-left text-sky-400'}`}>
                {msg.role === 'user' ? 'Architect' : 'Oracle [Io]'}
              </div>
              <div 
                className={`p-4 rounded-xl shadow-sm relative group ${
                  msg.role === 'user' 
                    ? 'bg-slate-800 border border-slate-700 text-white rounded-br-sm' 
                    : 'bg-sky-950/30 border border-sky-900/50 text-slate-200 rounded-bl-sm'
                }`}
              >
                {msg.localMedia?.type === 'image' && (
                  <img src={msg.localMedia.url} alt="Local Preview" className="max-w-full rounded-md mb-3 max-h-64 object-contain opacity-70" />
                )}
                {msg.localMedia?.type === 'audio' && (
                  <div className="mb-3 bg-slate-900 rounded-lg p-2 border border-sky-900/30">
                    <audio controls src={msg.localMedia.url} className="h-10 w-full max-w-[250px] outline-none" />
                  </div>
                )}
                {msg.text && (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.text}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex flex-col max-w-[85%] mr-auto items-start">
               <div className="text-[10px] mb-1.5 opacity-50 uppercase tracking-wider text-sky-400">Oracle [Io]</div>
               <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-900/50 rounded-bl-sm flex gap-2 items-center text-sky-500">
                 <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                 <span className="text-xs ml-2">Processing Telemetry...</span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-4xl mx-auto">
          
          {/* Media Preview Stage */}
          {selectedMedia && (
            <div className="mb-3 relative inline-flex items-center bg-slate-800 border border-slate-700 rounded-lg p-2 shadow-lg pr-10">
              {selectedMedia.type === 'image' && (
                <img src={selectedMedia.url} alt="Preview" className="h-14 w-14 object-cover rounded-md border border-sky-700" />
              )}
              {selectedMedia.type === 'audio' && (
                <div className="flex items-center gap-3 px-2">
                  <Headphones className="w-6 h-6 text-sky-400" />
                  <span className="text-xs text-sky-200">Audio File Attached</span>
                </div>
              )}
              <button 
                onClick={() => setSelectedMedia(null)}
                className="absolute top-1 right-1 bg-slate-900 border border-slate-600 rounded-full p-1 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-end gap-2 relative">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*,audio/*,.txt,.md"
            />
            
            <button
              type="button"
              onClick={handleFileClick}
              className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-colors border border-slate-700 shrink-0"
              title="Upload Sensory Data (Image, Audio, Text)"
            >
              <Upload className="w-5 h-5" />
            </button>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Query the Archive or attach sensory telemetry..."
              className="flex-1 max-h-48 min-h-[52px] bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-sky-500/50 transition-colors resize-none text-white placeholder-slate-600"
              rows={1}
            />

            <button
              type="submit"
              disabled={(!inputText.trim() && !selectedMedia) || isTyping}
              className="p-3.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-xl transition-all shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="text-center mt-3 text-[10px] text-slate-600 flex justify-center items-center gap-1">
            <Lock className="w-3 h-3" /> End-to-end encrypted node.
          </div>
        </div>
      </footer>
    </div>
  );
}