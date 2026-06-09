/*
 * avro-suggest.js — browser loader/shim for the OFFICIAL OmicronLab Avro phonetic
 * suggestion stack (vendored from omicronlab/ibus-avro, MPL-1.1).
 *
 * The upstream files are GJS/GNOME modules: they declare top-level `var`s and pull
 * deps via `imports.<name>` and `imports.gi.{Gio,GLib}` (GNOME APIs). To run them
 * UNMODIFIED in a browser we:
 *   1. fetch each vendored file's source,
 *   2. evaluate it in its OWN function scope that exposes a fake `imports` registry
 *      (so e.g. dbsearch's `const db = imports.avrodict` resolves) and captures the
 *      module's exported symbol (its top-level var/function),
 *   3. stub `imports.gi.Gio/GLib` so the candidate-persistence code no-ops (we keep
 *      the user's last picks in localStorage instead).
 *
 * Exposes (async-ready):
 *   window.AvroSuggest.ready            → Promise resolving when the stack is loaded
 *   window.AvroSuggest.suggest(word)    → string[] of Bangla candidates for a Roman word
 *   window.AvroSuggest.commit(word,pick)→ remember the user's chosen candidate
 *   window.AvroPhonetic.parse(text)     → deterministic full transliteration (engine)
 *
 * Everything here is the genuine Avro data + algorithm; this file only bridges the
 * GJS module system to the browser. No OpenBangla, no external wordlist.
 */
(function (root) {
  'use strict';
  var BASE = (document.currentScript && document.currentScript.src || '')
    .replace(/avro-suggest\.js.*$/, '');   // dir this script lives in

  // localStorage-backed candidate memory (replaces GLib home-dir JSON file).
  var SEL_KEY = 'avro.candidateSelections';
  function loadSel() { try { return JSON.parse(localStorage.getItem(SEL_KEY) || '{}'); } catch (e) { return {}; } }
  function saveSel(o) { try { localStorage.setItem(SEL_KEY, JSON.stringify(o)); } catch (e) {} }

  // The fake `imports` registry the GJS modules read from. Filled as we load files.
  var imports = {
    gi: {
      // Minimal Gio/GLib stubs so suggestionbuilder's file persistence no-ops.
      Gio: { File: { new_for_path: function () { return { load_contents: function () { return [false]; }, replace_contents: function () {}, query_exists: function () { return false; } }; } } },
      GLib: { get_home_dir: function () { return ''; } },
    },
  };

  // Evaluate one vendored module's source in a scope where `imports` is our registry,
  // then return the named global it declared (top-level `var`/`function`).
  //
  // CRITICAL: these are GJS modules where `print()`/`printerr()` are built-in
  // console globals. In a browser, a bare `print()` resolves to window.print() and
  // OPENS THE NATIVE PRINT DIALOG (dbsearch.js calls print() in a debug path). We
  // shadow `print`/`printerr` with console loggers in the module's scope so those
  // calls log instead of printing — fixes the print dialog popping up during typing.
  var gjsPrint = function () { try { console.log.apply(console, arguments); } catch (e) {} };
  var gjsPrintErr = function () { try { console.warn.apply(console, arguments); } catch (e) {} };
  function evalModule(src, exportName) {
    // `src` declares e.g. `var db = …` / `var tables = …` / `var OmicronLab = …` /
    // `function levenshtein(){…}` / `function DBSearch(){…}` at top level. We run it
    // inside a Function whose params shadow `imports`, `print`, and `printerr`.
    var fn = new Function('imports', 'print', 'printerr',
      src + '\n;return (typeof ' + exportName + ' !== "undefined") ? ' + exportName + ' : undefined;');
    return fn(imports, gjsPrint, gjsPrintErr);
  }

  function fetchText(name) {
    return fetch(BASE + name, { cache: 'force-cache' }).then(function (r) {
      if (!r.ok) throw new Error('avro: failed to load ' + name + ' (' + r.status + ')');
      return r.text();
    });
  }

  // Load order respects deps: utf8, levenshtein, avrolib (engine), data files,
  // avroregexlib, dbsearch, autocorrect, suffixdict, then suggestionbuilder.
  var builder = null;
  var ready = (function () {
    var files = [
      ['utf8.js', 'utf8Decode'],
      ['levenshtein.js', 'levenshtein'],
      ['avrolib.js', 'OmicronLab'],
      ['avrodict.js', 'tables'],
      ['autocorrect.js', 'db'],
      ['suffixdict.js', 'db'],
      ['avroregexlib.js', 'AvroRegex'],
      ['dbsearch.js', 'DBSearch'],
      ['suggestionbuilder.js', 'SuggestionBuilder'],
    ];
    return files.reduce(function (chain, spec) {
      return chain.then(function () {
        return fetchText(spec[0]).then(function (src) {
          var sym = evalModule(src, spec[1]);
          // Register into the fake `imports` namespace the GJS files expect.
          switch (spec[0]) {
            // The vendored avrolib engine already returns proper UNICODE Bangla, so
            // the ibus-era utf8Decode (decodeURIComponent(escape(…))) would
            // DOUBLE-decode and throw "URI malformed". Override with identity.
            case 'utf8.js':            imports.utf8 = { utf8Decode: function (s) { return s; } }; break;
            case 'levenshtein.js':     imports.levenshtein = { levenshtein: sym }; break;
            case 'avrolib.js':         imports.avrolib = { OmicronLab: sym }; root.OmicronLab = sym; break;
            case 'avrodict.js':        imports.avrodict = { tables: sym, db: { tables: sym } }; break;
            case 'autocorrect.js':     imports.autocorrect = { db: sym }; break;
            case 'suffixdict.js':      imports.suffixdict = { db: sym }; break;
            case 'avroregexlib.js':    imports.avroregexlib = { AvroRegex: sym }; break;
            case 'dbsearch.js':        imports.dbsearch = { DBSearch: sym }; break;
            case 'suggestionbuilder.js': builder = new sym(); break;
          }
        });
      });
    }, Promise.resolve());
  })();

  // ── public API ──────────────────────────────────────────────────────────────
  var api = {
    ready: ready.then(function () { return true; }).catch(function (e) { console.error(e); return false; }),
    suggest: function (word) {
      if (!builder || !word) return [];
      try {
        var out = builder.suggest(word);
        // builder.suggest may return an array or an object with a `words` list.
        if (Array.isArray(out)) return out;
        if (out && Array.isArray(out.words)) return out.words;
        if (out && typeof out === 'object') return Object.values(out).filter(function (x) { return typeof x === 'string'; });
        return [];
      } catch (e) { console.error('avro suggest error', e); return []; }
    },
    commit: function (word, pick) {
      try { if (builder && builder.stringCommitted) builder.stringCommitted(word, pick); } catch (e) {}
      var sel = loadSel(); sel[word] = pick; saveSel(sel);
    },
  };
  root.AvroSuggest = api;

  // window.AvroPhonetic.parse — deterministic engine (kept for the input controller).
  ready.then(function () {
    var P = root.OmicronLab && root.OmicronLab.Avro && root.OmicronLab.Avro.Phonetic;
    root.AvroPhonetic = { parse: function (t) { try { return P ? P.parse(t) : t; } catch (e) { return t; } } };
  });
})(typeof window !== 'undefined' ? window : globalThis);
