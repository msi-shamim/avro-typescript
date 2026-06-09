# avro-typescript

A small, **typed TypeScript wrapper** around the **Avro Phonetic** Bangla transliteration engine and
suggestion stack — ready to drop into a modern web app.

> **Credit where it's due.** The transliteration engine, regex/rule tables, and dictionary are the
> work of **[OmicronLab](https://www.omicronlab.com)** (*jsAvroPhonetic* and *[ibus-avro](https://github.com/omicronlab/ibus-avro)*),
> distributed under the **Mozilla Public License 1.1**. This repository **republishes that work
> unmodified** (with its original MPL-1.1 headers intact) and adds only a browser loader, a clean
> promise-based API, and TypeScript types. **Full credit and copyright for the Avro engine and data
> belongs to OmicronLab.** See [CREDITS.md](./CREDITS.md).

## What this gives you

- ✅ **Transliteration** — Roman → Bangla, deterministically (`parse`)
- ✅ **Suggestions** — Bangla candidate words for a Roman word (`suggest`)
- ✅ **Learning** — remember the user's chosen candidate (`commit`, persisted in `localStorage`)
- ✅ **Types** — full TypeScript definitions, promise-based loader

## Install

```bash
npm install avro-typescript
```

The vendored engine + dictionary live in `src/vendor/`. Serve those `*.js` files from a static path
(e.g. copy `src/vendor/*` to your app's `/public/avro/`), then point `basePath` at that URL.

## Usage

```ts
import { loadAvro } from 'avro-typescript';

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

## License

**Mozilla Public License 1.1 (MPL-1.1)** — the same license as the Avro Phonetic source this builds
on. See [LICENSE](./LICENSE) and [CREDITS.md](./CREDITS.md). The vendored files retain their original
OmicronLab MPL-1.1 headers.

## Acknowledgements

Built on the excellent work of **OmicronLab** and the Avro community:
- [OmicronLab](https://www.omicronlab.com) — Avro Keyboard / jsAvroPhonetic
- [omicronlab/ibus-avro](https://github.com/omicronlab/ibus-avro) — the suggestion stack

If you're an original author and want attribution adjusted, please open an issue.
