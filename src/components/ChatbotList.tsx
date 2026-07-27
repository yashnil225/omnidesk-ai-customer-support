import React, { useState } from 'react';
import { 
  Bot, 
  Plus, 
  BookOpen, 
  Palette, 
  Code, 
  Play, 
  Trash2, 
  Check, 
  ExternalLink,
  Sparkles,
  Settings
} from 'lucide-react';
import { ChatbotConfig } from '../types';

interface ChatbotListProps {
  chatbots: ChatbotConfig[];
  selectedChatbot: ChatbotConfig | null;
  onSelectChatbot: (bot: ChatbotConfig) => void;
  onCreateChatbot: (newBot: Partial<ChatbotConfig>) => void;
  onDeleteChatbot?: (chatbotId: string) => void;
  onNavigateTab: (tab: any) => void;
  onOpenEmbedModal: (bot?: ChatbotConfig) => void;
}

export const ChatbotList: React.FC<ChatbotListProps> = ({
  chatbots,
  selectedChatbot,
  onSelectChatbot,
  onCreateChatbot,
  onDeleteChatbot,
  onNavigateTab,
  onOpenEmbedModal,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('👋 Hi there! How can I help you today?');
  const [primaryColor, setPrimaryColor] = useState('#4F46E5');
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateChatbot({
      name: name.trim(),
      welcomeMessage: welcomeMessage.trim(),
      primaryColor,
      position,
      suggestedPrompts: [
        'What products do you offer?',
        'How can I contact support?',
        'What is your return policy?'
      ],
      customSystemPrompt: 'You are an AI customer support bot assisting visitors. Be polite, clear, and helpful.',
      collectUserEmail: true,
      kbUrls: [],
      kbFaqs: [],
      kbDocs: []
    });

    setName('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My AI Chatbots</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Create, train, customize, and manage multi-tenant AI support agents.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-black px-4 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Chatbot</span>
        </button>
      </div>

      {/* Chatbots Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chatbots.map((bot) => {
          const isSelected = selectedChatbot?.id === bot.id;
          const totalKBItems = (bot.kbFaqs?.length || 0) + (bot.kbUrls?.length || 0) + (bot.kbDocs?.length || 0);

          return (
            <div
              key={bot.id}
              className={`bg-[#0f0f0f] rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-500/80 ring-1 ring-emerald-500/30 shadow-xl'
                  : 'border-zinc-800 hover:border-zinc-700 shadow-xs'
              }`}
            >
              <div className="p-6">
                {/* Top Badge & Selector */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                      style={{ backgroundColor: bot.primaryColor || '#4F46E5' }}
                    >
                      {bot.avatarUrl ? (
                        <img src={bot.avatarUrl} alt={bot.name} className="w-12 h-12 rounded-2xl object-cover" />
                      ) : (
                        <Bot className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{bot.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-xs text-zinc-400 capitalize">{bot.position}</span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="bg-emerald-950/80 text-emerald-400 text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded border border-emerald-800/60">
                      Active
                    </span>
                  )}
                  {onDeleteChatbot && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChatbot(bot.id);
                      }}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/50 rounded-lg transition"
                      title="Delete Chatbot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Welcome Message Preview */}
                <div className="p-3 bg-zinc-900 rounded-xl text-xs text-zinc-300 border border-zinc-800/80 line-clamp-2 italic mb-4">
                  "{bot.welcomeMessage}"
                </div>

                {/* Knowledge Base Stats */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                  <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <div className="font-bold text-white">{bot.kbFaqs?.length || 0}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">FAQs</div>
                  </div>
                  <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <div className="font-bold text-white">{bot.kbUrls?.length || 0}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">URLs</div>
                  </div>
                  <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <div className="font-bold text-white">{bot.kbDocs?.length || 0}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Docs</div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Footer */}
              <div className="bg-zinc-900/80 px-6 py-3.5 border-t border-zinc-800 flex items-center justify-between text-xs font-medium">
                <button
                  onClick={() => {
                    onSelectChatbot(bot);
                    onNavigateTab('knowledge');
                  }}
                  className="text-zinc-400 hover:text-white flex items-center gap-1 transition"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Train</span>
                </button>

                <button
                  onClick={() => {
                    onSelectChatbot(bot);
                    onNavigateTab('customizer');
                  }}
                  className="text-zinc-400 hover:text-white flex items-center gap-1 transition"
                >
                  <Palette className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Customize</span>
                </button>

                <button
                  onClick={() => {
                    onSelectChatbot(bot);
                    onOpenEmbedModal(bot);
                  }}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Embed Code</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Chatbot Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-800 text-zinc-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-400" />
                Create New AI Chatbot
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-500 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest mb-1">
                  Chatbot Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Sales Assistant"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-zinc-500 placeholder-zinc-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest mb-1">
                  Welcome Greeting
                </label>
                <textarea
                  rows={2}
                  required
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-zinc-500 placeholder-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest mb-1">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-xs font-mono text-zinc-400">{primaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest mb-1">
                    Screen Position
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
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider bg-zinc-100 text-black hover:bg-white shadow-sm"
                >
                  Create Chatbot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
