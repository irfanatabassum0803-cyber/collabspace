import React, { useState, useEffect } from 'react';
import {
  PanelLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Share2,
  Type,
  BookOpen,
  Settings,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';
import { cn } from '../lib/utils';

export function EditorHeader({
  title,
  onUpdateTitle,
  saveStatus,
  lastSavedAt,
  collaborators = [],
  userProfile,
  onToggleSidebar,
  onOpenSettings,
  isSerifFont,
  onToggleFont,
  readingStats,
  onCopyShareLink,
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title || 'Untitled Document');
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    setLocalTitle(title || 'Untitled Document');
  }, [title]);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (localTitle.trim() && localTitle.trim() !== title) {
      onUpdateTitle(localTitle.trim());
    }
  };

  const otherCollaborators = collaborators.filter((c) => !c.isSelf);

  return (
    <header className="sticky top-0 z-20 bg-[#F7F5EF] border-b border-[#E7E5DC] px-4 sm:px-6 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left: Sidebar Toggle, Workspace Breadcrumbs & Editable Title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 text-[#64685A] hover:text-[#252720] hover:bg-[#E7E5DC]/60 rounded-md transition-colors"
            title="Toggle sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Breadcrumbs Navigation */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#848879] shrink-0 font-medium select-none">
            <span className="hover:text-[#252720] transition-colors cursor-default">Workspace</span>
            <ChevronRight className="w-3 h-3 text-[#A3A698]" />
            <span className="hover:text-[#252720] transition-colors cursor-default">Documents</span>
            <ChevronRight className="w-3 h-3 text-[#A3A698]" />
          </div>

          {/* Editable Document Title */}
          <div className="min-w-0 flex-1 max-w-md">
            {isEditingTitle ? (
              <input
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSubmit();
                  if (e.key === 'Escape') {
                    setLocalTitle(title);
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                className="w-full text-sm sm:text-base font-serif font-semibold text-[#252720] bg-white border border-[#343D2D] rounded px-2 py-0.5 focus:outline-none shadow-xs"
              />
            ) : (
              <div
                onClick={() => setIsEditingTitle(true)}
                className="group flex items-center gap-1 cursor-pointer py-0.5 -mx-1 px-1 rounded hover:bg-[#E7E5DC]/50 transition-colors"
                title="Click to rename document"
              >
                <h1 className="text-sm sm:text-base font-serif font-semibold text-[#252720] truncate tracking-tight">
                  {title || 'Untitled Document'}
                </h1>
                <span className="text-[10px] text-[#A3A698] opacity-0 group-hover:opacity-100 transition-opacity font-sans ml-1">
                  edit
                </span>
              </div>
            )}
          </div>

          {/* Subtle Saving/Saved Status Pill */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#64685A] pl-2 border-l border-[#E7E5DC]">
            {saveStatus === 'saving' && (
              <div className="flex items-center gap-1.5 text-[#343D2D] bg-[#E7E5DC]/50 px-2 py-0.5 rounded-full border border-[#D5D2C5]">
                <Loader2 className="w-3 h-3 animate-spin text-[#343D2D]" />
                <span className="font-sans text-[11px] font-medium">Saving...</span>
              </div>
            )}
            {saveStatus === 'saved' && (
              <div
                className="flex items-center gap-1.5 text-[#64685A] bg-[#FFFFFF] px-2 py-0.5 rounded-full border border-[#E7E5DC] shadow-xs cursor-default"
                title={lastSavedAt ? `Saved at ${new Date(lastSavedAt).toLocaleTimeString()}` : 'All changes saved'}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#343D2D]" />
                <span className="font-sans text-[11px] font-medium text-[#494C40]">Saved</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center gap-1.5 text-[#B85338] bg-[#FBECE8] px-2 py-0.5 rounded-full border border-[#F5C7BD]" title="Auto-save failed. Check database connection.">
                <AlertCircle className="w-3 h-3 text-[#B85338]" />
                <span className="font-sans text-[11px] font-medium">Save error</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Collaborator Avatars & Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Active Collaborators Presence Stack */}
          <div className="flex items-center pl-1">
            <div className="flex items-center -space-x-1.5 overflow-hidden py-0.5">
              {/* Current user */}
              <div
                key={userProfile?.id}
                className="relative group z-10"
                title={`${userProfile?.name || 'You'} (You)`}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ring-2 ring-[#F7F5EF] shadow-sm cursor-default transition-transform hover:scale-105"
                  style={{
                    backgroundColor: userProfile?.color || '#343D2D',
                    color: userProfile?.textColor || '#FFFFFF',
                  }}
                >
                  {userProfile?.name?.charAt(0) || 'Y'}
                </div>
                {/* Tooltip */}
                <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-30">
                  <div className="bg-[#252720] text-[#F7F5EF] text-[10px] font-sans px-2 py-0.5 rounded shadow-md whitespace-nowrap">
                    {userProfile?.name} (You)
                  </div>
                </div>
              </div>

              {/* Other collaborators */}
              {otherCollaborators.slice(0, 4).map((collab, index) => (
                <div
                  key={collab.id || index}
                  className="relative group"
                  style={{ zIndex: 9 - index }}
                  title={collab.name || 'Collaborator'}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ring-2 ring-[#F7F5EF] shadow-sm cursor-default transition-transform hover:scale-105"
                    style={{
                      backgroundColor: collab.color || '#A5AE91',
                      color: collab.textColor || '#FFFFFF',
                    }}
                  >
                    {collab.name?.charAt(0) || 'C'}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-30">
                    <div className="bg-[#252720] text-[#F7F5EF] text-[10px] font-sans px-2 py-0.5 rounded shadow-md whitespace-nowrap">
                      {collab.name}
                    </div>
                  </div>
                </div>
              ))}

              {otherCollaborators.length > 4 && (
                <div
                  className="w-7 h-7 rounded-full bg-[#E7E5DC] text-[#494C40] flex items-center justify-center text-[10px] font-bold ring-2 ring-[#F7F5EF] shadow-xs"
                  title={`${otherCollaborators.length - 4} more collaborators`}
                >
                  +{otherCollaborators.length - 4}
                </div>
              )}
            </div>
          </div>

          <div className="h-4 w-[1px] bg-[#E7E5DC] mx-0.5" />

          {/* Reading Stats Popover */}
          <div className="relative">
            <button
              onClick={() => setShowStats(!showStats)}
              className={cn(
                'p-1.5 rounded-md transition-colors text-[#64685A] hover:text-[#252720] hover:bg-[#E7E5DC]/60',
                showStats && 'bg-[#E7E5DC] text-[#252720]'
              )}
              title="Reading statistics"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {showStats && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E7E5DC] rounded-xl shadow-paper p-3.5 z-30 text-xs animate-in fade-in duration-100">
                <div className="font-semibold text-[#252720] mb-2 font-serif text-sm">
                  Document Statistics
                </div>
                <div className="space-y-1.5 text-[#64685A] font-sans">
                  <div className="flex justify-between">
                    <span>Words:</span>
                    <span className="font-mono font-medium text-[#252720]">
                      {readingStats?.words || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Characters:</span>
                    <span className="font-mono font-medium text-[#252720]">
                      {readingStats?.characters || 0}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-[#E7E5DC]">
                    <span>Reading Time:</span>
                    <span className="font-mono font-medium text-[#343D2D]">
                      ~{readingStats?.readTimeMinutes || 1} min
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Serif vs Sans Typography Switcher */}
          <button
            onClick={onToggleFont}
            className={cn(
              'px-2 py-1 text-xs rounded-md border border-[#E7E5DC] transition-all flex items-center gap-1.5 shadow-xs',
              isSerifFont
                ? 'bg-white text-[#252720] font-serif font-semibold border-[#D5D2C5]'
                : 'bg-transparent text-[#64685A] font-sans hover:bg-white hover:text-[#252720]'
            )}
            title={`Switch to ${isSerifFont ? 'Clean Sans' : 'Editorial Serif'}`}
          >
            <Type className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isSerifFont ? 'Serif' : 'Sans'}</span>
          </button>

          {/* Share Action Button */}
          <button
            onClick={onCopyShareLink}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-white hover:bg-[#F0ECE3] border border-[#E7E5DC] text-[#252720] rounded-md transition-all shadow-xs active:scale-95"
            title="Copy link to collaborate"
          >
            <Share2 className="w-3.5 h-3.5 text-[#343D2D]" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Database Settings Action */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 text-[#64685A] hover:text-[#252720] hover:bg-[#E7E5DC]/60 rounded-md transition-colors"
            title="Database & Studio Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
