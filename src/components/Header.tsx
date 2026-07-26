import React from 'react';
import { Bot, Code2, Sparkles, User, LogOut, ChevronDown, Plus, ExternalLink } from 'lucide-react';
import { ChatbotConfig, TenantUser } from '../types';

interface HeaderProps {
  user: TenantUser | null;
  chatbots: ChatbotConfig[];
  selectedChatbot: ChatbotConfig | null;
  onSelectChatbot: (bot: ChatbotConfig) => void;
  onCreateChatbot: () => void;
  onOpenEmbedModal: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  chatbots,
  selectedChatbot,
  onSelectChatbot,
  onCreateChatbot,
  onOpenEmbedModal,
  onOpenAuth,
  onSignOut,
}) => {
  return (
    <header className="h-16 bg-[#0a0a0a] border-b border-zinc-800 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand Logo & Active Bot Selector */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-black shadow-sm">
            <Bot className="w-5 h-5 text-zinc-950" />
          </div>
          <div>
            <span className="font-medium text-white tracking-widest text-sm uppercase">OmniDesk AI</span>
            <span className="ml-2 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-zinc-900 text-zinc-400 rounded border border-zinc-800">
              SaaS Engine
            </span>
          </div>
        </div>

        {/* Active Chatbot Selector Dropdown */}
        {user && chatbots.length > 0 && (
          <div className="relative group">
            <div className="flex items-center gap-2 bg-[#0f0f0f] hover:bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 cursor-pointer transition">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="max-w-[140px] truncate">{selectedChatbot ? selectedChatbot.name : 'Select Bot'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </div>

            <div className="absolute top-full left-0 mt-1.5 w-56 bg-[#121212] border border-zinc-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 p-2">
              <div className="text-[10px] font-mono text-zinc-500 px-2 py-1 uppercase tracking-widest">
                Deployed AI Chatbots
              </div>
              {chatbots.map((bot) => (
                <button
                  key={bot.id}
                  onClick={() => onSelectChatbot(bot)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                    selectedChatbot?.id === bot.id
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                  }`}
                >
                  <span className="truncate">{bot.name}</span>
                  <div
                    className="w-2.5 h-2.5 rounded-full border border-zinc-700"
                    style={{ backgroundColor: bot.primaryColor || '#4F46E5' }}
                  />
                </button>
              ))}
              <div className="border-t border-zinc-800/80 my-1"></div>
              <button
                onClick={onCreateChatbot}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-400 hover:bg-zinc-800 flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Create New Chatbot
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons & User Profile */}
      <div className="flex items-center gap-3">
        {selectedChatbot && (
          <button
            onClick={onOpenEmbedModal}
            className="flex items-center gap-1.5 bg-zinc-100 hover:bg-white text-black px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider font-semibold transition shadow-sm"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Embed Widget</span>
          </button>
        )}

        {user ? (
          <div className="flex items-center gap-3 border-l border-zinc-800 pl-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white">{user.companyName || user.email}</div>
              <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{user.plan || 'pro'} Plan</div>
            </div>
            <button
              onClick={onSignOut}
              title="Sign Out"
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition border border-zinc-700"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </header>
  );
};
