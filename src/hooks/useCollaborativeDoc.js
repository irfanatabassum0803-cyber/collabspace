import { useState, useEffect, useRef, useCallback } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import { fallbackStorage } from '../lib/storageFallback';
import { DEFAULT_DOC_CONTENT } from '../lib/constants';

export function useCollaborativeDoc(docId, userProfile) {
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'unsaved' | 'error'
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [editorInstance, setEditorInstance] = useState(null);

  // References to prevent cyclic loops & handle debounced save
  const isRemoteUpdate = useRef(false);
  const saveTimeoutRef = useRef(null);
  const pendingContentRef = useRef(null);
  const channelRef = useRef(null);
  const lastBroadcastContentStr = useRef('');

  // 1. Load initial document content
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setSaveStatus('saved');

    async function loadDocument() {
      if (!docId) {
        setIsLoading(false);
        return;
      }

      const supabase = getSupabaseClient();
      let docData = null;

      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('id', docId)
            .single();

          if (!error && data) {
            docData = data;
          }
        } catch (err) {
          console.warn('Could not fetch from Supabase, checking fallback storage', err);
        }
      }

      if (!docData) {
        docData = fallbackStorage.getDocument(docId) || {
          id: docId,
          title: 'Untitled Document',
          content: DEFAULT_DOC_CONTENT,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      if (isMounted) {
        setDocument(docData);
        setLastSavedAt(new Date(docData.updated_at || Date.now()));
        setIsLoading(false);

        // If TipTap editor is already mounted, load the content
        if (editorInstance && !editorInstance.isDestroyed) {
          isRemoteUpdate.current = true;
          editorInstance.commands.setContent(docData.content || DEFAULT_DOC_CONTENT, false);
          isRemoteUpdate.current = false;
        }
      }
    }

    loadDocument();

    return () => {
      isMounted = false;
    };
  }, [docId, editorInstance]);

  // 2. Set up Realtime Channel (Broadcast & Presence)
  useEffect(() => {
    if (!docId || !userProfile) return;

    const supabase = getSupabaseClient();
    let channel = null;
    let fallbackUnsub = null;
    let presenceHeartbeatInterval = null;

    if (supabase) {
      // Supabase Realtime Channel
      const channelName = `doc_room:${docId}`;
      channel = supabase.channel(channelName, {
        config: {
          broadcast: { self: false },
          presence: { key: userProfile.id },
        },
      });

      // A. Presence synchronization
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const activeUsers = [];
          for (const key in state) {
            const presences = state[key];
            if (presences && presences.length > 0) {
              const p = presences[presences.length - 1];
              activeUsers.push({
                id: key,
                ...p.user,
                isSelf: key === userProfile.id,
              });
            }
          }
          setCollaborators(activeUsers);
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          // Additional join event handler
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          // Additional leave event handler
        });

      // B. Broadcast: Snappy keystroke synchronization
      channel.on('broadcast', { event: 'doc_change' }, ({ payload }) => {
        if (!payload || payload.senderId === userProfile.id) return;

        if (editorInstance && !editorInstance.isDestroyed && payload.content) {
          const currentContentStr = JSON.stringify(editorInstance.getJSON());
          const incomingContentStr = JSON.stringify(payload.content);

          if (currentContentStr !== incomingContentStr) {
            // Flag to prevent onUpdate loop
            isRemoteUpdate.current = true;
            editorInstance.commands.setContent(payload.content, false);
            isRemoteUpdate.current = false;
            setSaveStatus('saved');
          }
        }

        if (payload.title) {
          setDocument((prev) => (prev ? { ...prev, title: payload.title } : prev));
        }
      });

      // Subscribe and track presence
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user: userProfile,
            onlineAt: new Date().toISOString(),
          });
        }
      });

      channelRef.current = channel;
    }

    // Always maintain local BroadcastChannel sync for multi-tab testing
    const broadcastPresence = () => {
      fallbackStorage.broadcast({
        type: 'PRESENCE_PING',
        docId,
        user: { ...userProfile, isSelf: false },
      });
    };

    // Initial ping & periodic heartbeat
    broadcastPresence();
    presenceHeartbeatInterval = setInterval(broadcastPresence, 4000);

    fallbackUnsub = fallbackStorage.subscribe((data) => {
      // Local broadcast doc_change
      if (data.type === 'DOC_CHANGE' && data.docId === docId) {
        if (data.senderId === userProfile.id) return;

        if (editorInstance && !editorInstance.isDestroyed && data.content) {
          const currentContentStr = JSON.stringify(editorInstance.getJSON());
          const incomingContentStr = JSON.stringify(data.content);

          if (currentContentStr !== incomingContentStr) {
            isRemoteUpdate.current = true;
            editorInstance.commands.setContent(data.content, false);
            isRemoteUpdate.current = false;
            setSaveStatus('saved');
          }
        }
        if (data.title) {
          setDocument((prev) => (prev ? { ...prev, title: data.title } : prev));
        }
      }

      // Local fallback presence update
      if (data.type === 'PRESENCE_PING' && data.docId === docId) {
        setCollaborators((prev) => {
          const filtered = prev.filter((c) => c.id !== data.user.id);
          const selfUser = { id: userProfile.id, ...userProfile, isSelf: true };
          return [selfUser, ...filtered, data.user];
        });
      }
    });

    // Ensure self is in collaborator list
    setCollaborators([{ id: userProfile.id, ...userProfile, isSelf: true }]);

    return () => {
      if (channel) {
        channel.untrack();
        supabase.removeChannel(channel);
        channelRef.current = null;
      }
      if (fallbackUnsub) {
        fallbackUnsub();
      }
      if (presenceHeartbeatInterval) {
        clearInterval(presenceHeartbeatInterval);
      }
    };
  }, [docId, userProfile, editorInstance]);

  // 3. Database persistence function (debounced)
  const persistToDatabase = useCallback(async (contentToSave, titleToSave) => {
    if (!docId) return;

    try {
      const supabase = getSupabaseClient();
      const nowIso = new Date().toISOString();

      if (supabase) {
        const { error } = await supabase
          .from('documents')
          .update({
            content: contentToSave,
            ...(titleToSave ? { title: titleToSave } : {}),
            updated_at: nowIso,
          })
          .eq('id', docId);

        if (error) {
          console.error('Supabase save error:', error);
          setSaveStatus('error');
          return;
        }
      }

      // Always update local storage fallback
      fallbackStorage.updateDocument(docId, {
        content: contentToSave,
        ...(titleToSave ? { title: titleToSave } : {}),
      });

      setSaveStatus('saved');
      setLastSavedAt(new Date());
    } catch (err) {
      console.error('Failed to save document:', err);
      setSaveStatus('error');
    }
  }, [docId]);

  // 4. Handle TipTap editor content updates
  const handleEditorUpdate = useCallback((editor) => {
    // If update was triggered by a remote peer sync, skip broadcast & save pipeline!
    if (isRemoteUpdate.current) {
      return;
    }

    const jsonContent = editor.getJSON();
    const contentStr = JSON.stringify(jsonContent);

    // Skip if unchanged
    if (contentStr === lastBroadcastContentStr.current) {
      return;
    }

    lastBroadcastContentStr.current = contentStr;
    pendingContentRef.current = jsonContent;
    setSaveStatus('saving');

    // A. Broadcast immediately to peers for instant snappy typing sync!
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'doc_change',
        payload: {
          docId,
          content: jsonContent,
          senderId: userProfile.id,
        },
      });
    }

    // B. Also send over fallback BroadcastChannel for local tab testing
    fallbackStorage.broadcast({
      type: 'DOC_CHANGE',
      docId,
      content: jsonContent,
      senderId: userProfile.id,
    });

    // C. Debounce database save (800ms)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      persistToDatabase(jsonContent, document?.title);
    }, 800);
  }, [docId, userProfile, document?.title, persistToDatabase]);

  // 5. Update Title
  const updateTitle = useCallback((newTitle) => {
    if (!docId || newTitle === document?.title) return;

    setDocument((prev) => (prev ? { ...prev, title: newTitle } : prev));
    setSaveStatus('saving');

    // Broadcast title change
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'doc_change',
        payload: {
          docId,
          title: newTitle,
          senderId: userProfile.id,
        },
      });
    }

    fallbackStorage.broadcast({
      type: 'DOC_CHANGE',
      docId,
      title: newTitle,
      senderId: userProfile.id,
    });

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const currentContent = editorInstance ? editorInstance.getJSON() : document?.content;
      persistToDatabase(currentContent, newTitle);
    }, 500);
  }, [docId, userProfile, document, editorInstance, persistToDatabase]);

  // Manual save trigger if needed
  const forceSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    const currentContent = editorInstance ? editorInstance.getJSON() : document?.content;
    persistToDatabase(currentContent, document?.title);
  }, [editorInstance, document, persistToDatabase]);

  return {
    document,
    isLoading,
    saveStatus,
    lastSavedAt,
    collaborators,
    setEditorInstance,
    handleEditorUpdate,
    updateTitle,
    forceSave,
  };
}
