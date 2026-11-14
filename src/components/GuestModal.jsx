import React, { useState } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { COLLABORATOR_COLORS, EDITORIAL_PSEUDONYMS } from '../lib/constants';
import { cn } from '../lib/utils';

export function GuestModal({ isOpen, onClose, userProfile, onSaveProfile }) {
  if (!isOpen) return null;

  const [name, setName] = useState(userProfile?.name || '');
  const [selectedColor, setSelectedColor] = useState(
    userProfile?.color || COLLABORATOR_COLORS[0].bg
  );

  const handleRandomize = () => {
    const randomName = EDITORIAL_PSEUDONYMS[Math.floor(Math.random() * EDITORIAL_PSEUDONYMS.length)];
    const randomColor = COLLABORATOR_COLORS[Math.floor(Math.random() * COLLABORATOR_COLORS.length)];
    setName(randomName);
    setSelectedColor(randomColor.bg);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const matchedColor =
      COLLABORATOR_COLORS.find((c) => c.bg === selectedColor) || COLLABORATOR_COLORS[0];

    onSaveProfile({
      ...userProfile,
      name: name.trim(),
      color: matchedColor.bg,
      colorName: matchedColor.name,
      textColor: matchedColor.text,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252720]/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white border border-[#E7E5DC] rounded-xl shadow-floating p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E5DC]">
          <div>
            <h2 className="text-base font-serif font-bold text-[#252720]">
              Collaborator Identity
            </h2>
            <p className="text-xs text-[#64685A] font-sans mt-0.5">
              Customize your signature presence in real-time document sessions.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#848879] hover:text-[#252720] hover:bg-[#F7F5EF] rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Display Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#252720] uppercase tracking-wider">
                Display Name
              </label>
              <button
                type="button"
                onClick={handleRandomize}
                className="text-[11px] text-[#343D2D] hover:text-[#252720] flex items-center gap-1 font-medium"
              >
                <Sparkles className="w-3 h-3 text-[#A5AE91]" />
                Randomize Pseudonym
              </button>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Virginia Woolf"
              className="w-full px-3 py-2 text-sm bg-[#F7F5EF] border border-[#E7E5DC] rounded-lg text-[#252720] placeholder-[#848879] focus:outline-none focus:border-[#343D2D] focus:ring-1 focus:ring-[#343D2D]/30"
              required
            />
          </div>

          {/* Color Palette Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#252720] uppercase tracking-wider mb-2">
              Signature Tone
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {COLLABORATOR_COLORS.map((c) => {
                const isSelected = selectedColor === c.bg;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c.bg)}
                    className={cn(
                      'flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all',
                      isSelected
                        ? 'border-[#252720] bg-[#F7F5EF] ring-1 ring-[#252720]'
                        : 'border-[#E7E5DC] hover:border-[#848879]'
                    )}
                  >
                    <span
                      className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: c.bg }}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </span>
                    <span className="text-xs font-sans text-[#494C40] truncate">
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview Badge */}
          <div className="p-3 bg-[#F7F5EF] border border-[#E7E5DC] rounded-lg flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: selectedColor }}
            >
              {name ? name.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <div className="text-xs font-semibold text-[#252720]">
                {name || 'Your Name'}
              </div>
              <div className="text-[10px] text-[#64685A] font-sans">
                Active live cursor & presence chip
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-[#64685A] hover:text-[#252720] font-medium rounded-lg hover:bg-[#F7F5EF]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium bg-[#343D2D] hover:bg-[#3D4835] text-white rounded-lg shadow-sm transition-all"
            >
              Save Identity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
