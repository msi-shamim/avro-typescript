/**
 * Type definitions for the Avro Phonetic browser stack.
 *
 * These describe the runtime surface exposed by `vendor/avro-suggest.js` once it has loaded
 * the OmicronLab Avro engine + dictionary (see CREDITS.md). The engine/data are MPL-1.1 work
 * by OmicronLab; only these types + the wrapper are original to this repo.
 */

/** Deterministic phonetic transliteration engine (jsAvroPhonetic). */
export interface AvroPhonetic {
  /** Transliterate Roman text → Bangla deterministically. Returns the input unchanged on error. */
  parse(text: string): string;
}

/** Candidate-suggestion stack (ibus-avro), bridged to the browser. */
export interface AvroSuggest {
  /** Resolves once the engine + dictionary have finished loading. */
  ready: Promise<void>;
  /** Bangla candidate strings for a single Roman word (best first). */
  suggest(word: string): string[];
  /** Remember the user's chosen candidate for a word (persisted in localStorage). */
  commit(word: string, pick: string): void;
}

declare global {
  interface Window {
    AvroPhonetic?: AvroPhonetic;
    AvroSuggest?: AvroSuggest;
  }
}

export {};
