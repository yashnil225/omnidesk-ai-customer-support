import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  ExternalLink, 
  Globe, 
  Layers, 
  Sparkles,
  X
} from 'lucide-react';
import { ChatbotConfig } from '../types';

interface EmbedCodeModalProps {
  chatbot: ChatbotConfig | null;
  onClose: () => void;
}

export const EmbedCodeModal: React.FC<EmbedCodeModalProps> = ({ chatbot, onClose }) => {
  if (!chatbot) return null;

  const [activePlatform, setActivePlatform] = useState<'html' | 'wordpress' | 'shopify' | 'webflow' | 'react'>('html');
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://omnidesk.ai';
  const embedScript = `<script src="${baseUrl}/widget.js" data-chatbot-id="${chatbot.id}" async></script>`;

  const reactSnippet = `import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '${baseUrl}/widget.js';
    script.setAttribute('data-chatbot-id', '${chatbot.id}');
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div>Your App Content</div>;
}`;

  const getPlatformCode = () => {
    switch (activePlatform) {
      case 'html':
        return embedScript;
      case 'wordpress':
        return `<!-- OmniDesk AI Chatbot for WordPress -->\n${embedScript}`;
      case 'shopify':
        return `<!-- OmniDesk AI Chatbot Widget for Shopify Stores -->\n${embedScript}`;
      case 'webflow':
        return `<!-- Paste in Webflow Site Settings > Custom Code > Footer -->\n${embedScript}`;
      case 'react':
        return reactSnippet;
      default:
        return embedScript;
    }
  };

  const getPlatformInstructions = () => {
    switch (activePlatform) {
      case 'shopify':
        return (
          <div className="text-xs text-zinc-400 space-y-1.5 p-3.5 bg-zinc-950 rounded-xl border border-zinc-800">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <span>Shopify Store Quick Integration Steps:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-zinc-300">
              <li>Log in to your <strong>Shopify Admin</strong> dashboard.</li>
              <li>Navigate to <strong>Online Store</strong> &rarr; <strong>Themes</strong>.</li>
              <li>Click the <strong>...</strong> (Actions) button next to your active theme and select <strong>Edit code</strong>.</li>
              <li>Under the <strong>Layout</strong> folder on the left, click <code>theme.liquid</code>.</li>
              <li>Scroll down to the bottom and paste this script directly above the <code>&lt;/body&gt;</code> tag.</li>
              <li>Click <strong>Save</strong> at top right. Your chatbot widget is now live on your Shopify store!</li>
            </ol>
          </div>
        );
      case 'wordpress':
        return (
          <div className="text-xs text-zinc-400 space-y-1.5 p-3.5 bg-zinc-950 rounded-xl border border-zinc-800">
            <div className="font-semibold text-emerald-400">WordPress Setup Steps:</div>
            <p className="text-zinc-300">
              Paste the code into your theme's <code>footer.php</code> file directly above <code>&lt;/body&gt;</code>, or install the free <em>"Insert Headers and Footers"</em> plugin and paste it into the Footer Scripts field.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getPlatformCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#0f0f0f] rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-800 space-y-6 text-zinc-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-emerald-400 border border-zinc-800 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Embed Widget Snippet</h2>
              <p className="text-xs text-zinc-400">Deploy <strong className="text-white">{chatbot.name}</strong> to any platform in under 60 seconds.</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white rounded-xl hover:bg-zinc-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selection Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
          {[
            { id: 'html', label: 'HTML / Custom Web' },
            { id: 'wordpress', label: 'WordPress' },
            { id: 'shopify', label: 'Shopify' },
            { id: 'webflow', label: 'Webflow' },
            { id: 'react', label: 'React / Next.js' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePlatform(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activePlatform === tab.id
                  ? 'bg-zinc-100 text-black shadow-xs font-semibold'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code Snippet Box */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Copy and paste this script before the closing <code>&lt;/body&gt;</code> tag:</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-zinc-100 hover:bg-white text-black font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Snippet'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-black text-zinc-200 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800">
            {getPlatformCode()}
          </pre>

          {getPlatformInstructions()}
        </div>

        {/* Integration Instructions */}
        <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 text-xs text-zinc-300 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-white">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Multi-Tenant CDN Embed Engine</span>
          </div>
          <p className="text-zinc-400 leading-relaxed">
            The script runs asynchronously and creates an isolated shadow container. Changes made to your chatbot's knowledge base or branding in OmniDesk update on your live website instantly without re-deploying code!
          </p>
        </div>
      </div>
    </div>
  );
};
