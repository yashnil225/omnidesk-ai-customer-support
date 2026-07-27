import React, { useState } from 'react';
import { Globe, ArrowLeft, Send, Sparkles, Bot, Shield, CheckCircle, RefreshCw } from 'lucide-react';
import { ChatbotConfig } from '../types';

interface DemoWebsitePreviewProps {
  chatbot: ChatbotConfig | null;
  onBackToDashboard: () => void;
}

export const DemoWebsitePreview: React.FC<DemoWebsitePreviewProps> = ({ chatbot, onBackToDashboard }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: chatbot?.welcomeMessage || '👋 Hello! Welcome to Apex Cloud. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const primaryColor = chatbot?.primaryColor || '#4F46E5';

  const handleResetChat = () => {
    setMessages([
      {
        sender: 'bot',
        text: chatbot?.welcomeMessage || '👋 Hello! Welcome to Apex Cloud. How can I help you today?',
      },
    ]);
    setInput('');
    setIsTyping(false);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbotId: chatbot?.id || 'bot_demo_101',
          messages: [...messages, { sender: 'user', text }],
        }),
      });

      const data = await res.json();
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: data.text || 'How else can I assist you with Apex Cloud?' },
      ]);
    } catch (err) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Connection issue. Please try again!' },
      ]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#0f0f0f] text-white p-4 rounded-2xl flex items-center justify-between shadow-md border border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-2 hover:bg-zinc-900 rounded-xl text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-[10px] text-emerald-400 font-mono font-semibold uppercase tracking-widest">
              Website Integration Test Simulation
            </div>
            <div className="font-bold text-sm text-white">
              Live Preview: Chatbot Widget Embedded on Client Website (Apex Cloud)
            </div>
          </div>
        </div>

        <div className="text-xs bg-emerald-950/80 text-emerald-400 px-3 py-1 rounded-full border border-emerald-800/60 font-mono font-medium">
          ● JavaScript Widget Loaded
        </div>
      </div>

      {/* Mock Client Website Container */}
      <div className="bg-[#0a0a0a] rounded-3xl border border-zinc-800 shadow-xl overflow-hidden min-h-[640px] relative flex flex-col">
        {/* Fake Browser Top Address Bar */}
        <div className="bg-[#0f0f0f] px-4 py-2.5 border-b border-zinc-800 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-zinc-700"></span>
            <span className="w-3 h-3 rounded-full bg-zinc-700"></span>
            <span className="w-3 h-3 rounded-full bg-zinc-700"></span>
          </div>

          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1 text-xs text-zinc-400 flex items-center justify-between font-mono">
            <input 
              type="url" 
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              placeholder="https://yourwebsite.com (Press Enter)" 
              className="bg-transparent border-none outline-none flex-1 text-zinc-300 placeholder-zinc-600 w-full"
            />
            <Globe className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          </div>
        </div>

        {/* Dynamic Iframe or Mock Landing Page Content */}
        {previewUrl ? (
          <iframe src={previewUrl} className="w-full flex-1 border-0 bg-white" title="Live Preview" />
        ) : (
          <div className="p-10 max-w-4xl mx-auto space-y-12 my-auto flex-1">
            <div className="text-center space-y-4">
              <span className="px-3 py-1 bg-zinc-900 text-emerald-400 text-xs font-mono font-semibold rounded-full border border-zinc-800">
                Next Generation Cloud Infrastructure
              </span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
                Scale Your Cloud Infrastructure with Zero Friction
              </h1>
              <p className="text-base text-zinc-400 max-w-2xl mx-auto">
                Apex Cloud provides high-speed compute instances, global CDN caching, and enterprise security for modern SaaS applications.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="p-6 bg-[#0f0f0f] rounded-2xl border border-zinc-800/80 space-y-2">
                <Shield className="w-6 h-6 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">SOC2 Security</h3>
                <p className="text-xs text-zinc-400">Enterprise grade end-to-end data encryption at rest.</p>
              </div>
              <div className="p-6 bg-[#0f0f0f] rounded-2xl border border-zinc-800/80 space-y-2">
                <Sparkles className="w-6 h-6 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">99.99% Uptime</h3>
                <p className="text-xs text-zinc-400">Global edge nodes across 40 regions worldwide.</p>
              </div>
              <div className="p-6 bg-[#0f0f0f] rounded-2xl border border-zinc-800/80 space-y-2">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">24/7 AI Concierge</h3>
                <p className="text-xs text-zinc-400">Instant customer support powered by OmniDesk AI.</p>
              </div>
            </div>
          </div>
        )}

        {/* EMBEDDED WIDGET (Simulated JS widget) */}
        <div
          className={`fixed bottom-8 ${
            chatbot?.position === 'bottom-left' ? 'left-8' : 'right-8'
          } z-50 flex flex-col items-end`}
        >
          {isOpen && (
            <div className="w-[380px] h-[520px] bg-[#0f0f0f] rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col mb-4 animate-in slide-in-from-bottom duration-200">
              {/* Widget Header */}
              <div className="p-4 text-white flex items-center justify-between" style={{ backgroundColor: primaryColor }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                    {chatbot?.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <div className="font-bold text-sm leading-tight">{chatbot?.name || 'Support Bot'}</div>
                    <div className="text-[10px] text-white/80 font-mono">⚡ 24x7 Support Online</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetChat}
                    title="Reset Chat Thread"
                    className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white text-sm font-bold p-1">
                    ✕
                  </button>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-4 bg-black/60 overflow-y-auto space-y-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'ml-auto text-white rounded-br-xs'
                        : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-xs'
                    }`}
                    style={m.sender === 'user' ? { backgroundColor: primaryColor } : {}}
                  >
                    {m.text}
                  </div>
                ))}

                {isTyping && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-3 py-2 w-fit text-xs text-zinc-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce delay-200"></span>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-3 bg-[#0f0f0f] border-t border-zinc-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-zinc-900 border border-zinc-700 text-white rounded-full px-3.5 py-1.5 text-xs focus:outline-none placeholder-zinc-500"
                />
                <button
                  onClick={() => handleSendMessage()}
                  className="w-8 h-8 rounded-full text-white flex items-center justify-center shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Widget Launcher Floating Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center hover:scale-105 transition duration-150"
            style={{ backgroundColor: primaryColor }}
          >
            <Bot className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
};
