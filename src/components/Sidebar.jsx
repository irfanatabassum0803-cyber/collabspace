import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  Database,
  PanelLeftClose,
  ChevronRight,
} from 'lucide-react';
import { cn, formatRelativeTime } from '../lib/utils';

export function Sidebar({
  documents,
  activeDocId,
  onSelectDoc,
  onCreateDoc,
  onRenameDoc,
  onDeleteDoc,
  userProfile,
  onOpenProfileModal,
  onOpenSupabaseModal,
  isLiveSupabase,
  isOpen,
  onToggleSidebar,
}) {
  const [editingDocId, setEditingDocId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const filteredDocs = documents.filter((doc) =>
    (doc.title || 'Untitled Document').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartRename = (e, doc) => {
    e.stopPropagation();
    setEditingDocId(doc.id);
    setEditTitle(doc.title || 'Untitled Document');
  };

  const handleSaveRename = (e, docId) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameDoc(docId, editTitle.trim());
    }
    setEditingDocId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingDocId(null);
  };

  const handleDeleteClick = (e, docId) => {
    e.stopPropagation();
    if (confirmDeleteId === docId) {
      onDeleteDoc(docId);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(docId);
      setTimeout(() => {
        setConfirmDeleteId((curr) => (curr === docId ? null : curr));
      }, 3000);
    }
  };

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col w-72 bg-[#343D2D] text-[#F7F5EF] border-r border-[#2A3124] transition-transform duration-300 ease-in-out md:static md:translate-x-0 shadow-lg md:shadow-none select-none',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Polished Wordmark Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#3F4A37]/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#272E22] border border-[#A5AE91]/30 text-[#F7F5EF] flex items-center justify-center font-serif font-semibold text-base shadow-inner">
            <span className="translate-y-[-1px]">C</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-serif text-lg font-bold tracking-tight text-[#F7F5EF] leading-none">
                CollabSpace
              </h1>
              <span className="w-1.5 h-1.5 rounded-full bg-[#A5AE91]" />
            </div>
            <p className="text-[10px] font-sans text-[#A5AE91] tracking-widest uppercase font-medium mt-1">
              Editorial Studio
            </p>
          </div>
        </div>

        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-[#A5AE91] hover:text-[#F7F5EF] hover:bg-[#3F4A37] rounded-md md:hidden transition-colors"
          title="Close sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* New Document Button */}
      <div className="p-3.5 pb-2">
        <button
          onClick={() => onCreateDoc()}
          className="w-full flex items-center justify-center gap-2 py-2 px-3.5 bg-[#3E4936] hover:bg-[#46533D] active:bg-[#353E2E] text-[#F7F5EF] border border-[#526048] rounded-lg text-xs font-medium shadow-sm transition-all duration-150 active:scale-[0.98] group"
        >
          <Plus className="w-3.5 h-3.5 text-[#A5AE91] group-hover:text-white transition-colors" />
          <span>New Document</span>
          <span className="ml-auto text-[10px] text-[#A5AE91]/80 hidden sm:inline font-mono bg-[#2F3728] px-1.5 py-0.5 rounded border border-[#44503B]">
            ⌘N
          </span>
        </button>
      </div>

      {/* Minimalist Search Input */}
      <div className="px-3.5 py-1.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E977E]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#283023] border border-[#3E4936] rounded-md text-[#F7F5EF] placeholder-[#8E977E] focus:outline-none focus:border-[#A5AE91] focus:ring-1 focus:ring-[#A5AE91]/30 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8E977E] hover:text-[#F7F5EF] p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        <div className="px-2.5 py-1.5 text-[10px] font-semibold tracking-wider uppercase text-[#A5AE91] flex items-center justify-between">
          <span>Documents</span>
          <span className="text-[10px] font-mono bg-[#283023] text-[#A5AE91] px-1.5 py-0.5 rounded border border-[#3E4936]">
            {filteredDocs.length}
          </span>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-[#8E977E]">
            <p>No documents found</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-1.5 text-[#A5AE91] hover:text-[#F7F5EF] hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const isActive = doc.id === activeDocId;
            const isEditing = editingDocId === doc.id;

            return (
              <div
                key={doc.id}
                onClick={() => onSelectDoc(doc.id)}
                className={cn(
                  'group relative flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-xs transition-all duration-150',
                  isActive
                    ? 'bg-[#3F4A37] text-white font-medium border border-[#4E5C44] shadow-sm'
                    : 'text-[#CFD4C5] hover:bg-[#3A4533] hover:text-white'
                )}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                  {/* Subtle active accent indicator */}
                  {isActive ? (
                    <span className="w-1 h-3.5 bg-[#A5AE91] rounded-full shrink-0 animate-in fade-in duration-200" />
                  ) : (
                    <span className="w-1 h-3.5 bg-transparent shrink-0" />
                  )}

                  <FileText
                    className={cn(
                      'w-3.5 h-3.5 shrink-0 transition-colors',
                      isActive ? 'text-[#A5AE91]' : 'text-[#8E977E] group-hover:text-[#A5AE91]'
                    )}
                  />

                  {isEditing ? (
                    <div
                      className="flex items-center gap-1 w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(e, doc.id);
                          if (e.key === 'Escape') handleCancelRename(e);
                        }}
                        autoFocus
                        className="w-full px-1.5 py-0.5 text-xs bg-[#242C20] border border-[#A5AE91] rounded text-[#F7F5EF] focus:outline-none"
                      />
                      <button
                        onClick={(e) => handleSaveRename(e, doc.id)}
                        className="p-1 text-[#A5AE91] hover:text-white hover:bg-[#46533D] rounded"
                        title="Save"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={handleCancelRename}
                        className="p-1 text-[#8E977E] hover:text-white hover:bg-[#46533D] rounded"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="truncate flex-1">
                      <div className="truncate font-sans tracking-tight">
                        {doc.title || 'Untitled Document'}
                      </div>
                      <div className="text-[10px] text-[#8E977E] font-sans truncate mt-0.5">
                        {formatRelativeTime(doc.updated_at)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Hover Action Buttons */}
                {!isEditing && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => handleStartRename(e, doc)}
                      className="p-1 text-[#8E977E] hover:text-white hover:bg-[#4A5741] rounded transition-colors"
                      title="Rename document"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, doc.id)}
                      className={cn(
                        'p-1 rounded transition-colors',
                        confirmDeleteId === doc.id
                          ? 'text-white bg-[#8B3A2B]'
                          : 'text-[#8E977E] hover:text-white hover:bg-[#8B3A2B]/80'
                      )}
                      title={confirmDeleteId === doc.id ? 'Click again to confirm delete' : 'Delete document'}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer: User Profile & Supabase Status */}
      <div className="p-3 border-t border-[#3F4A37]/80 bg-[#2C3426]/70 space-y-2">
        {/* User Identity Card */}
        <button
          onClick={onOpenProfileModal}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-[#272F22] hover:bg-[#323D2B] border border-[#3E4936] text-left transition-colors group"
          title="Customize your identity"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ring-1 ring-[#A5AE91]/40 shadow-xs"
              style={{
                backgroundColor: userProfile?.color || '#44533F',
                color: userProfile?.textColor || '#FFFFFF',
              }}
            >
              {userProfile?.name?.charAt(0) || 'U'}
            </div>
            <div className="truncate min-w-0">
              <div className="text-xs font-medium text-[#F7F5EF] truncate">
                {userProfile?.name || 'Guest Writer'}
              </div>
              <div className="text-[10px] text-[#A5AE91]">Active Collaborator</div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#8E977E] group-hover:text-white shrink-0 transition-colors" />
        </button>

        {/* Database Connection Badge */}
        <button
          onClick={onOpenSupabaseModal}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-sans bg-[#272F22] hover:bg-[#323D2B] border border-[#3E4936] text-[#CFD4C5] transition-colors"
          title="Click to view database & real-time setup"
        >
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full inline-block',
                isLiveSupabase ? 'bg-[#A5AE91] animate-pulse' : 'bg-[#8E977E]'
              )}
            />
            <span className="font-medium text-[10px] tracking-wide">
              {isLiveSupabase ? 'Supabase Connected' : 'Local Multi-Tab Sync'}
            </span>
          </div>
          <Database className="w-3 h-3 text-[#8E977E]" />
        </button>
      </div>
    </aside>
  );
}
