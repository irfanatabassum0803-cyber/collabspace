import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { EditorHeader } from './components/EditorHeader';
import { EditorCanvas } from './components/EditorCanvas';
import { GuestModal } from './components/GuestModal';
import { SupabaseSettingsModal } from './components/SupabaseSettingsModal';
import { Toast } from './components/Toast';
import { useDocumentsList } from './hooks/useDocumentsList';
import { useCollaborativeDoc } from './hooks/useCollaborativeDoc';
import {
  getOrCreateUserProfile,
  saveUserProfile,
  calculateReadingStats,
} from './lib/utils';
import { STORAGE_KEYS } from './lib/constants';

export default function App() {
  // 1. User Identity & Collaboration Profile
  const [userProfile, setUserProfile] = useState(() => getOrCreateUserProfile());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // 2. Sidebar & UI Layout State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSerifFont, setIsSerifFont] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.FONT_PREFERENCE) !== 'sans';
  });

  // 3. Toast Notifications State
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 3200);
  }, []);

  // 4. Documents List Hook
  const {
    documents,
    allDocuments,
    createDocument,
    renameDocument,
    deleteDocument,
    isLiveSupabase,
    fetchDocuments,
  } = useDocumentsList();

  // 5. Active Document ID with URL synchronization
  const [activeDocId, setActiveDocId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const docFromUrl = params.get('doc');
    if (docFromUrl) return docFromUrl;

    const savedDocId = localStorage.getItem(STORAGE_KEYS.ACTIVE_DOC_ID);
    return savedDocId || null;
  });

  // When documents list loads and no active doc is set, pick the first document
  useEffect(() => {
    if (!activeDocId && allDocuments.length > 0) {
      const firstDocId = allDocuments[0].id;
      setActiveDocId(firstDocId);
    }
  }, [activeDocId, allDocuments]);

  // Sync active document to URL and localStorage
  const handleSelectDoc = useCallback((id) => {
    setActiveDocId(id);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_DOC_ID, id);
    const url = new URL(window.location);
    url.searchParams.set('doc', id);
    window.history.pushState({}, '', url);

    // On mobile screens, collapse sidebar after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  // 6. Collaborative Document Hook for Active Document
  const {
    document: activeDoc,
    isLoading: isDocLoading,
    saveStatus,
    lastSavedAt,
    collaborators,
    setEditorInstance,
    handleEditorUpdate,
    updateTitle,
  } = useCollaborativeDoc(activeDocId, userProfile);

  // Reference to editor instance for stats calculation
  const [editorRef, setEditorRef] = useState(null);

  const handleEditorReady = useCallback(
    (editor) => {
      setEditorRef(editor);
      setEditorInstance(editor);
    },
    [setEditorInstance]
  );

  const readingStats = useMemo(() => {
    return calculateReadingStats(editorRef);
  }, [editorRef, activeDoc?.content, saveStatus]);

  // 7. Document Creation Action
  const handleCreateDocument = useCallback(async () => {
    try {
      const newDoc = await createDocument('Untitled Document');
      if (newDoc && newDoc.id) {
        handleSelectDoc(newDoc.id);
        showToast('Created new document', 'success');
      }
    } catch (err) {
      showToast('Failed to create document', 'error');
    }
  }, [createDocument, handleSelectDoc, showToast]);

  // 8. Document Renaming Action
  const handleRenameDocument = useCallback(
    (id, newTitle) => {
      renameDocument(id, newTitle);
      if (id === activeDocId) {
        updateTitle(newTitle);
      }
      showToast('Document renamed', 'info');
    },
    [activeDocId, renameDocument, updateTitle, showToast]
  );

  // 9. Document Deletion Action
  const handleDeleteDocument = useCallback(
    (id) => {
      deleteDocument(id);
      showToast('Document deleted', 'info');

      // If deleted doc was currently active, switch to next available
      if (id === activeDocId) {
        const remaining = allDocuments.filter((d) => d.id !== id);
        if (remaining.length > 0) {
          handleSelectDoc(remaining[0].id);
        } else {
          setActiveDocId(null);
        }
      }
    },
    [activeDocId, allDocuments, deleteDocument, handleSelectDoc, showToast]
  );

  // 10. Copy Share Link Action
  const handleCopyShareLink = useCallback(() => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('Collaboration link copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy link', 'error');
    });
  }, [showToast]);

  // 11. Profile Update Handler
  const handleSaveProfile = useCallback((newProfile) => {
    setUserProfile(newProfile);
    saveUserProfile(newProfile);
    showToast(`Identity updated to ${newProfile.name}`, 'success');
  }, [showToast]);

  // 12. Font Toggle Handler
  const handleToggleFont = useCallback(() => {
    setIsSerifFont((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.FONT_PREFERENCE, next ? 'serif' : 'sans');
      return next;
    });
  }, []);

  // 13. Global Keyboard Shortcuts (Cmd+N / Ctrl+N to create document)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleCreateDocument();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCreateDocument]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7F5EF] text-[#252720] font-sans selection:bg-[#DEE3D4] selection:text-[#252720]">
      {/* Left Sidebar */}
      <Sidebar
        documents={documents}
        activeDocId={activeDocId}
        onSelectDoc={handleSelectDoc}
        onCreateDoc={handleCreateDocument}
        onRenameDoc={handleRenameDocument}
        onDeleteDoc={handleDeleteDocument}
        userProfile={userProfile}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        isLiveSupabase={isLiveSupabase}
        isOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <EditorHeader
          title={activeDoc?.title || 'Untitled Document'}
          onUpdateTitle={updateTitle}
          saveStatus={saveStatus}
          lastSavedAt={lastSavedAt}
          collaborators={collaborators}
          userProfile={userProfile}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenSettings={() => setIsSupabaseModalOpen(true)}
          isSerifFont={isSerifFont}
          onToggleFont={handleToggleFont}
          readingStats={readingStats}
          onCopyShareLink={handleCopyShareLink}
        />

        {/* TipTap Rich Text Editor Canvas */}
        <EditorCanvas
          key={activeDocId} // Remounts cleanly when switching document
          initialContent={activeDoc?.content}
          onUpdate={handleEditorUpdate}
          onEditorReady={handleEditorReady}
          isLoading={isDocLoading}
          isSerifFont={isSerifFont}
        />
      </div>

      {/* Guest / User Profile Customizer Modal */}
      <GuestModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Supabase & Realtime Settings / SQL Modal */}
      <SupabaseSettingsModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigUpdated={() => {
          fetchDocuments();
          showToast('Supabase configuration updated', 'info');
        }}
      />

      {/* Floating Feedback Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
