# Credits & Attribution

This project republishes and builds a TypeScript wrapper around the **Avro Phonetic**
Bangla transliteration engine and dictionary. **All of the genuine Avro algorithm and
data is the work of the original authors below — this repository only adds packaging,
a browser/GJS bridge, and TypeScript types on top.** Full credit and copyright for the
core engine and dictionary belongs to them.

## Original works this project is built on

### 1. jsAvroPhonetic — the phonetic engine
- **Files:** `src/vendor/avrolib.js`, `src/vendor/avroregexlib.js`
- **Original Code:** *jsAvroPhonetic*
- **Initial Developer / Copyright:** © **OmicronLab** — <https://www.omicronlab.com>
- **License:** **Mozilla Public License 1.1 (MPL-1.1)** — these files retain their original
  MPL-1.1 headers, unmodified.
- The `OmicronLab.Avro.Phonetic` engine and its regex/rule tables are entirely OmicronLab's work.

### 2. ibus-avro — the suggestion stack
- **File:** `src/vendor/avro-suggest.js` is a thin browser **loader/shim** vendored from
  **omicronlab/ibus-avro** — <https://github.com/omicronlab/ibus-avro>
- **License:** **MPL-1.1**
- The upstream files are GJS/GNOME modules; this shim evaluates them **unmodified** in the
  browser (stubbing the `imports` / `imports.gi.{Gio,GLib}` GNOME APIs and persisting the
  user's candidate picks in `localStorage` instead of a home-dir JSON file). The suggestion
  algorithm and behavior are OmicronLab's; the shim only bridges the module system.

### 3. The Avro dictionary + suggestion stack
- **Files:** `src/vendor/avrodict.js` (Bangla word/candidate tables), plus the suggestion modules
  `dbsearch.js`, `suggestionbuilder.js`, `autocorrect.js`, `suffixdict.js`, `utf8.js`.
- **Copyright:** © **OmicronLab**, distributed under **MPL-1.1** (the suggestion modules carry the
  same MPL-1.1 headers as the engine).

### 4. Damerau–Levenshtein distance
- **File:** `src/vendor/levenshtein.js` — a JavaScript implementation of Damerau–Levenshtein distance,
  used by the suggestion ranking. Originally from a public snippet
  (<http://www.dzone.com/snippets/javascript-implementation>). Credit to its original author(s).

## Project home
- **Avro Keyboard / OmicronLab:** <https://www.omicronlab.com>
- **OmicronLab on GitHub:** <https://github.com/omicronlab>

## What is original to THIS repository
Only the following are new work by the maintainer of this repo:
- the TypeScript wrapper + type definitions (`src/index.ts`, `src/avro.d.ts`),
- the packaging (build config, README, examples),
- the browser loader shim (`avro-suggest.js`), itself derived from ibus-avro.

Everything else — the transliteration engine, the regex/rule sets, and the dictionary —
**is the Avro Phonetic work by OmicronLab**, used here under MPL-1.1 with gratitude.

> If you are an original Avro author and would like attribution changed, added, or this
> republication adjusted, please open an issue — credit and compliance are the goal.
