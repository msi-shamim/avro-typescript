# @msishamim/avro

A **framework-agnostic, TypeScript-typed wrapper** that bundles the **complete** OmicronLab Avro
Phonetic stack — the transliteration **engine + the full dictionary + the suggestion stack** — and
makes it usable in any modern web app with a clean promise-based API.

> **Credit where it's due.** The transliteration engine, regex/rule tables, dictionary, and
> suggestion stack are the work of **[OmicronLab](https://www.omicronlab.com)**
> (*jsAvroPhonetic* and *[ibus-avro](https://github.com/omicronlab/ibus-avro)*), distributed under
> the **Mozilla Public License 1.1**. This repository **republishes that work unmodified** (with its
> original MPL-1.1 headers intact) and adds only a browser loader, a clean promise-based API, and
> TypeScript types. **Full credit and copyright for the Avro engine and data belongs to OmicronLab.**
> See [CREDITS.md](./CREDITS.md).

## 🚀 Live demo

Try Avro typing in your browser: **https://msi-shamim.github.io/avro-typescript/** — toggle Avro on and type Bangla phonetically.

## What this gives you

- ✅ **Transliteration** — Roman → Bangla, deterministically (`parse`)
- ✅ **Suggestions** — Bangla candidate words for a Roman word (`suggest`)
- ✅ **Learning** — remember the user's chosen candidate (`commit`, persisted in `localStorage`)
- ✅ **Types** — full TypeScript definitions, promise-based loader

## What makes this one different

Avro phonetic typing **is** available on npm in several forms (see [below](#see-also)) — this isn't
the only option, and it isn't "the first." Where this package differs:

- **The complete OmicronLab stack, bundled.** Most packages ship only the transliteration *engine*
  (`parse`). This one also includes the **genuine OmicronLab dictionary (≈7 MB)** and the full
  **suggestion stack** (`dbsearch` / `suggestionbuilder` / `autocorrect` / `suffixdict`), so
  `suggest()` and `commit()` work out of the box — not just transliteration.
- **Framework-agnostic.** No React (or any framework) dependency — `loadAvro()` works anywhere:
  vanilla JS, Vue, Svelte, Angular, or React.
- **Faithful republication.** The original OmicronLab files are vendored **unmodified** with their
  **MPL-1.1 headers intact** and explicit attribution ([CREDITS.md](./CREDITS.md)).

If you only need transliteration, or you specifically want a React hook/component, one of the
alternatives below may suit you better.

## Install

```bash
npm install @msishamim/avro
```

The vendored engine + dictionary live in `src/vendor/`. Serve those `*.js` files from a static path
(e.g. copy `src/vendor/*` to your app's `/public/avro/`), then point `basePath` at that URL.

## Usage

```ts
import { loadAvro } from '@msishamim/avro';

// basePath = the URL/dir that serves the vendored avro JS files (avro-suggest.js, avrolib.js, …)
const avro = await loadAvro({ basePath: '/avro/' });

avro.parse('ami banglay gan gai');   // → "আমি বাংলায় গান গাই"
avro.suggest('bangla');              // → ["বাংলা", "বঙলা", …]
avro.commit('bangla', 'বাংলা');       // remember the user's pick
```

## API

| Method | Returns | Description |
|---|---|---|
| `loadAvro(opts?)` | `Promise<Avro>` | Loads the stack once (idempotent). Browser-only. |
| `avro.parse(text)` | `string` | Deterministic Roman → Bangla transliteration. |
| `avro.suggest(word)` | `string[]` | Bangla candidates for a single Roman word (best first). |
| `avro.commit(word, pick)` | `void` | Persist the user's chosen candidate. |

`AvroOptions`: `{ basePath?: string /* default '/avro/' */, doc?: Document }`.

## How it works

`src/vendor/avro-suggest.js` is a thin browser shim (derived from `ibus-avro`) that evaluates the
upstream GJS/GNOME Avro modules **unmodified** — stubbing the GNOME `imports`/`Gio`/`GLib` APIs and
keeping the user's candidate picks in `localStorage` instead of a home-directory file. The engine
(`avrolib.js`, `avroregexlib.js`) and the dictionary (`avrodict.js`) are OmicronLab's, untouched.

## See also

Other Avro / Bangla phonetic packages on npm — credit to their authors. Pick whatever fits your needs:

- [`avro-phonetic`](https://www.npmjs.com/package/avro-phonetic) — JS implementation of jsAvroPhonetic (transliteration).
- [`@subhesadek/avro-phonetic`](https://www.npmjs.com/package/@subhesadek/avro-phonetic) — TS/JS Avro Phonetic transliteration.
- [`nodejs-avro-phonetic`](https://www.npmjs.com/package/nodejs-avro-phonetic) — Node implementation.
- [`avro-bangla-engine`](https://www.npmjs.com/package/avro-bangla-engine) + [`avro-bangla-suggestions`](https://www.npmjs.com/package/avro-bangla-suggestions) — engine + a React hook for suggestions.
- [`@blooomstech/react-avro-phonetic`](https://www.npmjs.com/package/@blooomstech/react-avro-phonetic) — a React component for phonetic typing.

This package's niche: **framework-agnostic + the complete OmicronLab dictionary & suggestion stack
bundled**, with faithful MPL-1.1 republication. If you only need transliteration, or a React-specific
integration, one of the above may be a better fit.

## License

**Mozilla Public License 1.1 (MPL-1.1)** — the same license as the Avro Phonetic source this builds
on. See [LICENSE](./LICENSE) and [CREDITS.md](./CREDITS.md). The vendored files retain their original
OmicronLab MPL-1.1 headers.

## Acknowledgements

Built on the excellent work of **OmicronLab** and the Avro community:
- [OmicronLab](https://www.omicronlab.com) — Avro Keyboard / jsAvroPhonetic
- [omicronlab/ibus-avro](https://github.com/omicronlab/ibus-avro) — the suggestion stack

If you're an original author and want attribution adjusted, please open an issue.
