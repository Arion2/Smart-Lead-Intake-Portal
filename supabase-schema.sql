-- Run this in your Supabase SQL Editor to create the leads table

CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  help_text TEXT NOT NULL,
  ai_summary TEXT NOT NULL DEFAULT '',
  ai_category TEXT NOT NULL DEFAULT 'Other',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for form submissions)
CREATE POLICY "Allow anon insert" ON leads
  FOR INSERT TO anon WITH CHECK (true);

-- Allow anonymous reads (for dashboard)
CREATE POLICY "Allow anon select" ON leads
  FOR SELECT TO anon USING (true);

-- Index for faster category filtering
CREATE INDEX leads_ai_category_idx ON leads (ai_category);
CREATE INDEX leads_created_at_idx ON leads (created_at DESC);
