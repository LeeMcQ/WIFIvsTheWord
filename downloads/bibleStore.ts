/**
 * bibleStore.ts — read the bundled Bible fully offline.
 * Wi-Fi vs The Word
 *
 * The JSON written by prepare-bible.mjs lives in src/assets/bible/ and is bundled
 * into the app. We fetch it from the app's OWN origin (web assets packaged in the
 * binary), so there is no network dependency — it works in airplane mode. Parsed
 * data is cached in memory; books load lazily so startup stays instant.
 *
 * For very large libraries or full-text search at scale, swap the JSON for
 * @capacitor-community/sqlite (bundle a prebuilt .db and query it) — same API below.
 *
 * Place at: src/lib/bibleStore.ts
 */

export type Translation = "kjv" | "web";
export interface BookInfo { name: string; chapters: number }

type BibleData = Record<string, string[][]>; // book -> chapter -> verses[]

const cache: Partial<Record<Translation, BibleData>> = {};
let booksIndex: BookInfo[] | null = null;

// import.meta.env.BASE_URL respects Vite's base path; assets are served from the bundle.
const base = (typeof import.meta !== "undefined" && (import.meta as any).env?.BASE_URL) || "/";
const asset = (file: string) => `${base}assets/bible/${file}`.replace(/\/+/g, "/");

async function loadJSON<T>(file: string): Promise<T> {
  const res = await fetch(asset(file));         // served from the app bundle → offline
  if (!res.ok) throw new Error(`bible asset missing: ${file}`);
  return res.json();
}

/** All 66 books with their chapter counts (for navigation). */
export async function listBooks(): Promise<BookInfo[]> {
  if (booksIndex) return booksIndex;
  booksIndex = await loadJSON<BookInfo[]>("books.json");
  return booksIndex;
}

async function getData(t: Translation): Promise<BibleData> {
  if (cache[t]) return cache[t]!;
  cache[t] = await loadJSON<BibleData>(`${t}.json`);
  return cache[t]!;
}

export async function chapterCount(book: string, t: Translation = "kjv"): Promise<number> {
  const data = await getData(t);
  return data[book]?.length ?? 0;
}

/** Verses of a chapter (1-indexed chapter). Returns [] if absent. */
export async function getChapter(book: string, chapter: number, t: Translation = "kjv"): Promise<string[]> {
  const data = await getData(t);
  return data[book]?.[chapter - 1] ?? [];
}

/** Simple offline keyword search. Returns up to `limit` hits. */
export async function search(query: string, t: Translation = "kjv", limit = 50) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const data = await getData(t);
  const hits: { book: string; chapter: number; verse: number; text: string }[] = [];
  for (const book of Object.keys(data)) {
    const chapters = data[book];
    for (let ci = 0; ci < chapters.length; ci++) {
      const verses = chapters[ci];
      for (let vi = 0; vi < verses.length; vi++) {
        if (verses[vi].toLowerCase().includes(q)) {
          hits.push({ book, chapter: ci + 1, verse: vi + 1, text: verses[vi] });
          if (hits.length >= limit) return hits;
        }
      }
    }
  }
  return hits;
}

/** Optional: warm the cache (e.g., on first launch) so later reads are instant. */
export async function preload(t: Translation = "kjv") { await getData(t); await listBooks(); }
