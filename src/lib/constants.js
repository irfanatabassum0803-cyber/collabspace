// Collaborator Avatar Colors - Muted Editorial Tones
export const COLLABORATOR_COLORS = [
  { name: 'Olive', bg: '#44533F', text: '#F3F7F1', ring: 'ring-[#44533F]' },
  { name: 'Sage', bg: '#6C8364', text: '#FFFFFF', ring: 'ring-[#6C8364]' },
  { name: 'Terracotta', bg: '#B85338', text: '#FFFFFF', ring: 'ring-[#B85338]' },
  { name: 'Charcoal', bg: '#2F2E2B', text: '#F8F5EE', ring: 'ring-[#2F2E2B]' },
  { name: 'Ochre', bg: '#9E722C', text: '#FFFFFF', ring: 'ring-[#9E722C]' },
  { name: 'Slate', bg: '#485563', text: '#FFFFFF', ring: 'ring-[#485563]' },
  { name: 'Moss', bg: '#364F35', text: '#FFFFFF', ring: 'ring-[#364F35]' },
  { name: 'Wine', bg: '#6B3439', text: '#FFFFFF', ring: 'ring-[#6B3439]' },
];

export const EDITORIAL_PSEUDONYMS = [
  'Virginia Woolf',
  'Ernest Hemingway',
  'Maya Angelou',
  'James Baldwin',
  'Zadie Smith',
  'Gabriel García',
  'Simone de Beauvoir',
  'Italo Calvino',
  'Toni Morrison',
  'Jorge Luis Borges',
  'Joan Didion',
  'Haruki Murakami'
];

export const DEFAULT_DOC_CONTENT = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Start writing your story or draft here...'
        }
      ]
    }
  ]
};

export const INITIAL_WELCOME_DOC = {
  id: 'welcome-to-collabspace',
  title: 'Welcome to CollabSpace',
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'CollabSpace Editorial Studio' }]
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Welcome to ' },
          { type: 'text', marks: [{ type: 'bold' }], text: 'CollabSpace' },
          { type: 'text', text: ' — a real-time collaborative workspace crafted with an editorial sensibility. Designed with warm ivory paper, deep charcoal type, and muted olive accents.' }
        ]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Key Collaboration Capabilities' }]
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', marks: [{ type: 'bold' }], text: 'Real-time Keystroke Sync: ' },
                  { type: 'text', text: 'Open another browser window or tab. Edits appear instantly across all connected screens.' }
                ]
              }
            ]
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', marks: [{ type: 'bold' }], text: 'Collaborator Presence: ' },
                  { type: 'text', text: 'See who is viewing or editing this document in the top right avatar cluster.' }
                ]
              }
            ]
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', marks: [{ type: 'bold' }], text: 'Debounced Supabase Auto-Save: ' },
                  { type: 'text', text: 'Your text saves automatically after you pause typing, with robust loop prevention.' }
                ]
              }
            ]
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', marks: [{ type: 'bold' }], text: 'Rich-Text Formatting: ' },
                  { type: 'text', text: 'Use headings, quotes, bullet points, numbers, code blocks, and keyboard shortcuts.' }
                ]
              }
            ]
          }
        ]
      },
      {
        type: 'blockquote',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: '“Write freely, edit with precision, and collaborate in quiet harmony.”'
              }
            ]
          }
        ]
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Click the document title above to rename it, or click the “+ New” button in the sidebar to begin a fresh document.'
          }
        ]
      }
    ]
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const STORAGE_KEYS = {
  USER_PROFILE: 'collabspace_user_profile',
  ACTIVE_DOC_ID: 'collabspace_active_doc_id',
  LOCAL_DOCS: 'collabspace_local_documents',
  SUPABASE_CONFIG: 'collabspace_custom_supabase_config',
  FONT_PREFERENCE: 'collabspace_font_preference',
};
