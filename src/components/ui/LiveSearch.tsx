"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, Tag, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Result = {
  id: string;
  name: string;
  category: string;
  price: string;
  plan?: string;
  image: string;
  slug: string;
  type: 'product' | 'service';
};

type Props = {
  placeholder?: string;
  autoFocus?: boolean;
  onClose?: () => void;
};

export function LiveSearch({ placeholder = 'What are you looking for today?', autoFocus, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(-1);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-focus
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      if (!res.ok) throw new Error('Search failed');
      
      const searchResults = await res.json();
      
      setResults(searchResults);
      setOpen(true);
      setSelected(-1);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 280);
  };

  const navigate = (result: Result) => {
    setOpen(false);
    setQuery('');
    if (result.type === 'service') {
      router.push(`/services`);
    } else {
      router.push(`/products/${result.slug || result.id}`);
    }
    onClose?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected >= 0 && results[selected]) {
      navigate(results[selected]);
    } else if (query.trim()) {
      setOpen(false);
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      onClose?.();
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(s => Math.min(s + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(s => Math.max(s - 1, -1));
    } else if (e.key === 'Escape') {
      setOpen(false);
      setSelected(-1);
    }
  };

  const clear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full" style={{ isolation: 'auto' }}>
      <form onSubmit={handleSubmit} className="relative flex items-center w-full">
        {/* Left Icon: Search, Loader, or Clear */}
        <div className="absolute left-5 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
          {loading ? (
            <Loader2 className="h-5 w-5 text-[#24B86C] animate-spin pointer-events-none" />
          ) : query ? (
            <button
              type="button"
              onClick={clear}
              className="w-8 h-8 -ml-1.5 rounded-full hover:bg-zinc-100 flex items-center justify-center transition-colors"
              aria-label="Clear search"
            >
              <X className="h-5 w-5 text-[#6B7280]" />
            </button>
          ) : (
            <Search className="h-5 w-5 text-[#9CA3AF] pointer-events-none" />
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKey}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="w-full h-[64px] pl-14 pr-16 rounded-full border border-[#E2EDE8] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_50px_rgba(0,0,0,0.16)] text-[17px] text-[#111111] placeholder:text-zinc-400 focus:outline-none focus:border-[#24B86C]/40 focus:shadow-[0_20px_80px_rgba(36,184,108,0.16)] transition-all duration-500"
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
        />



        {/* Submit button — premium circular glowing button */}
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#24B86C] hover:bg-[#1fa35f] flex items-center justify-center shadow-[0_8px_20px_rgba(36,184,108,0.3)] hover:shadow-[0_12px_28px_rgba(36,184,108,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 z-10"
          aria-label="Search"
        >
          <Search className="h-5 w-5 text-white" />
        </button>
      </form>

      {/* ── Dropdown ── */}
      {open && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-[200] bg-white/95 backdrop-blur-2xl border border-[#E2EDE8] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden"
          role="listbox"
        >
          {/* Products */}
          {results.filter(r => r.type === 'product').length > 0 && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] px-4 pt-3 pb-1">
                Products
              </p>
              {results.filter(r => r.type === 'product').map((result, i) => {
                const idx = results.findIndex(r => r.id === result.id);
                return (
                  <button
                    key={result.id}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      selected === idx ? 'bg-[#F0F7F3]' : 'hover:bg-[#F8FAF9]'
                    }`}
                    onMouseEnter={() => setSelected(idx)}
                    onClick={() => navigate(result)}
                    role="option"
                    aria-selected={selected === idx}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#F8FAF9] border border-[#E2EDE8] shrink-0">
                      {result.image ? (
                        <Image src={result.image} alt={result.name} fill className="object-cover" sizes="40px" quality={60} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#9CA3AF]">
                          <Tag className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0D1A12] line-clamp-1">
                        {result.name}
                      </p>
                      <p className="text-xs text-[#9CA3AF] capitalize">{result.category}</p>
                    </div>
                    {/* Plan Badge */}
                    <div className="shrink-0 flex items-center justify-center">
                      <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-md border ${
                        result.plan === 'Pro' 
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                        : result.plan === 'Plus'
                          ? 'bg-gradient-to-r from-[#24B86C] to-[#11998E] text-white border-transparent shadow-sm'
                        : result.plan === 'Service'
                          ? 'bg-zinc-100 text-zinc-500 border-zinc-200'
                        : 'bg-white text-zinc-600 border-zinc-200 shadow-sm'
                      }`}>
                        {result.plan || 'Free'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {/* Services */}
          {results.filter(r => r.type === 'service').length > 0 && (
            <>
              <div className="mx-4 my-1 h-px bg-[#E2EDE8]" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] px-4 pt-1 pb-1">
                Services
              </p>
              {results.filter(r => r.type === 'service').map((result) => {
                const idx = results.findIndex(r => r.id === result.id);
                return (
                  <button
                    key={result.id}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      selected === idx ? 'bg-[#F0F7F3]' : 'hover:bg-[#F8FAF9]'
                    }`}
                    onMouseEnter={() => setSelected(idx)}
                    onClick={() => navigate(result)}
                    role="option"
                    aria-selected={selected === idx}
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#24B86C]/10 border border-[#24B86C]/20 flex items-center justify-center shrink-0">
                      <Tag className="w-4 h-4 text-[#24B86C]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0D1A12] line-clamp-1">{result.name}</p>
                      <p className="text-xs text-[#9CA3AF] capitalize">{result.category}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                  </button>
                );
              })}
            </>
          )}

          {/* Footer: view all */}
          <div className="border-t border-[#E2EDE8] px-4 py-2.5">
            <button
              onClick={() => {
                setOpen(false);
                router.push(`/products?search=${encodeURIComponent(query)}`);
                onClose?.();
              }}
              className="w-full flex items-center justify-between text-xs font-semibold text-[#24B86C] hover:text-[#11998E] transition-colors py-1"
            >
              <span>See all results for &quot;{query}&quot;</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* No results */}
      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-[200] bg-white/95 backdrop-blur-2xl border border-[#E2EDE8] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] px-4 py-6 text-center"
        >
          <p className="text-sm font-semibold text-[#0D1A12]">No results for &quot;{query}&quot;</p>
          <p className="text-xs text-[#9CA3AF] mt-1">Try a different keyword</p>
        </div>
      )}
    </div>
  );
}
