/**
 * avro-typescript — a small, typed wrapper around the OmicronLab Avro Phonetic engine + suggestion
 * stack for the browser.
 *
 * Credit: the transliteration engine, regex/rule tables, and dictionary are MPL-1.1 work by
 * OmicronLab (jsAvroPhonetic / ibus-avro). See CREDITS.md. This wrapper only loads the vendored
 * stack and exposes a clean, promise-based, typed API.
 *
 * Usage (browser/bundler):
 *   import { loadAvro } from 'avro-typescript';
 *   const avro = await loadAvro({ basePath: '/avro/' });   // dir that serves the vendor/*.js files
 *   avro.parse('ami banglay gan gai');     // → "আমি বাংলায় গান গাই"
 *   avro.suggest('bangla');                // → ["বাংলা", "বঙলা", ...]
 *   avro.commit('bangla', 'বাংলা');         // remember the user's pick
 */
import type { AvroPhonetic, AvroSuggest } from './avro';

export interface AvroOptions {
  /** URL/dir that serves the vendored avro JS files (avro-suggest.js, avrolib.js, …). Default: '/avro/'. */
  basePath?: string;
  /** Provide an explicit document (defaults to the global document). For non-default mount points. */
  doc?: Document;
}

export interface Avro {
  /** Deterministic Roman → Bangla transliteration. */
  parse(text: string): string;
  /** Bangla candidate strings for a single Roman word (best first). */
  suggest(word: string): string[];
  /** Remember the user's chosen candidate for a word. */
  commit(word: string, pick: string): void;
}

let _loading: Promise<Avro> | null = null;

function injectScript(doc: Document, src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = doc.querySelector<HTMLScriptElement>(`script[data-avro="${src}"]`);
    if (existing) { resolve(); return; }
    const s = doc.createElement('script');
    s.src = src;
    s.async = true;
    s.dataset.avro = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`avro-typescript: failed to load ${src}`));
    doc.head.appendChild(s);
  });
}

/**
 * Load the Avro stack and return a typed, ready-to-use API. Idempotent (loads once).
 * Browser-only — it injects vendor/avro-suggest.js, which loads the engine + dictionary.
 */
export async function loadAvro(opts: AvroOptions = {}): Promise<Avro> {
  if (_loading) return _loading;
  _loading = (async () => {
    if (typeof window === 'undefined') throw new Error('avro-typescript: loadAvro() is browser-only');
    const doc = opts.doc || document;
    const base = (opts.basePath || '/avro/').replace(/\/?$/, '/');
    await injectScript(doc, `${base}avro-suggest.js`);
    const w = window as Window & { AvroSuggest?: AvroSuggest; AvroPhonetic?: AvroPhonetic };
    if (!w.AvroSuggest) throw new Error('avro-typescript: AvroSuggest did not initialize');
    await w.AvroSuggest.ready;
    return {
      parse: (text: string) => (w.AvroPhonetic ? w.AvroPhonetic.parse(text) : text),
      suggest: (word: string) => w.AvroSuggest!.suggest(word) || [],
      commit: (word: string, pick: string) => w.AvroSuggest!.commit(word, pick),
    };
  })();
  return _loading;
}

export type { AvroPhonetic, AvroSuggest } from './avro';
