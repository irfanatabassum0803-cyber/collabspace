import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { COLLABORATOR_COLORS, EDITORIAL_PSEUDONYMS, STORAGE_KEYS } from './constants';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'doc_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 5) return 'just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getOrCreateUserProfile() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Error reading user profile from localStorage', e);
  }

  const randomName = EDITORIAL_PSEUDONYMS[Math.floor(Math.random() * EDITORIAL_PSEUDONYMS.length)];
  const randomColor = COLLABORATOR_COLORS[Math.floor(Math.random() * COLLABORATOR_COLORS.length)];
  const clientId = 'user_' + Math.random().toString(36).substring(2, 11);

  const profile = {
    id: clientId,
    name: randomName,
    color: randomColor.bg,
    colorName: randomColor.name,
    textColor: randomColor.text,
  };

  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.warn('Error saving user profile to localStorage', e);
  }

  return profile;
}

export function saveUserProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.warn('Error updating user profile', e);
  }
}

export function calculateReadingStats(editor) {
  if (!editor) return { words: 0, characters: 0, readTimeMinutes: 0 };
  const text = editor.getText();
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const readTimeMinutes = Math.ceil(words / 200); // Average 200 wpm
  return { words, characters, readTimeMinutes };
}
