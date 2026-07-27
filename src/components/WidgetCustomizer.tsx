import React, { useState } from 'react';
import { 
  Palette, 
  Send, 
  Bot, 
  Sparkles, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  MessageSquare,
  RefreshCw,
  User
} from 'lucide-react';
import { ChatbotConfig, Message } from '../types';

interface WidgetCustomizerProps {
  chatbot: ChatbotConfig | null;
  onUpdateChatbot: (updatedBot: ChatbotConfig) => void;
}

export const WidgetCustomizer: React.FC<WidgetCustomizerProps> = ({
  chatbot,
  onUpdateChatbot,
}) => {
  if (!chatbot) {
    return (
      <div className="text-center py-12 bg-[#0f0f0f] rounded-2xl border border-zinc-800">
        <p className="text-zinc-500">Please select or create a chatbot first to customize appearance.</p>
      </div>
    );
  }

  // Form states initialized from chatbot prop
  const [name, setName] = useState(chatbot.name);
  const [welcomeMessage, setWelcomeMessage] = useState(chatbot.welcomeMessage);
  const [primaryColor, setPrimaryColor] = useState(chatbot.primaryColor || '#4F46E5');
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left'>(chatbot.position || 'bottom-right');
  const [avatarUrl, setAvatarUrl] = useState(chatbot.avatarUrl || '');
  const [prompts, setPrompts] = useState<string[]>(chatbot.suggestedPrompts || []);
  const [newPromptText, setNewPromptText] = useState('');
  const [collectEmail, setCollectEmail] = useState(chatbot.collectUserEmail ?? true);

  // Live Test Chat Messages inside Preview
  const [previewMessages, setPreviewMessages] = useState<Message[]>([
    {
      id: 'prev_1',
      conversationId: 'prev_conv',
      chatbotId: chatbot.id,
      tenantId: chatbot.tenantId,
      sender: 'bot',
      text: welcomeMessage,
      createdAt: new Date().toISOString(),
    },
  ]);
  const [testInputText, setTestInputText] = useState('');
  const [isTestTyping, setIsTestTyping] = useState(false);

  const [isSaved, setIsSaved] = useState(false);

  const colorPresets = ['#4F46E5', '#2563EB', '#0D9488', '#059669', '#7C3AED', '#DB2777', '#111827'];

  const handleSave = () => {
    const updated: ChatbotConfig = {
      ...chatbot,
      name,
      welcomeMessage,
      primaryColor,
      position,
      avatarUrl,
      suggestedPrompts: prompts,
      collectUserEmail: collectEmail,
    };
    onUpdateChatbot(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAddPrompt = () => {
    if (!newPromptText.trim()) return;
    setPrompts([...prompts, newPromptText.trim()]);
    setNewPromptText('');
  };

  const handleRemovePrompt = (indexToRemove: number) => {
    setPrompts((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  // Interactive Test Chat Handler
  const handleSendTestMessage = async (textToSend?: string) => {
    const text = textToSend || testInputText;
    if (!text || !text.trim()) return;

    const userMsg: Message = {
      id: 'test_u_' + Date.now(),
      conversationId: 'test_conv',
      chatbotId: chatbot.id,
      tenantId: chatbot.tenantId,
      sender: 'user',
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setPreviewMessages((prev) => [...prev, userMsg]);
    setTestInputText('');
    setIsTestTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbotId: chatbot.id,
          conversationId: 'test_conv',
          messages: [...previewMessages, userMsg],
        }),
      });

      const data = await res.json();
      setIsTestTyping(false);

      const botMsg: Message = {
        id: 'test_b_' + Date.now(),
        conversationId: 'test_conv',
        chatbotId: chatbot.id,
        tenantId: chatbot.tenantId,
        sender: 'bot',
        text: data.text || 'Thank you for testing! How else can I assist you?',
        createdAt: new Date().toISOString(),
      };

      setPreviewMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setIsTestTyping(false);
      setPreviewMessages((prev) => [
        ...prev,
        {
          id: 'test_err_' + Date.now(),
          conversationId: 'test_conv',
          chatbotId: chatbot.id,
          tenantId: chatbot.tenantId,
          sender: 'bot',
          text: 'Local test connection error.',
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  const handleResetTestChat = () => {
    setPreviewMessages([
      {
        id: 'prev_' + Date.now(),
        conversationId: 'prev_conv',
        chatbotId: chatbot.id,
        tenantId: chatbot.tenantId,
        sender: 'bot',
        text: welcomeMessage,
        createdAt: new Date().toISOString(),
      },
    ]);
    setTestInputText('');
    setIsTestTyping(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - Fully Responsive */}
      <div className="bg-[#0f0f0f] p-6 rounded-2xl border border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-mono font-semibold uppercase tracking-widest mb-1">
            <Palette className="w-4 h-4" />
            Widget Appearance & Branding
          </div>
          <h1 className="text-xl font-bold text-white">
            Customize Widget for <span className="text-emerald-400">{name}</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Modify brand colors, position, greetings, and test the widget live in real-time.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-xs transition whitespace-nowrap shrink-0 ${
            isSaved
              ? 'bg-emerald-600 text-white'
              : 'bg-zinc-100 hover:bg-white text-black'
          }`}
        >
          {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'Saved Customizations!' : 'Save Customizations'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Customization Controls (7 cols) */}
        <div className="lg:col-span-7 bg-[#0f0f0f] p-6 rounded-2xl border border-zinc-800 shadow-xs space-y-6 text-zinc-300">
          <h2 className="font-bold text-white text-base border-b border-zinc-800 pb-3">
            Branding & Widget Options
          </h2>

          <div className="space-y-4">
            {/* Bot Name */}
            <div>
              <label className="block text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-zinc-500"
              />
            </div>

            {/* Welcome Greeting */}
            <div>
              <label className="block text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest mb-1">
                Welcome Message
              </label>
              <textarea
                rows={2}
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-zinc-500"
              />
            </div>

            {/* Brand Color Picker */}
            <div>
              <label className="block text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-28 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 font-mono text-xs uppercase text-zinc-200"
                />

                <div className="flex items-center gap-1.5 ml-2 overflow-x-auto py-1">
                  {colorPresets.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setPrimaryColor(hex)}
                      className={`w-6 h-6 rounded-full border transition-transform shrink-0 ${
                        primaryColor.toLowerCase() === hex.toLowerCase() ? 'scale-125 ring-2 ring-emerald-400' : ''
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Position & Avatar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest mb-1">
                  Widget Screen Position
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs focus:outline-none focus:border-zinc-500"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest mb-1">
                  Avatar Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-zinc-500 placeholder-zinc-500"
                />
              </div>
            </div>

            {/* Suggested Prompts / Quick Questions */}
            <div>
              <label className="block text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest mb-1">
                Suggested Quick Questions
              </label>
              <div className="space-y-2 mb-2">
                {prompts.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-zinc-900 rounded-xl border border-zinc-800 text-xs text-zinc-300">
                    <span className="truncate pr-2">{p}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePrompt(idx)}
                      title="Delete question"
                      className="text-zinc-500 hover:text-red-400 p-1 transition shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a quick question prompt..."
                  value={newPromptText}
                  onChange={(e) => setNewPromptText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPrompt()}
                  className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-zinc-500 placeholder-zinc-500"
                />
                <button
                  type="button"
                  onClick={handleAddPrompt}
                  className="bg-zinc-100 hover:bg-white text-black text-xs font-semibold uppercase tracking-wider px-3.5 py-2 rounded-xl flex items-center gap-1 shrink-0 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Live Chat Test Canvas (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Interactive Live Widget Preview
            </h2>
            <button
              type="button"
              onClick={handleResetTestChat}
              title="Reset Test Chat"
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1 rounded-lg transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" /> <span>Reset Chat</span>
            </button>
          </div>

          {/* Rendered Widget Frame */}
          <div className="bg-black/60 rounded-3xl p-6 border border-zinc-800 shadow-inner flex flex-col items-center justify-center min-h-[560px] relative overflow-hidden">
            <div className="text-[10px] font-mono text-zinc-500 absolute top-3 left-4 uppercase tracking-widest">
              Target Website Canvas Preview
            </div>

            {/* Floating Widget Window */}
            <div className="w-full max-w-[360px] bg-[#121212] rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col h-[500px] z-10 animate-in fade-in duration-200">
              {/* Widget Header */}
              <div 
                className="p-4 text-white flex items-center justify-between"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={name} className="w-9 h-9 rounded-full object-cover border border-white/20" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                      {name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-sm leading-tight">{name}</div>
                    <div className="text-[10px] text-white/80">⚡ 24x7 Support Online</div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 bg-zinc-950/80 overflow-y-auto space-y-3">
                {previewMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'ml-auto text-white rounded-br-xs'
                        : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-xs shadow-2xs'
                    }`}
                    style={m.sender === 'user' ? { backgroundColor: primaryColor } : {}}
                  >
                    {m.text}
                  </div>
                ))}

                {/* Suggested Prompt Pills */}
                {previewMessages.length <= 1 && prompts.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {prompts.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendTestMessage(p)}
                        className="text-[11px] px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border rounded-full transition text-left"
                        style={{ color: primaryColor, borderColor: primaryColor }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}

                {/* Typing Indicator */}
                {isTestTyping && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-3 py-2 w-fit text-xs text-zinc-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce delay-200"></span>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-3 bg-[#121212] border-t border-zinc-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a test message..."
                  value={testInputText}
                  onChange={(e) => setTestInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendTestMessage()}
                  className="flex-1 bg-zinc-900 border border-zinc-800 text-white rounded-full px-3.5 py-1.5 text-xs focus:outline-none placeholder-zinc-500"
                />
                <button
                  onClick={() => handleSendTestMessage()}
                  className="w-8 h-8 rounded-full text-white flex items-center justify-center shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-[#121212] text-[10px] text-zinc-500 text-center py-1 border-t border-zinc-800/80">
                Powered by <strong>OmniDesk AI</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
