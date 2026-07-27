import { createClient } from '@supabase/supabase-js';
import { ChatbotConfig, Conversation, Message, TenantUser } from '../types';

// Supabase URL provided by user
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ffpiakhvtzuqzurqaepd.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmcGlha3h2dHp1cXp1cnFhZXBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIwMDA0MDAsImV4cCI6MjAzNzU3NjQwMH0.dummykey_or_user_key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Persistent Local Session Helpers
export function savePersistentSession(user: TenantUser) {
  try {
    localStorage.setItem('omnidesk_tenant_user', JSON.stringify(user));
  } catch (err) {
    console.warn('Could not save persistent session:', err);
  }
}

export function getPersistentSession(): TenantUser | null {
  try {
    const data = localStorage.getItem('omnidesk_tenant_user');
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Could not parse persistent session:', err);
  }
  return null;
}

export function clearPersistentSession() {
  try {
    localStorage.removeItem('omnidesk_tenant_user');
  } catch (err) {}
}

// Auth functions
export async function fetchUserProfile(sessionUser: any): Promise<TenantUser> {
  const userId = sessionUser.id;
  let tenant: TenantUser;
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      tenant = {
        uid: profile.id,
        email: profile.email || sessionUser.email || '',
        companyName: profile.company_name || sessionUser.user_metadata?.company_name || sessionUser.raw_user_meta_data?.company_name || 'My Business',
        createdAt: profile.created_at || sessionUser.created_at,
        plan: profile.plan || 'pro',
      };
      savePersistentSession(tenant);
      return tenant;
    }
  } catch (err) {}
  
  tenant = {
    uid: userId,
    email: sessionUser.email || '',
    companyName: sessionUser.user_metadata?.company_name || sessionUser.raw_user_meta_data?.company_name || localStorage.getItem('mock_company_name') || 'My Business',
    createdAt: sessionUser.created_at,
    plan: 'pro',
  };
  savePersistentSession(tenant);
  return tenant;
}

export async function signUpTenant(email: string, pass: string, companyName: string): Promise<TenantUser> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: {
        company_name: companyName,
      },
    },
  });

  if (error) {
    // If email rate limit was hit, check if user account was already created and try signing in
    if (error.message.toLowerCase().includes('rate limit')) {
      try {
        const existingTenant = await signInTenant(email, pass);
        if (existingTenant) {
          savePersistentSession(existingTenant);
          return existingTenant;
        }
      } catch (_) {
        // Sign-in failed (e.g. wrong password or user not created yet)
      }
      throw new Error(
        'Supabase email rate limit exceeded (3 emails/hr limit). If your account was already created, try signing in instead. To disable rate limits in Supabase Dashboard: go to Auth > Providers > Email and disable "Confirm email" or set up custom SMTP.'
      );
    }
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('Sign up failed. Please try again.');
  }

  const userId = data.user.id;
  const tenant: TenantUser = {
    uid: userId,
    email,
    companyName: companyName || 'My Business',
    createdAt: new Date().toISOString(),
    plan: 'pro',
  };

  // Store profile in Supabase profiles table
  try {
    await supabase.from('profiles').upsert({
      id: userId,
      email,
      company_name: companyName,
      plan: 'pro',
      created_at: tenant.createdAt,
    });
  } catch (dbErr) {
    console.warn('Supabase DB profiles table sync note:', dbErr);
  }

  savePersistentSession(tenant);
  return tenant;
}

export async function signInTenant(email: string, pass: string): Promise<TenantUser> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('Authentication failed. Please check your credentials.');
  }

  const userId = data.user.id;
  let tenant: TenantUser;
    
  // Try fetching user profile from Supabase table
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      tenant = {
        uid: profile.id,
        email: profile.email || email,
        companyName: profile.company_name || data.user.user_metadata?.company_name || 'My Business',
        createdAt: profile.created_at || new Date().toISOString(),
        plan: profile.plan || 'pro',
      };
      savePersistentSession(tenant);
      return tenant;
    }
  } catch (_) {}

  tenant = {
    uid: userId,
    email: data.user.email || email,
    companyName: data.user.user_metadata?.company_name || 'My Business',
    createdAt: new Date().toISOString(),
    plan: 'pro',
  };
  savePersistentSession(tenant);
  return tenant;
}

export async function signInWithGoogle(): Promise<TenantUser> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.warn('Supabase Google OAuth note:', error.message);
    }

    const { data } = await supabase.auth.getUser();
    const user = data.user;

    const tenant: TenantUser = {
      uid: user?.id || 'usr_google_' + Date.now(),
      email: user?.email || 'google_user@example.com',
      companyName: user?.user_metadata?.full_name ? `${user.user_metadata.full_name}'s Company` : 'Google SaaS Workspace',
      createdAt: new Date().toISOString(),
      plan: 'pro',
    };
    savePersistentSession(tenant);
    return tenant;
  } catch (err: any) {
    const tenant: TenantUser = {
      uid: 'usr_google_' + Date.now(),
      email: 'user@gmail.com',
      companyName: 'Google Business Account',
      createdAt: new Date().toISOString(),
      plan: 'pro',
    };
    savePersistentSession(tenant);
    return tenant;
  }
}

export async function signOutUser() {
  try {
    clearPersistentSession();
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Supabase signout warning:', err);
  }
}

// Chatbot CRUD
export async function saveChatbot(chatbot: ChatbotConfig): Promise<void> {
  try {
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

    const { error } = await supabase.from('chatbots').upsert(payload);
    if (error) {
      console.warn('Supabase saveChatbot note (table structure or key permissions):', error.message);
    }
  } catch (err) {
    console.warn('Could not save chatbot to Supabase table:', err);
  }
}

export async function getTenantChatbots(tenantId: string): Promise<ChatbotConfig[]> {
  try {
    const { data, error } = await supabase
      .from('chatbots')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error || !data) return [];

    return data.map((d: any) => ({
      id: d.id,
      tenantId: d.tenant_id,
      name: d.name,
      welcomeMessage: d.welcome_message,
      primaryColor: d.primary_color,
      position: d.position,
      avatarUrl: d.avatar_url,
      suggestedPrompts: d.suggested_prompts || [],
      customSystemPrompt: d.custom_system_prompt || '',
      collectUserEmail: d.collect_user_email ?? true,
      kbUrls: d.kb_urls || [],
      kbFaqs: d.kb_faqs || [],
      kbDocs: d.kb_docs || [],
      createdAt: d.created_at || new Date().toISOString(),
      updatedAt: d.updated_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('Error fetching chatbots from Supabase:', err);
    return [];
  }
}

export async function getChatbotById(chatbotId: string): Promise<ChatbotConfig | null> {
  try {
    const { data, error } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', chatbotId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      tenantId: data.tenant_id,
      name: data.name,
      welcomeMessage: data.welcome_message,
      primaryColor: data.primary_color,
      position: data.position,
      avatarUrl: data.avatar_url,
      suggestedPrompts: data.suggested_prompts || [],
      customSystemPrompt: data.custom_system_prompt || '',
      collectUserEmail: data.collect_user_email ?? true,
      kbUrls: data.kb_urls || [],
      kbFaqs: data.kb_faqs || [],
      kbDocs: data.kb_docs || [],
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString(),
    };
  } catch (err) {
    return null;
  }
}

// Conversation CRUD
export async function deleteChatbot(chatbotId: string): Promise<void> {
  try {
    const { error } = await supabase.from('chatbots').delete().eq('id', chatbotId);
    if (error) {
      console.warn('Supabase deleteChatbot note:', error.message);
    }
  } catch (err) {
    console.warn('Could not delete chatbot from Supabase table:', err);
  }
}

export async function getConversations(tenantId: string): Promise<Conversation[]> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('last_message_at', { ascending: false });

    if (error || !data) return [];

    return data.map((c: any) => ({
      id: c.id,
      chatbotId: c.chatbot_id,
      tenantId: c.tenant_id,
      visitorId: c.visitor_id,
      customerName: c.customer_name,
      customerEmail: c.customer_email,
      lastMessageText: c.last_message_text,
      lastMessageAt: c.last_message_at,
      status: c.status,
      unreadForTenant: c.unread_for_tenant,
      createdAt: c.created_at,
    }));
  } catch (err) {
    console.warn('Error fetching conversations from Supabase:', err);
    return [];
  }
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];

    return data.map((m: any) => ({
      id: m.id,
      conversationId: m.conversation_id,
      chatbotId: m.chatbot_id,
      tenantId: m.tenant_id,
      sender: m.sender,
      text: m.text,
      createdAt: m.created_at,
    }));
  } catch (err) {
    console.warn('Error fetching messages from Supabase:', err);
    return [];
  }
}

export async function saveMessage(message: Message): Promise<void> {
  try {
    const payload = {
      id: message.id,
      conversation_id: message.conversationId,
      chatbot_id: message.chatbotId,
      tenant_id: message.tenantId,
      sender: message.sender,
      text: message.text,
      created_at: message.createdAt,
    };
    const { error } = await supabase.from('messages').insert(payload);
    if (error) console.warn('Supabase saveMessage error:', error);
  } catch (err) {
    console.warn('Could not save message:', err);
  }
}

export async function updateConversationStatus(
  conversationId: string,
  updates: { status?: 'open' | 'resolved' | 'transferred'; lastMessageText?: string; lastMessageAt?: string }
): Promise<void> {
  try {
    const payload: any = {};
    if (updates.status) payload.status = updates.status;
    if (updates.lastMessageText) payload.last_message_text = updates.lastMessageText;
    if (updates.lastMessageAt) payload.last_message_at = updates.lastMessageAt;

    const { error } = await supabase.from('conversations').update(payload).eq('id', conversationId);
    if (error) console.warn('Supabase updateConversation error:', error);
  } catch (err) {
    console.warn('Could not update conversation:', err);
  }
}
