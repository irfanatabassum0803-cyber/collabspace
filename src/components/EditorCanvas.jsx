import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Underline from '@tiptap/extension-underline';
import { EditorToolbar } from './EditorToolbar';
import { cn } from '../lib/utils';
import { DEFAULT_DOC_CONTENT } from '../lib/constants';

export function EditorCanvas({
  initialContent,
  onUpdate,
  onEditorReady,
  isLoading,
  isSerifFont,
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'Begin writing your story, draft, or notes...',
      }),
      CharacterCount,
    ],
    content: initialContent || DEFAULT_DOC_CONTENT,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-neutral max-w-none focus:outline-none min-h-[580px]',
          isSerifFont ? 'font-serif' : 'font-sans'
        ),
      },
    },
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        onUpdate(editor);
      }
    },
  });

  // Notify parent component when editor is ready
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Update editor font class when toggle changes
  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          attributes: {
            class: cn(
              'prose prose-neutral max-w-none focus:outline-none min-h-[580px]',
              isSerifFont ? 'font-serif' : 'font-sans'
            ),
          },
        },
      });
    }
  }, [isSerifFont, editor]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-start py-12 px-4 sm:px-8 bg-[#F7F5EF]">
        <div className="w-full max-w-3xl bg-white border border-[#E7E5DC] rounded-xl shadow-paper p-8 sm:p-14 md:p-20 animate-pulse space-y-6">
          <div className="h-9 bg-[#E7E5DC] rounded w-2/5" />
          <div className="space-y-3 pt-6">
            <div className="h-4 bg-[#EFEFEA] rounded w-full" />
            <div className="h-4 bg-[#EFEFEA] rounded w-11/12" />
            <div className="h-4 bg-[#EFEFEA] rounded w-4/5" />
          </div>
          <div className="space-y-3 pt-8">
            <div className="h-6 bg-[#E7E5DC] rounded w-1/3" />
            <div className="h-4 bg-[#EFEFEA] rounded w-full" />
            <div className="h-4 bg-[#EFEFEA] rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#F7F5EF]">
      {/* Sticky Top Formatting Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Editorial Document Paper Workspace */}
      <main className="flex-1 py-10 sm:py-14 px-4 sm:px-8 md:px-12 flex justify-center">
        <div className="w-full max-w-3xl bg-white border border-[#E7E5DC] rounded-xl shadow-paper p-8 sm:p-14 md:p-20 transition-all duration-300">
          <EditorContent editor={editor} />
        </div>
      </main>
    </div>
  );
}
