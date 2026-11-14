import { createClient } from '@supabase/supabase-js';
import { STORAGE_KEYS } from './constants';

let supabaseInstance = null;
let currentConfig = null;

export function getSupabaseConfig() {
  // 1. Check local storage override first (allows testing in-app without server restart)
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return {
          url: parsed.url.trim(),
          anonKey: parsed.anonKey.trim(),
          source: 'localStorage'
        };
      }
    }
  } catch (e) {
    console.warn('Error reading supabase config from storage', e);
  }

  // 2. Read from environment variables
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  return {
    url: envUrl,
    anonKey: envKey,
    source: 'env'
  };
}

export function isSupabaseConfigured() {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) return false;
  if (config.url.includes('your-project.supabase.co')) return false;
  if (config.anonKey.includes('your-anon-key-here')) return false;

  try {
    const parsedUrl = new URL(config.url);
    return parsedUrl.protocol.startsWith('http');
  } catch {
    return false;
  }
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const config = getSupabaseConfig();
  if (
    supabaseInstance &&
    currentConfig &&
    currentConfig.url === config.url &&
    currentConfig.anonKey === config.anonKey
  ) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(config.url, config.anonKey, {
      realtime: {
        params: {
          eventsPerSecond: 15,
        },
      },
    });
    currentConfig = config;
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}

export function saveCustomSupabaseConfig(url, anonKey) {
  try {
    if (!url || !anonKey) {
      localStorage.removeItem(STORAGE_KEYS.SUPABASE_CONFIG);
    } else {
      localStorage.setItem(
        STORAGE_KEYS.SUPABASE_CONFIG,
        JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() })
      );
    }
    // Invalidate cached client
    supabaseInstance = null;
    currentConfig = null;
    return true;
  } catch (e) {
    console.error('Error saving custom Supabase config:', e);
    return false;
  }
}

export async function testSupabaseConnection(url, anonKey) {
  try {
    const testClient = createClient(url, anonKey);
    const { data, error } = await testClient.from('documents').select('id').limit(1);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message || 'Unknown network error' };
  }
}
