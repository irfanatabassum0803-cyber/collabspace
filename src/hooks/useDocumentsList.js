import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { fallbackStorage } from '../lib/storageFallback';
import { DEFAULT_DOC_CONTENT, INITIAL_WELCOME_DOC, STORAGE_KEYS } from '../lib/constants';
import { generateId } from '../lib/utils';

export function useDocumentsList() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLiveSupabase, setIsLiveSupabase] = useState(isSupabaseConfigured());

  // Fetch all documents
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data, error: fetchErr } = await supabase
          .from('documents')
          .select('id, title, created_at, updated_at')
          .order('updated_at', { ascending: false });

        if (fetchErr) {
          console.warn('Supabase fetch error, using local fallback:', fetchErr.message);
          setError(fetchErr.message);
          setDocuments(fallbackStorage.getDocuments());
          setIsLiveSupabase(false);
        } else {
          setIsLiveSupabase(true);
          // If Supabase table is completely empty, insert welcome doc
          if (!data || data.length === 0) {
            const initialDoc = {
              title: INITIAL_WELCOME_DOC.title,
              content: INITIAL_WELCOME_DOC.content,
            };
            const { data: inserted, error: insertErr } = await supabase
              .from('documents')
              .insert([initialDoc])
              .select('id, title, created_at, updated_at')
              .single();

            if (!insertErr && inserted) {
              setDocuments([inserted]);
            } else {
              setDocuments([]);
            }
          } else {
            setDocuments(data);
          }
        }
      } catch (err) {
        console.error('Error querying Supabase documents:', err);
        setError(err.message || 'Failed to connect to Supabase');
        setDocuments(fallbackStorage.getDocuments());
        setIsLiveSupabase(false);
      }
    } else {
      setIsLiveSupabase(false);
      setDocuments(fallbackStorage.getDocuments());
    }

    setIsLoading(false);
  }, []);

  // Subscribe to real-time changes in documents list
  useEffect(() => {
    fetchDocuments();

    const supabase = getSupabaseClient();
    let channel = null;
    let unsubscribeFallback = null;

    if (supabase) {
      // Listen to postgres changes on documents table
      channel = supabase
        .channel('public:documents_list')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'documents' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setDocuments((prev) => {
                const exists = prev.some((d) => d.id === payload.new.id);
                if (exists) return prev;
                return [{ id: payload.new.id, title: payload.new.title, created_at: payload.new.created_at, updated_at: payload.new.updated_at }, ...prev];
              });
            } else if (payload.eventType === 'UPDATE') {
              setDocuments((prev) =>
                prev.map((d) =>
                  d.id === payload.new.id
                    ? { ...d, title: payload.new.title, updated_at: payload.new.updated_at }
                    : d
                ).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
              );
            } else if (payload.eventType === 'DELETE') {
              setDocuments((prev) => prev.filter((d) => d.id !== payload.old.id));
            }
          }
        )
        .subscribe();
    }

    // Always listen to fallback broadcast channel for cross-tab communication
    unsubscribeFallback = fallbackStorage.subscribe((message) => {
      if (message.type === 'DOC_CREATED') {
        setDocuments((prev) => {
          if (prev.some((d) => d.id === message.payload.id)) return prev;
          return [message.payload, ...prev];
        });
      } else if (message.type === 'DOC_UPDATED') {
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === message.payload.id
              ? { ...d, ...message.payload }
              : d
          ).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        );
      } else if (message.type === 'DOC_DELETED') {
        setDocuments((prev) => prev.filter((d) => d.id !== message.payload.id));
      }
    });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      if (unsubscribeFallback) {
        unsubscribeFallback();
      }
    };
  }, [fetchDocuments]);

  // Create a new document
  const createDocument = useCallback(async (customTitle) => {
    const title = customTitle || 'Untitled Document';
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data, error: insertErr } = await supabase
          .from('documents')
          .insert([
            {
              title,
              content: DEFAULT_DOC_CONTENT,
            },
          ])
          .select('id, title, created_at, updated_at')
          .single();

        if (insertErr) {
          console.error('Supabase create error:', insertErr);
          throw insertErr;
        }

        setDocuments((prev) => [data, ...prev]);
        return data;
      } catch (err) {
        console.warn('Falling back to local document creation:', err);
      }
    }

    // Fallback local creation
    const newDoc = fallbackStorage.createDocument({
      id: generateId(),
      title,
      content: DEFAULT_DOC_CONTENT,
    });
    setDocuments((prev) => [newDoc, ...prev]);
    return newDoc;
  }, []);

  // Rename a document
  const renameDocument = useCallback(async (id, newTitle) => {
    if (!newTitle.trim()) return;
    const trimmedTitle = newTitle.trim();

    // Optimistic UI update
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, title: trimmedTitle, updated_at: new Date().toISOString() } : d))
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error: updateErr } = await supabase
          .from('documents')
          .update({ title: trimmedTitle, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (updateErr) throw updateErr;
      } catch (err) {
        console.warn('Error renaming in Supabase:', err);
      }
    }

    // Fallback store
    fallbackStorage.updateDocument(id, { title: trimmedTitle });
    fallbackStorage.broadcast({
      type: 'DOC_UPDATED',
      payload: { id, title: trimmedTitle, updated_at: new Date().toISOString() }
    });
  }, []);

  // Delete a document
  const deleteDocument = useCallback(async (id) => {
    // Optimistic update
    setDocuments((prev) => prev.filter((d) => d.id !== id));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error: delErr } = await supabase.from('documents').delete().eq('id', id);
        if (delErr) throw delErr;
      } catch (err) {
        console.warn('Error deleting in Supabase:', err);
      }
    }

    fallbackStorage.deleteDocument(id);
  }, []);

  // Filtered documents by search query
  const filteredDocuments = documents.filter((doc) =>
    (doc.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    documents: filteredDocuments,
    allDocuments: documents,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    isLiveSupabase,
    fetchDocuments,
    createDocument,
    renameDocument,
    deleteDocument,
  };
}
