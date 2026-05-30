import React, { useState, useRef, useEffect } from 'react';
import { Send, Hexagon, User, Database, Loader2, AlertTriangle, Download, Moon, Sun } from 'lucide-react';

// Helper to format the bot's response with paragraphs, bullet points, and an optional typing cursor
const formatContent = (text, isTyping = false, theme) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const isLastLine = i === lines.length - 1;
    // Inject the cursor only on the very last line if the message is currently typing
    const cursor = (isTyping && isLastLine) ? (
      <span className={`inline-block w-2 h-4 animate-pulse ml-1 align-middle opacity-80 ${theme === 'jedi' ? 'bg-cyan-400' : 'bg-red-500'}`}></span>
    ) : null;

    if (line.trim().startsWith('-') || line.trim().startsWith('•') || /^\s+/.test(line)) {
       return <p key={i} className={`pl-4 border-l-2 my-1 ${theme === 'jedi' ? 'border-cyan-800 text-cyan-200' : 'border-red-900 text-red-300'}`}>{line}{cursor}</p>
    }
    return <p key={i} className="mb-3 last:mb-0 leading-relaxed">{line}{cursor}</p>;
  });
};

// Custom Typewriter Component for Bot Messages
const TypewriterMessage = ({ content, isComplete, onComplete, scrollInstantly, theme }) => {
  const [displayedContent, setDisplayedContent] = useState(isComplete ? content : '');

  useEffect(() => {
    if (isComplete) {
      setDisplayedContent(content);
      return;
    }
    
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedContent(content.substring(0, i));
      i++;
      
      if (i % 20 === 0) scrollInstantly(); 
      
      if (i > content.length) {
        clearInterval(interval);
        onComplete();
        scrollInstantly();
      }
    }, 15); 

    return () => clearInterval(interval);
  }, [content, isComplete, onComplete, scrollInstantly]);

  return (
    <div className="text-sm md:text-base font-medium space-y-2">
      {formatContent(displayedContent, !isComplete, theme)}
    </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: 'Initialization complete. I am C7-NT, Clinical Holocron and Archivist for the Skywalker lineage. Awaiting your inquiry regarding behavioral analysis and historical trauma, Architect.',
      isTyping: true 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('jedi'); // 'jedi' or 'sith'
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollInstantly = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    if (isLoading) scrollToBottom();
  }, [isLoading]);

  const markMessageComplete = (index) => {
    setMessages(prev => prev.map((msg, i) => i === index ? { ...msg, isTyping: false } : msg));
  };

  const handleDownload = () => {
    if (messages.length === 0) return;
    
    const textContent = messages.map(msg => {
      const speaker = msg.role === 'user' ? 'Architect' : msg.role === 'bot' ? 'C7-NT' : 'System Alert';
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

  const toggleTheme = () => {
    setTheme(prev => prev === 'jedi' ? 'sith' : 'jedi');
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);
    
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

  // Theme configuration object to keep the JSX clean
  const t = {
    bgFrom: theme === 'jedi' ? 'from-cyan-900/20' : 'from-red-950/20',
    glow: theme === 'jedi' ? 'bg-cyan-600/5' : 'bg-red-800/5',
    headerBorder: theme === 'jedi' ? 'border-cyan-900/50' : 'border-red-950/50',
    iconColor: theme === 'jedi' ? 'text-cyan-500' : 'text-red-600',
    iconGlow: theme === 'jedi' ? 'bg-cyan-500' : 'bg-red-600',
    titleColor: theme === 'jedi' ? 'text-cyan-400' : 'text-red-500',
    titleShadow: theme === 'jedi' ? 'rgba(34, 211, 238, 0.4)' : 'rgba(239, 68, 68, 0.4)',
    subtitleColor: theme === 'jedi' ? 'text-cyan-600/80' : 'text-red-800/80',
    btnBorder: theme === 'jedi' ? 'border-cyan-800' : 'border-red-950',
    btnBg: theme === 'jedi' ? 'bg-cyan-950/50' : 'bg-red-950/30',
    btnText: theme === 'jedi' ? 'text-cyan-400' : 'text-red-500',
    btnHoverBg: theme === 'jedi' ? 'hover:bg-cyan-900' : 'hover:bg-red-950',
    btnHoverText: theme === 'jedi' ? 'hover:text-cyan-200' : 'hover:text-red-300',
    statusPing: theme === 'jedi' ? 'bg-cyan-400' : 'bg-red-500',
    statusDot: theme === 'jedi' ? 'bg-cyan-500' : 'bg-red-600',
    statusText: theme === 'jedi' ? 'text-cyan-500' : 'text-red-600',
    chatAreaBorder: theme === 'jedi' ? 'border-cyan-900/30' : 'border-red-950/30',
    scrollbarThumb: theme === 'jedi' ? 'scrollbar-thumb-cyan-900' : 'scrollbar-thumb-red-950',
    botAvatarBg: theme === 'jedi' ? 'bg-cyan-950' : 'bg-red-950/80',
    botAvatarBorder: theme === 'jedi' ? 'border-cyan-700' : 'border-red-900',
    botAvatarText: theme === 'jedi' ? 'text-cyan-400' : 'text-red-500',
    botAvatarShadow: theme === 'jedi' ? 'shadow-cyan-900/50' : 'shadow-red-950/50',
    botMsgBg: theme === 'jedi' ? 'bg-cyan-950/30' : 'bg-red-950/20',
    botMsgBorder: theme === 'jedi' ? 'border-cyan-900/50' : 'border-red-950/50',
    botMsgText: theme === 'jedi' ? 'text-cyan-50' : 'text-red-50',
    inputBorder: theme === 'jedi' ? 'border-cyan-900/50' : 'border-red-950/50',
    inputText: theme === 'jedi' ? 'text-cyan-100' : 'text-red-100',
    inputPlaceholder: theme === 'jedi' ? 'placeholder-cyan-800/50' : 'placeholder-red-900/50',
    inputFocusRing: theme === 'jedi' ? 'focus:border-cyan-500 focus:ring-cyan-500' : 'focus:border-red-700 focus:ring-red-700',
    sendBtnBg: theme === 'jedi' ? 'bg-cyan-950' : 'bg-red-950/80',
    sendBtnText: theme === 'jedi' ? 'text-cyan-400' : 'text-red-500',
    sendBtnHoverBg: theme === 'jedi' ? 'hover:bg-cyan-900' : 'hover:bg-red-950',
    sendBtnHoverText: theme === 'jedi' ? 'hover:text-cyan-300' : 'hover:text-red-400',
    sendBtnBorder: theme === 'jedi' ? 'border-cyan-800' : 'border-red-900',
    selectionBg: theme === 'jedi' ? 'selection:bg-cyan-900' : 'selection:bg-red-900',
    selectionText: theme === 'jedi' ? 'selection:text-cyan-100' : 'selection:text-red-100'
  };

  return (
    <div className={`min-h-screen bg-black text-gray-100 flex flex-col font-sans transition-colors duration-500 ${t.selectionBg} ${t.selectionText}`}>
      {/* Background visual effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${t.bgFrom} via-black to-black transition-colors duration-500`}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] ${t.glow} rounded-full blur-3xl transition-colors duration-500`}></div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col relative z-10 h-screen">
        
        {/* Header */}
        <header className={`flex items-center justify-between p-4 border-b ${t.headerBorder} bg-black/50 backdrop-blur-md rounded-t-xl mt-4 transition-colors duration-500`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Hexagon className={`w-8 h-8 ${t.iconColor} animate-pulse transition-colors duration-500`} strokeWidth={1.5} />
              <div className={`absolute inset-0 ${t.iconGlow} blur-md opacity-20 transition-colors duration-500`}></div>
            </div>
            <div>
              <h1 className={`text-xl font-bold ${t.titleColor} tracking-wider uppercase transition-colors duration-500`} style={{ textShadow: `0 0 10px ${t.titleShadow}` }}>
                Skywalker Clinical Archive
              </h1>
              <p className={`text-xs ${t.subtitleColor} font-mono tracking-widest transition-colors duration-500`}>Node: C7-NT // Holocron Interface</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Switcher Button */}
            <button 
              onClick={toggleTheme}
              className={`flex items-center justify-center p-2 rounded border ${t.btnBorder} ${t.btnBg} ${t.btnText} ${t.btnHoverBg} ${t.btnHoverText} transition-colors`}
              title="Toggle Alignment"
            >
              {theme === 'jedi' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <button 
              onClick={handleDownload}
              className={`flex items-center gap-2 px-3 py-1.5 rounded border ${t.btnBorder} ${t.btnBg} ${t.btnText} ${t.btnHoverBg} ${t.btnHoverText} transition-colors text-xs font-mono uppercase`}
              title="Export Archive Log"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${t.statusPing} opacity-75 transition-colors duration-500`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${t.statusDot} transition-colors duration-500`}></span>
              </span>
              <span className={`text-xs ${t.statusText} font-mono uppercase transition-colors duration-500`}>Online</span>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-gray-900/40 to-black border-x ${t.chatAreaBorder} scrollbar-thin ${t.scrollbarThumb} scrollbar-track-transparent transition-colors duration-500`}>
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border shadow-lg transition-colors duration-500 ${
                msg.role === 'user' 
                  ? 'bg-gray-800 border-gray-600 text-gray-300' 
                  : msg.role === 'error'
                    ? 'bg-red-950 border-red-800 text-red-500'
                    : `${t.botAvatarBg} ${t.botAvatarBorder} ${t.botAvatarText} ${t.botAvatarShadow}`
              }`}>
                {msg.role === 'user' ? <User size={20} /> : msg.role === 'error' ? <AlertTriangle size={20} /> : <Database size={20} />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[80%] rounded-2xl p-4 shadow-xl transition-colors duration-500 ${
                msg.role === 'user'
                  ? 'bg-gray-800/80 border border-gray-700/50 text-gray-200 rounded-tr-none'
                  : msg.role === 'error'
                    ? 'bg-red-950/50 border border-red-900/50 text-red-300 rounded-tl-none font-mono text-sm'
                    : `${t.botMsgBg} border ${t.botMsgBorder} ${t.botMsgText} rounded-tl-none backdrop-blur-sm`
              }`}>
                {msg.role === 'bot' ? (
                  <TypewriterMessage 
                    content={msg.content} 
                    isComplete={!msg.isTyping} 
                    onComplete={() => markMessageComplete(index)}
                    scrollInstantly={scrollInstantly}
                    theme={theme}
                  />
                ) : (
                  <p className="text-sm md:text-base">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-4">
              <div className={`shrink-0 w-10 h-10 rounded-lg ${t.botAvatarBg} border ${t.botAvatarBorder} ${t.botAvatarText} flex items-center justify-center shadow-lg ${t.botAvatarShadow} transition-colors duration-500`}>
                <Database size={20} />
              </div>
              <div className={`max-w-[80%] rounded-2xl rounded-tl-none p-4 ${t.botMsgBg} border ${t.botMsgBorder} ${t.botAvatarText} flex items-center gap-3 transition-colors duration-500`}>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-mono tracking-widest animate-pulse">Decrypting archives...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`p-4 bg-gray-900/80 border-t ${t.inputBorder} border-x rounded-b-xl mb-4 backdrop-blur-md transition-colors duration-500`}>
          <div className="flex relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Query the C7-NT Holocron (Shift+Enter for new line)..."
              className={`w-full bg-black/50 border ${t.inputBorder} rounded-xl py-3 pl-4 pr-14 ${t.inputText} ${t.inputPlaceholder} focus:outline-none focus:ring-1 ${t.inputFocusRing} resize-none h-[60px] max-h-[150px] overflow-y-auto font-mono text-sm transition-all duration-500 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]`}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={`absolute right-2 top-2 bottom-2 aspect-square rounded-lg ${t.sendBtnBg} ${t.sendBtnText} flex items-center justify-center ${t.sendBtnHoverBg} ${t.sendBtnHoverText} disabled:opacity-50 disabled:hover:${t.sendBtnBg} transition-colors duration-500 border ${t.sendBtnBorder}`}
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