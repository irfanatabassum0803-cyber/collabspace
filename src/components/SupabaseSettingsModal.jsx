import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  getSupabaseConfig,
  isSupabaseConfigured,
  saveCustomSupabaseConfig,
  testSupabaseConnection,
} from '../lib/supabase';
import { cn } from '../lib/utils';

export function SupabaseSettingsModal({ isOpen, onClose, onConfigUpdated }) {
  if (!isOpen) return null;

  const currentConfig = getSupabaseConfig();
  const isConfigured = isSupabaseConfigured();

  const [url, setUrl] = useState(currentConfig.url || '');
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const sampleSql = `-- Run this in your Supabase SQL Editor:
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  title text not null default 'Untitled Document',
  content jsonb default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.documents enable row level security;

create policy "Allow all public access for documents"
  on public.documents for all using (true) with check (true);

alter publication supabase_realtime add table public.documents;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sampleSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleTest = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({ success: false, error: 'Please enter both Supabase URL and Anon Key.' });
      return;
    }
    setTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(url.trim(), anonKey.trim());
    setTesting(false);
    setTestResult(res);
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveCustomSupabaseConfig(url.trim(), anonKey.trim());
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      if (onConfigUpdated) onConfigUpdated();
      onClose();
    }, 1000);
  };

  const handleReset = () => {
    saveCustomSupabaseConfig('', '');
    const envConfig = getSupabaseConfig();
    setUrl(envConfig.url || '');
    setAnonKey(envConfig.anonKey || '');
    setTestResult(null);
    if (onConfigUpdated) onConfigUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252720]/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white border border-[#E7E5DC] rounded-xl shadow-floating p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E5DC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#343D2D] text-[#F7F5EF] flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#252720]">
                Supabase & Realtime Configuration
              </h2>
              <p className="text-xs text-[#64685A] font-sans mt-0.5">
                Connect your PostgreSQL database and Realtime channel.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#848879] hover:text-[#252720] hover:bg-[#F7F5EF] rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Status Box */}
        <div
          className={cn(
            'p-3.5 rounded-lg border text-xs flex items-start gap-3',
            isConfigured
              ? 'bg-[#F3F5F0] border-[#C7CEB8] text-[#343D2D]'
              : 'bg-[#F7F5EF] border-[#E7E5DC] text-[#494C40]'
          )}
        >
          {isConfigured ? (
            <CheckCircle2 className="w-4 h-4 text-[#343D2D] shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-[#64685A] shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-semibold text-[#252720]">
              {isConfigured
                ? 'Supabase Integration Active'
                : 'Running in Local Multi-Tab Demo Mode'}
            </div>
            <p className="mt-0.5 text-[#64685A] leading-relaxed">
              {isConfigured
                ? 'Your documents are persisting to Supabase PostgreSQL and broadcasting changes over Supabase Realtime.'
                : 'You can collaborate in real-time across multiple tabs in this browser right now! To save permanently to PostgreSQL across devices, enter your Supabase project credentials below.'}
            </p>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#252720] uppercase tracking-wider mb-1">
              Project URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full px-3 py-2 text-xs font-mono bg-[#F7F5EF] border border-[#E7E5DC] rounded-lg text-[#252720] placeholder-[#848879] focus:outline-none focus:border-[#343D2D] focus:ring-1 focus:ring-[#343D2D]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#252720] uppercase tracking-wider mb-1">
              Anon Public API Key
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 text-xs font-mono bg-[#F7F5EF] border border-[#E7E5DC] rounded-lg text-[#252720] placeholder-[#848879] focus:outline-none focus:border-[#343D2D] focus:ring-1 focus:ring-[#343D2D]/30"
            />
          </div>

          {/* Test connection feedback */}
          {testResult && (
            <div
              className={cn(
                'p-2.5 rounded-lg text-xs flex items-center gap-2 border',
                testResult.success
                  ? 'bg-[#F3F5F0] border-[#C7CEB8] text-[#343D2D]'
                  : 'bg-[#FBECE8] border-[#F5C7BD] text-[#B85338]'
              )}
            >
              {testResult.success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#343D2D] shrink-0" />
                  <span>Connection successful! `documents` table is accessible.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-[#B85338] shrink-0" />
                  <span className="truncate">Error: {testResult.error}</span>
                </>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="px-3 py-1.5 text-xs text-[#494C40] border border-[#E7E5DC] rounded-lg hover:bg-[#F7F5EF] flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('w-3 h-3', testing && 'animate-spin')} />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 text-xs text-[#848879] hover:text-[#252720]"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-medium bg-[#343D2D] hover:bg-[#3D4835] text-white rounded-lg shadow-sm transition-all"
              >
                {saveSuccess ? 'Saved & Reconnected!' : 'Save & Connect'}
              </button>
            </div>
          </div>
        </form>

        {/* Database Migration helper */}
        <div className="pt-3 border-t border-[#E7E5DC] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#252720] uppercase tracking-wider">
              SQL Schema Quick Setup
            </span>
            <button
              onClick={handleCopySql}
              className="text-[11px] text-[#343D2D] hover:text-[#252720] flex items-center gap-1 font-medium"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3 h-3 text-[#343D2D]" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[#A5AE91]" />
                  Copy SQL Script
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-[#64685A] font-sans leading-relaxed">
            Need to setup your Supabase database? Copy and paste the schema script into your
            Supabase dashboard under <strong>SQL Editor</strong>. It creates the <code>documents</code> table, RLS policies, and enables Realtime.
          </p>
        </div>
      </div>
    </div>
  );
}
