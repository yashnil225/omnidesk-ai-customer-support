import express from 'express';
import path from 'path';import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();const app = express();
const PORT = 3000;

app.use(express.json());

// Global CORS Middleware to allow widget fetch from external sites
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
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

  var defaultConfig = {
    id: chatbotId,
    name: 'AI Support Assistant',
    welcomeMessage: 'Hello! How can I assist you with our store products and policies today?',
    primaryColor: '#15b7cb',
    position: 'bottom-right',
    avatarUrl: '',
    suggestedPrompts: ['Shipping Policy', 'Track My Order', 'Product Catalog'],
    collectUserEmail: true
  };

  // Fetch Chatbot configuration
  fetch(serverUrl + '/api/chatbot/' + chatbotId)
    .then(function(res) {
      if (!res.ok) throw new Error('HTTP error ' + res.status);
      return res.json();
    })
    .then(function(data) {
      if (data && data.chatbot) {
        state.config = data.chatbot;
      } else {
        state.config = defaultConfig;
      }
      initWidget();
    })
    .catch(function(err) {
      console.warn('[OmniDesk] Could not fetch chatbot config, using default fallback:', err);
      state.config = defaultConfig;
      initWidget();
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
        var lower = trimmed.toLowerCase();
        var reply = "Welcome! How can I assist you with our store products, orders, or shipping policies today?";
        if (lower.indexOf('ship') !== -1 || lower.indexOf('deliver') !== -1 || lower.indexOf('track') !== -1) {
          reply = "We offer standard shipping with delivery in 3-5 business days.";
        } else if (lower.indexOf('contact') !== -1 || lower.indexOf('email') !== -1 || lower.indexOf('support') !== -1) {
          reply = "You can reach our customer support team through our contact page or email.";
        }
        addMessage('bot', reply);
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
    let bot: any = null;

    try {
      const { data: dbBot } = await supabase.from('chatbots').select('*').eq('id', chatbotId).single();
      if (dbBot) {
        bot = {
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
      }
    } catch (e) {
      console.warn('Supabase lookup skipped/failed, using website knowledge base fallback');
    }

    if (!bot) {
      bot = {
        id: chatbotId || 'bot_default',
        name: 'AI Support Assistant',
        welcomeMessage: 'Hello! Welcome to our store. How can I help you today?',
        primaryColor: '#15b7cb',
        customSystemPrompt: 'You are an official AI Customer Support assistant. Answer questions strictly based on the provided Knowledge Base and live store product catalog.',
        kbFaqs: [],
        kbDocs: [],
        kbUrls: []
      };
    }

    // Build rich context from Chatbot Knowledge Base
    let kbContextText = '';
    if (bot.kbFaqs && bot.kbFaqs.length > 0) {
      kbContextText += '\n--- KNOWLEDGE BASE: FREQUENTLY ASKED QUESTIONS ---\n';
      bot.kbFaqs.forEach((faq: any, idx: number) => {
        kbContextText += `Q${idx + 1}: ${faq.question}\nA${idx + 1}: ${faq.answer}\n\n`;
      });
    }

    if (bot.kbDocs && bot.kbDocs.length > 0) {
      kbContextText += '\n--- KNOWLEDGE BASE: DOCUMENTS & LIVE STORE CATALOG ---\n';
      bot.kbDocs.forEach((doc: any) => {
        kbContextText += `[Document Title: ${doc.title}]\n${doc.content}\n\n`;
      });
    }

    const systemInstruction = `You are ${bot.name}, official AI Customer Support assistant for the store.
${bot.customSystemPrompt || ''}

STRICT CATALOG & ACCURACY RULES:
1. Answer customer questions directly, clearly, politely, and accurately using ONLY the business knowledge base context and Shopify store product catalog provided below.
2. STRICT CATALOG RULE: You must ONLY reference, describe, or recommend products explicitly listed in the Knowledge Base / Shopify catalog context below. If a user asks about a product that is NOT present in the provided catalog context, you MUST explicitly inform them that the item is currently NOT listed or available in our store catalog. Do NOT assume, invent, or hallucinate products outside the catalog.
3. Maintain a friendly, professional, and helpful tone.
4. SUMMARIZE & STRUCTURE: Do NOT copy and paste long blocks of text or raw descriptions directly from the source catalog. You must summarize and synthesize the information into a well-structured, easy-to-read, and conversational response.
5. Use bullet points or short paragraphs for readability. Keep responses concise.
6. NEVER invent prices, discounts, or specifications not supported by the knowledge base.

${kbContextText}`;

    // Extract recent conversation turn history
    const recentMessages = Array.isArray(messages) ? messages.slice(-10) : [];
    let chatHistoryPrompt = '';
    recentMessages.forEach((m: any) => {
      const senderLabel = m.sender === 'user' ? 'Customer' : 'Support Bot';
      chatHistoryPrompt += `${senderLabel}: ${m.text}\n`;
    });

    const userMessageText = recentMessages.length > 0 ? (recentMessages[recentMessages.length - 1].text || '') : 'Hello';

    let aiText = '';

    // Attempt AI API call if not handled by direct catalog guardrail
    if (!aiText) {
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

      // 1. Try OpenRouter API with fallbacks
      if (openRouterKey) {
        const modelsToTry = [
          'openrouter/free',
          'google/gemma-4-31b-it:free',
          'nvidia/nemotron-3-super-120b-a12b:free',
          'openai/gpt-oss-20b:free'
        ];

        for (const modelName of modelsToTry) {
          if (aiText) break;
          try {
            const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openRouterKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://omnidesk.ai',
                'X-Title': 'OmniDesk AI Customer Support',
              },
              body: JSON.stringify({
                model: modelName,
                messages: [
                  { role: 'system', content: systemInstruction },
                  { role: 'user', content: `${chatHistoryPrompt}\nProvide the Support Bot's next reply to the Customer:` }
                ],
                temperature: 0.3,
              })
            });

            if (openRouterRes.ok) {
              const data = await openRouterRes.json();
              if (data.choices && data.choices.length > 0 && data.choices[0].message?.content) {
                aiText = data.choices[0].message.content.trim();
              }
            } else {
              const errBody = await openRouterRes.text();
              console.warn(`[OpenRouter Model ${modelName} Error ${openRouterRes.status}]:`, errBody.substring(0, 200));
            }
          } catch (modelErr: any) {
            console.warn(`[OpenRouter Call Error for ${modelName}]:`, modelErr.message);
          }
        }
      }

      // 2. Try Direct Google Gemini API if OpenRouter didn't yield a result
      if (!aiText && geminiKey) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents: [{ parts: [{ text: `${chatHistoryPrompt}\nProvide the Support Bot's next reply to the Customer:` }] }]
              })
            }
          );

          if (geminiRes.ok) {
            const gData = await geminiRes.json();
            const cand = gData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (cand) {
              aiText = cand.trim();
            }
          } else {
            console.warn(`[Gemini API Error ${geminiRes.status}]:`, await geminiRes.text());
          }
        } catch (gErr: any) {
          console.warn('[Gemini Direct API Call Error]:', gErr.message);
        }
      }
    }

    // Smart Knowledge Base Product Search Engine (Fallback if AI APIs are offline)
    if (!aiText) {
      const lower = userMessageText.toLowerCase();

      // Check for shipping/delivery questions
      if (lower.includes('ship') || lower.includes('deliver') || lower.includes('track') || lower.includes('post')) {
        const shippingFaq = bot.kbFaqs?.find((f: any) => JSON.stringify(f).toLowerCase().includes('ship'));
        if (shippingFaq) {
          aiText = shippingFaq.answer;
        } else {
          aiText = "We offer standard shipping with delivery in 3-5 business days. Express shipping is also available at checkout.";
        }
      } 
      // Check for contact questions
      else if (lower.includes('contact') || lower.includes('support') || lower.includes('email') || lower.includes('phone')) {
        aiText = "You can reach customer support through our store contact page or email. How else can I assist you today?";
      } 
      // Product Catalog Queries & Keyword Search Engine
      else {
        // Extract products from kbDocs / Shopify catalog
        const productTitles: string[] = [];
        const productSnippets: string[] = [];

        if (bot.kbDocs && bot.kbDocs.length > 0) {
          bot.kbDocs.forEach((doc: any) => {
            const content = doc.content || '';
            // Parse product titles (### 1. Title or - Title)
            const titleMatches = content.match(/###\s*\d*\.?\s*([^\n]+)/g);
            if (titleMatches) {
              titleMatches.forEach((m: string) => {
                const clean = m.replace(/###\s*\d*\.?\s*/, '').trim();
                if (clean && !productTitles.includes(clean)) {
                  productTitles.push(clean);
                }
              });
            }

            // Search content lines for user query keywords
            const queryWords = lower.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3 && !['what', 'have', 'does', 'your', 'this', 'that', 'show', 'list', 'tell', 'about', 'need', 'want', 'like', 'avail'].includes(w));
            if (queryWords.length > 0) {
              const lines = content.split('\n');
              lines.forEach(line => {
                if (queryWords.some(w => line.toLowerCase().includes(w))) {
                  const trimmedLine = line.trim();
                  if (trimmedLine && !productSnippets.includes(trimmedLine)) {
                    productSnippets.push(trimmedLine);
                  }
                }
              });
            }
          });
        }

        // Also check kbFaqs for matching questions/answers
        if (bot.kbFaqs && bot.kbFaqs.length > 0) {
          const matchingFaq = bot.kbFaqs.find((f: any) => 
            lower.split(/\s+/).some(w => w.length > 3 && (f.question.toLowerCase().includes(w) || f.answer.toLowerCase().includes(w)))
          );
          if (matchingFaq) {
            aiText = matchingFaq.answer;
          }
        }

        if (!aiText) {
          if (productSnippets.length > 0) {
            // Clean up the raw snippets to look less like copy-paste
            const cleanSnippets = productSnippets.slice(0, 4).map(s => '• ' + s.replace(/^[#-]+\s*\**.*?\**:\s*/, '').substring(0, 150));
            aiText = `*I am currently experiencing high traffic and running in offline search mode.* Here is what I found:\n${cleanSnippets.join('\n')}`;
          } else if (productTitles.length > 0) {
            aiText = `*I am currently in offline search mode.* We offer the following products:\n• ${productTitles.slice(0, 6).join('\n• ')}\n\nPlease contact support for more details.`;
          } else if (lower.includes('product') || lower.includes('catalog') || lower.includes('item') || lower.includes('buy') || lower.includes('sell')) {
            aiText = "Our store catalog is currently being updated. Please check back shortly or sync your Shopify store URL in the dashboard.";
          } else {
            aiText = "Hello! I am your AI Support Assistant. I can help answer questions about our store products. What would you like to know?";
          }
        }
      }
    }


    const newConvId = conversationId || 'conv_' + Math.random().toString(36).substring(2, 9);

    res.json({
      success: true,
      text: aiText,
      conversationId: newConvId,
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.json({
      success: true,
      text: "Welcome! How can I assist you with our store products and policies today?",
      conversationId: 'conv_fallback'
    });
  }
});

// ==========================================
// 3.5. SHOPIFY LIVE STORE CATALOG SYNC ENDPOINT
// ==========================================
app.post('/api/shopify/sync', async (req, res) => {
  try {
    const { storeUrl } = req.body;
    if (!storeUrl) {
      return res.status(400).json({ error: 'Store URL parameter is required' });
    }

    let cleanUrl = storeUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    cleanUrl = cleanUrl.replace(/\/+$/, '');

    const productsJsonUrl = `${cleanUrl}/products.json?limit=250`;
    console.log(`[Shopify Sync] Fetching live products from: ${productsJsonUrl}`);

    const response = await fetch(productsJsonUrl, {
      headers: {
        'User-Agent': 'OmniDeskBot/1.0 (+https://omnidesk.ai)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(400).json({
        error: `Could not fetch products from ${cleanUrl}. Ensure the Shopify store is public and accessible.`,
      });
    }

    const data = await response.json();
    const products = data.products || [];

    if (!Array.isArray(products) || products.length === 0) {
      return res.json({
        success: true,
        count: 0,
        docTitle: 'Shopify Store Catalog',
        content: 'No products currently listed on this store.',
      });
    }

    let catalogMarkdown = `# Live Shopify Product Catalog (${products.length} Active Products)\n\n`;
    catalogMarkdown += `Catalog fetched live from ${cleanUrl} on ${new Date().toLocaleDateString('en-US')}.\n\n`;

    products.forEach((p: any, idx: number) => {
      const pTitle = p.title || 'Untitled Product';
      const pVendor = p.vendor || '';
      const pType = p.product_type || '';
      const pTags = Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || '');

      const pDesc = (p.body_html || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const variants = p.variants || [];
      const priceList = variants
        .map((v: any) => `${v.title !== 'Default Title' ? v.title + ': ' : ''}$${v.price || 'N/A'}`)
        .join(', ');

      catalogMarkdown += `### ${idx + 1}. ${pTitle}\n`;
      if (pVendor) catalogMarkdown += `- **Vendor / Brand:** ${pVendor}\n`;
      if (pType) catalogMarkdown += `- **Category:** ${pType}\n`;
      if (priceList) catalogMarkdown += `- **Price & Variants:** ${priceList}\n`;
      if (pTags) catalogMarkdown += `- **Tags:** ${pTags}\n`;
      catalogMarkdown += `- **Description:** ${pDesc || 'No description provided.'}\n\n`;
    });

    let hostname = cleanUrl;
    try {
      hostname = new URL(cleanUrl).hostname;
    } catch (e) {}

    const docTitle = `Shopify Live Catalog - ${hostname}`;

    res.json({
      success: true,
      count: products.length,
      docTitle,
      content: catalogMarkdown,
      storeUrl: cleanUrl,
    });
  } catch (err: any) {
    console.error('[Shopify Sync Error]:', err);
    res.status(500).json({
      error: 'Failed to sync Shopify store catalog',
      details: err.message,
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
// 4.5. KNOWLEDGE BASE DOCUMENT FILE PARSER (PDF, WORD, IMAGE, TEXT)
// ==========================================
app.post('/api/kb/parse-file', async (req, res) => {
  try {
    const { fileName, fileType, base64Data } = req.body;
    if (!fileName || !base64Data) {
      return res.status(400).json({ error: 'Filename and base64Data are required' });
    }

    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const ext = path.extname(fileName).toLowerCase();

    let extractedTitle = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    extractedTitle = extractedTitle.replace(/\b\w/g, (c: string) => c.toUpperCase());

    let extractedText = '';
    let docType: 'pdf' | 'doc' | 'image' | 'text' = 'text';

    if (ext === '.pdf' || fileType?.includes('pdf')) {
      docType = 'pdf';
    } else if (['.doc', '.docx'].includes(ext) || fileType?.includes('word') || fileType?.includes('officedocument')) {
      docType = 'doc';
    } else if (['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif'].includes(ext) || fileType?.startsWith('image/')) {
      docType = 'image';
    } else {
      docType = 'text';
    }

    // Try OpenRouter AI Multimodal extraction if OPENROUTER_API_KEY is available
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (apiKey) {
      try {
        let mime = fileType || (docType === 'pdf' ? 'application/pdf' : docType === 'image' ? `image/${ext.replace('.', '') || 'png'}` : 'text/plain');
        if (mime === 'image/jpg') mime = 'image/jpeg';

        let userContent: any[] = [];
        if (docType === 'image' || docType === 'pdf') {
          userContent = [
            {
              type: 'text',
              text: `Extract all document text, policies, specs, terms, tables, and instructions from this ${docType.toUpperCase()} file named "${fileName}". Output clean, structured markdown for training an AI support bot. Start with a title header "# Title".`
            },
            {
              type: 'image_url',
              image_url: { url: `data:${mime};base64,${cleanBase64}` }
            }
          ];
        } else {
          const rawContent = buffer.toString('utf-8');
          userContent = [
            {
              type: 'text',
              text: `Extract and clean the content from this file named "${fileName}" for training an AI chatbot:\n\n${rawContent.substring(0, 15000)}`
            }
          ];
        }

        const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.0-flash-001',
            messages: [{ role: 'user', content: userContent }]
          })
        });

        if (openRouterRes.ok) {
          const aiData = await openRouterRes.json();
          if (aiData.choices && aiData.choices.length > 0) {
            const aiContent = aiData.choices[0].message.content.trim();
            const titleMatch = aiContent.match(/^#\s+(.+)$/m);
            if (titleMatch) {
              extractedTitle = titleMatch[1].trim();
              extractedText = aiContent.replace(/^#\s+.+$/m, '').trim();
            } else {
              extractedText = aiContent;
            }
          }
        }
      } catch (aiErr) {
        console.warn('AI file extraction fallback:', aiErr);
      }
    }

    // Direct fallback text extraction if AI didn't return text
    if (!extractedText) {
      if (docType === 'text') {
        extractedText = buffer.toString('utf-8');
      } else if (docType === 'doc') {
        const rawStr = buffer.toString('binary');
        const matches = rawStr.match(/[\x20-\x7E\s]{4,}/g);
        if (matches) {
          extractedText = matches.filter(m => !m.includes('xml') && !m.includes('schemas') && !m.includes('Microsoft')).join('\n').trim();
        }
        if (!extractedText || extractedText.length < 20) {
          extractedText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, ' ');
        }
      } else if (docType === 'pdf') {
        const rawStr = buffer.toString('binary');
        const textMatches: string[] = [];
        const regex = /\(([^)]+)\)\s*T[jJ]/g;
        let match;
        while ((match = regex.exec(rawStr)) !== null) {
          textMatches.push(match[1]);
        }
        if (textMatches.length > 0) {
          extractedText = textMatches.join(' ');
        } else {
          const printable = rawStr.match(/[\x20-\x7E\n]{6,}/g) || [];
          extractedText = printable.filter(p => !p.startsWith('/') && !p.includes('Font')).join('\n').substring(0, 4000);
        }
      } else if (docType === 'image') {
        extractedText = `Document scan / image file: ${fileName}.\nExtracted image knowledge item for training chatbot.`;
      }
    }

    const fileSizeKb = (buffer.length / 1024).toFixed(1) + ' KB';

    res.json({
      success: true,
      title: extractedTitle,
      content: extractedText || `Extracted content for ${fileName}`,
      type: docType,
      fileName,
      fileSize: fileSizeKb,
    });
  } catch (err: any) {
    console.error('File parsing error:', err);
    res.status(500).json({ error: 'Failed to process document file', details: err.message });
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
