import express from 'express';
import path from 'path';import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();const app = express();
const PORT = 3000;

app.use(express.json());



const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ffpiakhvtzuqzurqaepd.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// 1. PUBLIC WIDGET JAVASCRIPT ENDPOINT
// ==========================================
app.get('/widget.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const widgetScript = `
(function() {
  if (window.__OmniDeskWidgetLoaded) return;
  window.__OmniDeskWidgetLoaded = true;

  // Find script element to extract config
  var currentScript = document.currentScript || document.querySelector('script[data-chatbot-id]') || document.querySelector('script[src*="widget.js"]') || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var chatbotId = (currentScript && currentScript.getAttribute('data-chatbot-id')) || 'bot_1785171802386';
  var serverUrl = (currentScript && currentScript.src) ? currentScript.src.replace('/widget.js', '') : 'https://omnidesk-ai-customer-support.vercel.app';

  var state = {
    isOpen: false,
    config: null,
    conversationId: null,
    messages: [],
    isTyping: false,
    visitorId: 'vis_' + Math.random().toString(36).substring(2, 9)
  };

  // Create Widget DOM container safely
  var container = document.createElement('div');
  container.id = 'omnidesk-widget-root';
  
  function mountContainer() {
    if (!document.getElementById('omnidesk-widget-root')) {
      (document.body || document.documentElement).appendChild(container);
    }
  }

  if (document.body) {
    mountContainer();
  } else {
    document.addEventListener('DOMContentLoaded', mountContainer);
  }

  // Fetch Chatbot configuration
  fetch(serverUrl + '/api/chatbot/' + chatbotId)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data && data.chatbot) {
        state.config = data.chatbot;
        initWidget();
      }
    })
    .catch(function(err) {
      console.warn('[OmniDesk] Could not fetch chatbot config:', err);
    });

  function initWidget() {
    var config = state.config;
    var primaryColor = config.primaryColor || '#4F46E5';
    var isLeft = config.position === 'bottom-left';

    // Inject CSS
    var style = document.createElement('style');
    style.innerHTML = \`
      #omnidesk-widget-root {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        z-index: 999999;
        position: fixed;
        \${isLeft ? 'left: 20px;' : 'right: 20px;'}
        bottom: 20px;
      }
      .omni-launcher {
        width: 60px;
        height: 60px;
        border-radius: 30px;
        background-color: \${primaryColor};
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        border: none;
        outline: none;
      }
      .omni-launcher:hover {
        transform: scale(1.06);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
      }
      .omni-launcher svg {
        width: 28px;
        height: 28px;
        fill: #ffffff;
      }
      .omni-window {
        display: none;
        position: fixed;
        \${isLeft ? 'left: 20px;' : 'right: 20px;'}
        bottom: 90px;
        width: 380px;
        max-width: calc(100vw - 32px);
        height: 580px;
        max-height: calc(100vh - 120px);
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.16);
        flex-direction: column;
        overflow: hidden;
        border: 1px solid #e5e7eb;
        transition: opacity 0.2s ease;
      }
      .omni-window.open {
        display: flex;
      }
      .omni-header {
        background-color: \${primaryColor};
        color: #ffffff;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .omni-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .omni-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        object-fit: cover;
      }
      .omni-title {
        font-weight: 600;
        font-size: 15px;
        line-height: 1.2;
      }
      .omni-subtitle {
        font-size: 12px;
        opacity: 0.85;
      }
      .omni-close-btn {
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
        opacity: 0.8;
      }
      .omni-close-btn:hover { opacity: 1; }
      .omni-messages {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #f9fafb;
      }
      .omni-msg {
        max-width: 82%;
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.45;
        word-wrap: break-word;
      }
      .omni-msg-bot {
        background: #ffffff;
        color: #1f2937;
        align-self: flex-start;
        border: 1px solid #e5e7eb;
        border-bottom-left-radius: 2px;
      }
      .omni-msg-user {
        background: \${primaryColor};
        color: #ffffff;
        align-self: flex-end;
        border-bottom-right-radius: 2px;
      }
      .omni-msg-agent {
        background: #f3f4f6;
        color: #111827;
        align-self: flex-start;
        border: 1px solid #d1d5db;
        border-left: 3px solid \${primaryColor};
      }
      .omni-prompts {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
      }
      .omni-prompt-btn {
        background: #ffffff;
        border: 1px solid \${primaryColor};
        color: \${primaryColor};
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 12px;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .omni-prompt-btn:hover {
        background: #f0fdf4;
      }
      .omni-footer {
        padding: 12px 16px;
        border-top: 1px solid #e5e7eb;
        background: #ffffff;
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .omni-input {
        flex: 1;
        border: 1px solid #d1d5db;
        border-radius: 20px;
        padding: 8px 14px;
        font-size: 14px;
        outline: none;
      }
      .omni-input:focus {
        border-color: \${primaryColor};
      }
      .omni-send-btn {
        background: \${primaryColor};
        color: #ffffff;
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .omni-branding {
        font-size: 11px;
        color: #9ca3af;
        text-align: center;
        padding: 4px 0;
        background: #ffffff;
        border-top: 1px solid #f3f4f6;
      }
      .omni-typing {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 10px 14px;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        width: fit-content;
        align-self: flex-start;
      }
      .omni-dot {
        width: 6px;
        height: 6px;
        background: #9ca3af;
        border-radius: 50%;
        animation: omniBlink 1.4s infinite ease-in-out both;
      }
      .omni-dot:nth-child(1) { animation-delay: -0.32s; }
      .omni-dot:nth-child(2) { animation-delay: -0.16s; }
      @keyframes omniBlink {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1.0); }
      }
    \`;
    document.head.appendChild(style);

    // Build DOM elements
    var launcher = document.createElement('button');
    launcher.className = 'omni-launcher';
    launcher.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';

    var windowEl = document.createElement('div');
    windowEl.className = 'omni-window';

    var avatarImg = config.avatarUrl 
      ? '<img class="omni-avatar" src="' + config.avatarUrl + '" />'
      : '<div class="omni-avatar">' + config.name.charAt(0) + '</div>';

    windowEl.innerHTML = \`
      <div class="omni-header">
        <div class="omni-header-info">
          \${avatarImg}
          <div>
            <div class="omni-title">\${config.name}</div>
            <div class="omni-subtitle">⚡ 24x7 Support Online</div>
          </div>
        </div>
        <button class="omni-close-btn" id="omni-close">✕</button>
      </div>
      <div class="omni-messages" id="omni-msg-list"></div>
      <div class="omni-footer">
        <input type="text" class="omni-input" id="omni-input" placeholder="Type a message..." />
        <button class="omni-send-btn" id="omni-send">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        </button>
      </div>
      <div class="omni-branding">Powered by <strong>OmniDesk AI</strong></div>
    \`;

    container.appendChild(windowEl);
    container.appendChild(launcher);

    // Initial Welcome Message
    if (config.welcomeMessage) {
      addMessage('bot', config.welcomeMessage, config.suggestedPrompts);
    }

    // Handlers
    launcher.onclick = function() {
      state.isOpen = !state.isOpen;
      if (state.isOpen) {
        windowEl.classList.add('open');
      } else {
        windowEl.classList.remove('open');
      }
    };

    document.getElementById('omni-close').onclick = function() {
      state.isOpen = false;
      windowEl.classList.remove('open');
    };

    var inputEl = document.getElementById('omni-input');
    var sendBtn = document.getElementById('omni-send');

    function sendMessage(text) {
      if (!text || !text.trim()) return;
      var trimmed = text.trim();
      addMessage('user', trimmed);
      inputEl.value = '';

      showTyping(true);

      // Call Express AI Backend
      fetch(serverUrl + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbotId: chatbotId,
          conversationId: state.conversationId,
          visitorId: state.visitorId,
          messages: state.messages
        })
      })
      .then(function(res) { return res.json(); })
      .then(function(resData) {
        showTyping(false);
        if (resData.conversationId) state.conversationId = resData.conversationId;
        if (resData.text) {
          addMessage('bot', resData.text);
        } else {
          addMessage('bot', 'I am having trouble responding right now. Please try again or leave your email!');
        }
      })
      .catch(function(err) {
        showTyping(false);
        addMessage('bot', 'Connecting to support servers...');
      });
    }

    sendBtn.onclick = function() { sendMessage(inputEl.value); };
    inputEl.onkeypress = function(e) {
      if (e.key === 'Enter') sendMessage(inputEl.value);
    };

    function addMessage(sender, text, prompts) {
      state.messages.push({ sender: sender, text: text, createdAt: new Date().toISOString() });
      var listEl = document.getElementById('omni-msg-list');
      var msgDiv = document.createElement('div');
      msgDiv.className = 'omni-msg ' + (sender === 'user' ? 'omni-msg-user' : 'omni-msg-bot');
      msgDiv.innerText = text;

      if (prompts && prompts.length > 0) {
        var promptsDiv = document.createElement('div');
        promptsDiv.className = 'omni-prompts';
        prompts.forEach(function(prompt) {
          var pBtn = document.createElement('button');
          pBtn.className = 'omni-prompt-btn';
          pBtn.innerText = prompt;
          pBtn.onclick = function() {
            sendMessage(prompt);
            promptsDiv.style.display = 'none';
          };
          promptsDiv.appendChild(pBtn);
        });
        msgDiv.appendChild(promptsDiv);
      }

      listEl.appendChild(msgDiv);
      listEl.scrollTop = listEl.scrollHeight;
    }

    function showTyping(show) {
      var listEl = document.getElementById('omni-msg-list');
      var existing = document.getElementById('omni-typing-indicator');
      if (show && !existing) {
        var typingDiv = document.createElement('div');
        typingDiv.id = 'omni-typing-indicator';
        typingDiv.className = 'omni-typing';
        typingDiv.innerHTML = '<div class="omni-dot"></div><div class="omni-dot"></div><div class="omni-dot"></div>';
        listEl.appendChild(typingDiv);
        listEl.scrollTop = listEl.scrollHeight;
      } else if (!show && existing) {
        existing.remove();
      }
    }
  }
})();
  `;

  res.send(widgetScript);
});

// ==========================================
// 2. CHATBOT PUBLIC METADATA API
// ==========================================
app.get('/api/chatbot/:id', async (req, res) => {
  const chatbotId = req.params.id;
  const { data: bot, error } = await supabase.from('chatbots').select('*').eq('id', chatbotId).single();
  if (error || !bot) {
    return res.status(404).json({ error: 'Chatbot not found' });
  }

  const mappedBot = {
    id: bot.id,
    tenantId: bot.tenant_id,
    name: bot.name,
    welcomeMessage: bot.welcome_message,
    primaryColor: bot.primary_color,
    position: bot.position,
    avatarUrl: bot.avatar_url,
    suggestedPrompts: bot.suggested_prompts || [],
    customSystemPrompt: bot.custom_system_prompt || '',
    collectUserEmail: bot.collect_user_email ?? true,
    kbUrls: bot.kb_urls || [],
    kbFaqs: bot.kb_faqs || [],
    kbDocs: bot.kb_docs || [],
  };
  res.json({ chatbot: mappedBot });
});

// ==========================================
// 3. AI CHAT EXECUTION API (SERVER-SIDE GEMINI)
// ==========================================
app.post('/api/chat', async (req, res) => {
  try {
    const { chatbotId, conversationId, visitorId, messages } = req.body;
    const { data: dbBot, error: dbError } = await supabase.from('chatbots').select('*').eq('id', chatbotId).single();
    
    if (dbError || !dbBot) {
      return res.status(404).json({ success: false, error: 'Chatbot not found' });
    }

    const bot = {
      id: dbBot.id,
      tenantId: dbBot.tenant_id,
      name: dbBot.name,
      welcomeMessage: dbBot.welcome_message,
      primaryColor: dbBot.primary_color,
      position: dbBot.position,
      avatarUrl: dbBot.avatar_url,
      suggestedPrompts: dbBot.suggested_prompts || [],
      customSystemPrompt: dbBot.custom_system_prompt || '',
      collectUserEmail: dbBot.collect_user_email ?? true,
      kbUrls: dbBot.kb_urls || [],
      kbFaqs: dbBot.kb_faqs || [],
      kbDocs: dbBot.kb_docs || [],
    };

    // Build rich context from Chatbot Knowledge Base
    let kbContextText = '';

    // 1. FAQs
    if (bot.kbFaqs && bot.kbFaqs.length > 0) {
      kbContextText += '\n--- KNOWLEDGE BASE: FREQUENTLY ASKED QUESTIONS ---\n';
      bot.kbFaqs.forEach((faq: any, idx: number) => {
        kbContextText += `Q${idx + 1}: ${faq.question}\nA${idx + 1}: ${faq.answer}\n\n`;
      });
    }

    // 2. Documents & PDFs
    if (bot.kbDocs && bot.kbDocs.length > 0) {
      kbContextText += '\n--- KNOWLEDGE BASE: DOCUMENTS & POLICIES ---\n';
      bot.kbDocs.forEach((doc: any) => {
        kbContextText += `[Document Title: ${doc.title}]\n${doc.content}\n\n`;
      });
    }

    // 3. URLs
    if (bot.kbUrls && bot.kbUrls.length > 0) {
      kbContextText += '\n--- KNOWLEDGE BASE: WEBSITE CONTENT ---\n';
      bot.kbUrls.forEach((u: any) => {
        if (u.textContent) {
          kbContextText += `[Source URL: ${u.url} | Title: ${u.pageTitle || 'Web Page'}]\n${u.textContent}\n\n`;
        }
      });
    }

    const systemInstruction = `You are ${bot.name}, an official AI Customer Support representative for the business.
${bot.customSystemPrompt || ''}

GUIDELINES FOR YOUR RESPONSES:
1. Answer the customer's question directly, clearly, politely, and accurately using the business knowledge base context provided below.
2. Maintain a friendly and helpful corporate tone.
3. Keep responses concise (typically 2 to 4 sentences or a clean bullet list if explaining steps).
4. IF THE CUSTOMER'S QUESTION CANNOT BE ANSWERED using the provided knowledge base, politely state that you don't have that specific information on hand and offer to collect their contact details so a human support agent can follow up.
5. NEVER invent facts, prices, or policies not supported by the knowledge base.

${kbContextText}`;

    // Extract recent conversation turn history
    const recentMessages = Array.isArray(messages) ? messages.slice(-10) : [];
    let chatHistoryPrompt = '';
    recentMessages.forEach((m: any) => {
      const senderLabel = m.sender === 'user' ? 'Customer' : 'Support Bot';
      chatHistoryPrompt += `${senderLabel}: ${m.text}\n`;
    });

    if (!chatHistoryPrompt) {
      chatHistoryPrompt = 'Customer: Hello';
    }

    // Call OpenRouter API Server-Side for NVIDIA Nemotron 3 Ultra
    const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-ultra-550b-a55b',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: `${chatHistoryPrompt}\nProvide the Support Bot's next reply to the Customer:` }
        ]
      })
    });

    let aiText = "Thank you for reaching out! How else can I assist you today?";
    if (openRouterRes.ok) {
      const data = await openRouterRes.json();
      if (data.choices && data.choices.length > 0) {
        aiText = data.choices[0].message.content.trim();
      }
    } else {
      console.error('OpenRouter error:', await openRouterRes.text());
    }

    const newConvId = conversationId || 'conv_' + Math.random().toString(36).substring(2, 9);

    res.json({
      success: true,
      text: aiText,
      conversationId: newConvId,
    });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    res.status(500).json({
      success: false,
      error: 'AI service unavailable',
      text: "I am having a temporary connection issue. Please feel free to try again or leave your email so our human support team can assist you!",
    });
  }
});

// ==========================================
// 4. KNOWLEDGE BASE URL SCRAPER ENDPOINT
// ==========================================
app.post('/api/kb/scrape-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'OmniDeskBot/1.0 (+https://omnidesk.ai)',
      },
    });

    const html = await response.text();

    // Basic HTML text extraction
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : url;

    // Strip scripts, styles, and tags
    const cleanText = html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 3000); // Limit to first 3000 chars

    res.json({
      success: true,
      url,
      pageTitle: title,
      textContent: cleanText,
    });
  } catch (err: any) {
    console.error('URL scraping error:', err);
    res.status(500).json({
      error: 'Failed to crawl website URL',
      details: err.message,
    });
  }
});

// ==========================================
// 5. SAVE OR UPDATE IN-MEMORY / FIRESTORE CHATBOT
// ==========================================
app.post('/api/chatbot/save', async (req, res) => {
  const { chatbot } = req.body;
  if (chatbot && chatbot.id) {
    const payload = {
      id: chatbot.id,
      tenant_id: chatbot.tenantId,
      name: chatbot.name,
      welcome_message: chatbot.welcomeMessage,
      primary_color: chatbot.primaryColor,
      position: chatbot.position,
      avatar_url: chatbot.avatarUrl,
      suggested_prompts: chatbot.suggestedPrompts,
      custom_system_prompt: chatbot.customSystemPrompt,
      collect_user_email: chatbot.collectUserEmail,
      kb_urls: chatbot.kbUrls,
      kb_faqs: chatbot.kbFaqs,
      kb_docs: chatbot.kbDocs,
      updated_at: new Date().toISOString(),
    };
    await supabase.from('chatbots').upsert(payload);
    res.json({ success: true, chatbot });
  } else {
    res.status(400).json({ error: 'Invalid chatbot payload' });
  }
});

// ==========================================
// 6. VITE / STATIC SERVING HANDLER
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;

if (process.env.VERCEL !== '1') {
  startServer();
}
