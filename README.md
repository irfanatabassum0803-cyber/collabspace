# CollabSpace

> An editorial-grade, real-time collaborative document workspace built with **React**, **Vite**, **Tailwind CSS**, **TipTap**, and **Supabase (PostgreSQL + Realtime)**.

Designed with an intentional editorial aesthetic: **warm ivory canvas**, **deep charcoal typography**, **muted olive accents**, hairline borders, and generous white space. CollabSpace steers clear of generic AI dashboard tropes, providing a serene and focused writing sanctuary.

---

## Features

- **Rich-Text TipTap Editor**: Headings (H1, H2, H3), bold, italic, underline, strikethrough, inline code, bullet lists, numbered lists, blockquotes, code blocks, horizontal dividers, and undo/redo with full keyboard shortcuts (`⌘B`, `⌘I`, `⌘U`, `⌘⌥1-3`, `⌘Z`, etc.).
- **Real-Time Keystroke Broadcast**: Keystrokes propagate between active browser sessions with minimal latency via Supabase Realtime Broadcast channels.
- **Collaborator Presence**: Live avatar stack displaying active co-writers viewing or editing the document with customizable editorial pseudonyms and signature color tones.
- **Debounced Auto-Save & Loop Prevention**: Changes are debounced (800ms) and committed safely to Supabase PostgreSQL. Incoming remote edits bypass the local save trigger to completely prevent infinite feedback loops and cursor jumping.
- **Full Document Management**:
  - Create new documents (`+ New Document` or `⌘N`).
  - Inline document renaming directly from the header or sidebar.
  - Delete documents with one-click confirmation.
  - Instant client-side document search.
  - Shareable URL routing (`?doc=<document_id>`) for direct links to shared documents.
- **Dual-Mode Engine**: Runs in full Supabase mode when credentials are configured, or gracefully falls back to local storage and native browser `BroadcastChannel` for multi-tab testing if keys have not yet been added.
- **Editorial Typography Toggle**: Easily switch between **Editorial Serif** (*Newsreader*) and **Clean Sans** (*Plus Jakarta Sans*).
- **Reading Statistics**: Live word counter, character count, and estimated reading time.
- **Responsive Workspace**: Collapsible sidebar for distraction-free writing across mobile and desktop.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 18](https://react.dev/) + [Vite 6](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) with `@tailwindcss/typography` |
| **Rich-Text Engine** | [TipTap 2](https://tiptap.dev/) (StarterKit, Placeholder, Underline, CharacterCount) |
| **Database** | [Supabase](https://supabase.com/) PostgreSQL (`documents` table with JSONB content) |
| **Realtime** | Supabase Realtime (Channels: Broadcast + Presence + Postgres Changes) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## Database Setup (Supabase)

### 1. Create a Supabase Project
If you don't already have one, create a free project at [supabase.com](https://supabase.com).

### 2. Run the SQL Migration
Navigate to your Supabase Dashboard, open the **SQL Editor**, and execute the following script (also provided in [`schema.sql`](./schema.sql)):

```sql
-- 1. Create the documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'Untitled Document',
    content JSONB NOT NULL DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Index for fast sorting
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON public.documents (updated_at DESC);

-- 3. Automatic updated_at trigger
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

-- 5. Open RLS policy for collaborative guest access
CREATE POLICY "Allow anonymous read access" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON public.documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON public.documents FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous delete access" ON public.documents FOR DELETE USING (true);

-- 6. Enable Realtime on the documents table
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
```

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your project credentials from your Supabase Dashboard under **Project Settings > API**:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Note**: You can also configure or test your Supabase connection directly inside the running application by clicking the database pill at the bottom of the sidebar.

---

## Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## Verifying Real-Time Collaboration

1. Open [http://localhost:5173](http://localhost:5173) in Window A.
2. Open the exact same link in Window B (or click **Share** in Window A and paste into Window B).
3. Customize your writer identity in Window B (click your name at the bottom of the sidebar).
4. Observe Window A's header update instantly with Window B's avatar presence.
5. Type text or format headings in Window A — watch Window B update in real time without cursor disruption or lag.
6. Rename the document in Window A — observe the header and sidebar update in Window B simultaneously.
