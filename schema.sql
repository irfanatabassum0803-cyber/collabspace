-- ==============================================================================
-- CollabSpace - Supabase PostgreSQL Database Schema
-- Run this script in your Supabase project's SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

-- 1. Create the documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'Untitled Document',
    content JSONB NOT NULL DEFAULT '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Welcome to your new document..."}]}]}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Index for faster query and sorting by updated_at
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON public.documents (updated_at DESC);

-- 3. Automatically maintain updated_at on record change
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_documents_updated_at ON public.documents;
CREATE TRIGGER set_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 5. Create open RLS policy for collaborative guest & authenticated access
CREATE POLICY "Allow anonymous read access"
    ON public.documents FOR SELECT
    USING (true);

CREATE POLICY "Allow anonymous insert access"
    ON public.documents FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow anonymous update access"
    ON public.documents FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anonymous delete access"
    ON public.documents FOR DELETE
    USING (true);

-- 6. Enable Supabase Realtime publication on documents table
-- This enables postgres_changes listening in the client application.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'documents'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
    END IF;
END $$;

-- 7. Insert an initial welcome document if table is empty
INSERT INTO public.documents (id, title, content)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Welcome to CollabSpace',
    '{
      "type": "doc",
      "content": [
        {
          "type": "heading",
          "attrs": { "level": 1 },
          "content": [{ "type": "text", "text": "CollabSpace Editorial Studio" }]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "Welcome to " },
            { "type": "text", "marks": [{ "type": "bold" }], "text": "CollabSpace" },
            { "type": "text", "text": " — an editorial-grade real-time document workspace engineered for clarity, focus, and effortless collaboration." }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "How Real-Time Collaboration Works" }]
        },
        {
          "type": "bulletList",
          "content": [
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    { "type": "text", "marks": [{ "type": "bold" }], "text": "Instant Keystroke Broadcast: " },
                    { "type": "text", "text": "Open this document in another tab or share your link. Every stroke propagates instantly across sessions." }
                  ]
                }
              ]
            },
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    { "type": "text", "marks": [{ "type": "bold" }], "text": "Presence & Awareness: " },
                    { "type": "text", "text": "Notice collaborator avatars in the header showing who is actively viewing or editing." }
                  ]
                }
              ]
            },
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    { "type": "text", "marks": [{ "type": "bold" }], "text": "Debounced Persistence: " },
                    { "type": "text", "text": "Changes are debounced and safely committed to PostgreSQL with loop prevention." }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "Begin editing by selecting any text, or use the top toolbar to style your writing." }
          ]
        }
      ]
    }'::jsonb
)
ON CONFLICT (id) DO NOTHING;
