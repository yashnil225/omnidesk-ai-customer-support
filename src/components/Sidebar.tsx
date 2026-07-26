import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  BookOpen, 
  Palette, 
  MessageSquare, 
  Code, 
  Globe, 
  BarChart3, 
  Settings,
  Sparkles
} from 'lucide-react';

export type NavTab = 'overview' | 'chatbots' | 'knowledge' | 'customizer' | 'inbox' | 'embed' | 'demosite';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, unreadCount = 0 }) => {
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chatbots', label: 'My Chatbots', icon: Bot },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen, badge: 'AI Train' },
    { id: 'customizer', label: 'Appearance & UI', icon: Palette },
    { id: 'inbox', label: 'Inbox & Live Chat', icon: MessageSquare, count: unreadCount },
    { id: 'embed', label: 'Embed & Export', icon: Code },
    { id: 'demosite', label: 'Website Live Demo', icon: Globe },
  ];

  return (
    <aside className="w-64 bg-[#0d0d0d] text-zinc-300 flex flex-col h-[calc(100vh-4rem)] sticky top-16 shrink-0 border-r border-zinc-800">
      <div className="p-4 border-b border-zinc-800/80">
        <div className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500">
          SaaS Workspace Navigation
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as NavTab)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-zinc-800 text-white border-l-2 border-emerald-500 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider bg-zinc-900 text-emerald-400 rounded border border-zinc-800">
                  {item.badge}
                </span>
              )}

              {item.count !== undefined && item.count > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500 text-black rounded-full">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Pro Plan Card */}
      <div className="p-4 m-3 bg-[#0f0f0f] border border-zinc-800 rounded-2xl space-y-1.5">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Gemini 3.6 Engine</span>
        </div>
        <p className="text-[11px] text-zinc-500 leading-snug">
          Train custom bots with PDFs, FAQs, & URLs. Deploy embeddable JS widgets.
        </p>
      </div>
    </aside>
  );
};
