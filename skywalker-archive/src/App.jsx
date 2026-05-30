import React, { useState, useRef, useEffect } from 'react';
import { Send, Hexagon, User, Database, Loader2, AlertTriangle, Download } from 'lucide-react';

// Helper to format the bot's response with paragraphs, bullet points, and an optional typing cursor
const formatContent = (text, isTyping = false) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const isLastLine = i === lines.length - 1;
    // Inject the cursor only on the very last line if the message is currently typing
    const cursor = (isTyping && isLastLine) ? (
      <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-1 align-middle opacity-80"></span>
    ) : null;

    if (line.trim().startsWith('-') || line.trim().startsWith('•') || /^\s+/.test(line)) {
       return <p key={i} className="pl-4 border-l-2 border-cyan-800 my-1 text-cyan-200">{line}{cursor}</p>
    }
    return <p key={i} className="mb-3 last:mb-0 leading-relaxed">{line}{cursor}</p>;
  });
};

// Custom Typewriter Component for Bot Messages
const TypewriterMessage = ({ content, isComplete, onComplete, scrollInstantly }) => {
  const [displayedContent, setDisplayedContent] = useState(isComplete ? content : '');

  useEffect(() => {
    // If the message is marked complete, show it entirely (e.g., historical messages)
    if (isComplete) {
      setDisplayedContent(content);
      return;
    }
    
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedContent(content.substring(0, i));
      i++;
      
      // Auto-scroll to keep the cursor in view without jittering the smooth scroll
      if (i % 20 === 0) scrollInstantly(); 
      
      if (i > content.length) {
        clearInterval(interval);
        onComplete();
        scrollInstantly();
      }
    }, 15); // Decryption speed (ms per character)

    return () => clearInterval(interval);
  }, [content, isComplete, onComplete, scrollInstantly]);

  return (
    <div className="text-sm md:text-base font-medium space-y-2">
      {formatContent(displayedContent, !isComplete)}
    </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: 'Initialization complete. I am C7-NT, Clinical Holocron and Archivist for the Skywalker lineage. Awaiting your inquiry regarding behavioral analysis and historical trauma, Architect.',
      isTyping: true // Trigger typing animation on load
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Smooth scroll for new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Instant scroll for typewriter tracking
  const scrollInstantly = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    if (isLoading) scrollToBottom();
  }, [isLoading]);

  // Mark a specific message as fully typed out
  const markMessageComplete = (index) => {
    setMessages(prev => prev.map((msg, i) => i === index ? { ...msg, isTyping: false } : msg));
  };

  const handleDownload = () => {
    if (messages.length === 0) return;
    
    const textContent = messages.map(msg => {
      const speaker = msg.role === 'user' ? 'Architect' : msg.role === 'bot' ? 'C7-NT' : 'System Alert';
      // We export msg.content (the full text), not the partially typed state!
      return `[${speaker}]:\n${msg.content}\n`;
    }).join('\n');

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Skywalker_Clinical_Archive_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('https://us-central1-skywalker-archive.cloudfunctions.net/skywalker-clinical-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'chat',
          chat_text: userMessage,
          user_name: 'Architect',
          user_id: 'HolocronUI_Node',
          passkey: '1138'
        }) 
      });

      if (!response.ok) {
        throw new Error(`Holocron network error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const botReply = data.reply || data.response || data.text || "Error: Malformed data core response.";
      
      // Add the bot's reply and flag it for the typing animation
      setMessages(prev => [...prev, { role: 'bot', content: botReply, isTyping: true }]);
    } catch (err) {
      console.error("API Connection Error:", err);
      setError(err.message || "Failed to establish connection with the central archive.");
      setMessages(prev => [...prev, { 
        role: 'error', 
        content: `Connection failed. Please ensure the Cloud Function is deployed and CORS is configured for https://lxdangerdoll.github.io. Details: ${err.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col font-sans selection:bg-cyan-900 selection:text-cyan-100">
      {/* Background visual effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col relative z-10 h-screen">
        
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-cyan-900/50 bg-black/50 backdrop-blur-md rounded-t-xl mt-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Hexagon className="w-8 h-8 text-cyan-500 animate-pulse" strokeWidth={1.5} />
              <div className="absolute inset-0 bg-cyan-500 blur-md opacity-20"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-cyan-400 tracking-wider uppercase" style={{ textShadow: '0 0 10px rgba(34, 211, 238, 0.4)' }}>
                Skywalker Clinical Archive
              </h1>
              <p className="text-xs text-cyan-600/80 font-mono tracking-widest">Node: C7-NT // Holocron Interface</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-1.5 rounded border border-cyan-800 bg-cyan-950/50 text-cyan-400 hover:bg-cyan-900 hover:text-cyan-200 transition-colors text-xs font-mono uppercase"
              title="Export Archive Log"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <span className="text-xs text-cyan-500 font-mono uppercase">Online</span>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-gray-900/40 to-black border-x border-cyan-900/30 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-gray-800 border-gray-600 text-gray-300' 
                  : msg.role === 'error'
                    ? 'bg-red-950 border-red-800 text-red-500'
                    : 'bg-cyan-950 border-cyan-700 text-cyan-400 shadow-cyan-900/50'
              }`}>
                {msg.role === 'user' ? <User size={20} /> : msg.role === 'error' ? <AlertTriangle size={20} /> : <Database size={20} />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[80%] rounded-2xl p-4 shadow-xl ${
                msg.role === 'user'
                  ? 'bg-gray-800/80 border border-gray-700/50 text-gray-200 rounded-tr-none'
                  : msg.role === 'error'
                    ? 'bg-red-950/50 border border-red-900/50 text-red-300 rounded-tl-none font-mono text-sm'
                    : 'bg-cyan-950/30 border border-cyan-900/50 text-cyan-50 rounded-tl-none backdrop-blur-sm'
              }`}>
                {msg.role === 'bot' ? (
                  <TypewriterMessage 
                    content={msg.content} 
                    isComplete={!msg.isTyping} 
                    onComplete={() => markMessageComplete(index)}
                    scrollInstantly={scrollInstantly}
                  />
                ) : (
                  <p className="text-sm md:text-base">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-900/50">
                <Database size={20} />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-none p-4 bg-cyan-950/30 border border-cyan-900/50 text-cyan-500 flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-mono tracking-widest animate-pulse">Decrypting archives...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-900/80 border-t border-cyan-900/50 border-x rounded-b-xl mb-4 backdrop-blur-md">
          <div className="flex relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Query the C7-NT Holocron (Shift+Enter for new line)..."
              className="w-full bg-black/50 border border-cyan-900/50 rounded-xl py-3 pl-4 pr-14 text-cyan-100 placeholder-cyan-800/50 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none h-[60px] max-h-[150px] overflow-y-auto font-mono text-sm transition-all shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center hover:bg-cyan-900 hover:text-cyan-300 disabled:opacity-50 disabled:hover:bg-cyan-950 transition-colors border border-cyan-800"
            >
              <Send size={18} className={isLoading ? "opacity-0" : "opacity-100"} />
              {isLoading && <Loader2 size={18} className="absolute animate-spin" />}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-xs text-red-500 font-mono">
              System Alert: API connection disrupted. Check console logs.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}