CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  company_name text,
  plan text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS chatbots (
  id text PRIMARY KEY,
  tenant_id text,
  name text,
  welcome_message text,
  primary_color text,
  position text,
  avatar_url text,
  suggested_prompts jsonb DEFAULT '[]'::jsonb,
  custom_system_prompt text,
  collect_user_email boolean DEFAULT true,
  kb_urls jsonb DEFAULT '[]'::jsonb,
  kb_faqs jsonb DEFAULT '[]'::jsonb,
  kb_docs jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS conversations (
  id text PRIMARY KEY,
  chatbot_id text REFERENCES chatbots(id) ON DELETE CASCADE,
  tenant_id text,
  visitor_id text,
  customer_name text,
  customer_email text,
  status text,
  last_message_text text,
  last_message_at timestamp with time zone,
  unread_for_tenant boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS messages (
  id text PRIMARY KEY,
  conversation_id text REFERENCES conversations(id) ON DELETE CASCADE,
  chatbot_id text REFERENCES chatbots(id) ON DELETE CASCADE,
  tenant_id text,
  sender text,
  text text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
