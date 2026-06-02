#!/usr/bin/env node
/**
 * prepare-bible.mjs — bundle the full Bible INTO the app for offline use.
 * Wi-Fi vs The Word
 *
 * Run once at build time (or whenever you refresh translations):
 *     node scripts/prepare-bible.mjs
 *
 * It downloads public-domain KJV + World English Bible, normalises them to a
 * compact shape, and writes them into src/assets/bible/. Capacitor bundles
 * everything under the web dir INTO the app binary, so the files ship on the
 * device and are read with zero network — true offline, even in airplane mode.
 *
 * Output:
 *   src/assets/bible/kjv.json   { "Genesis": [ ["v1","v2",...], ...chapters ], ... }
 *   src/assets/bible/web.json
 *   src/assets/bible/books.json [ { name, chapters } ]   (navigation index)
 *
 * Both KJV and WEB are public domain. Verify the source repo's text before ship.
 * Swap SOURCES for any source you trust; the normaliser handles the two common
 * JSON shapes (per-book files, or one combined file).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "src", "assets", "bible");

/* aruljohn/Bible-kjv ships one JSON per book: { book, chapters:[{chapter,verses:[{verse,text}]}] } */
const KJV_BASE = "https://raw.githubusercontent.com/aruljohn/Bible-kjv/master";
/* WEB: per-book JSON from the same standard layout (swap to a source you trust) */
const WEB_BASE = "https://raw.githubusercontent.com/aruljohn/Bible-web/master";

const BOOKS = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
  "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah",
  "Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah",
  "Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum",
  "Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts",
  "Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians",
  "1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews",
  "James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation",
];

async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

/* normalise one book file into [[chapter1 verses], [chapter2 verses], ...] */
function normaliseBook(data) {
  const chapters = data.chapters || data.Chapters || [];
  return chapters.map((c) => (c.verses || c.Verses || []).map((v) => (v.text || v.Text || "").trim()));
}

async function build(base, label) {
  const out = {};
  const index = [];
  for (const book of BOOKS) {
    const file = book.replace(/\s+/g, ""); // "1 Samuel" -> "1Samuel"
    try {
      const data = await getJSON(`${base}/${file}.json`);
      const chapters = normaliseBook(data);
      out[book] = chapters;
      index.push({ name: book, chapters: chapters.length });
      process.stdout.write(`  ${label}: ${book} (${chapters.length})\r`);
    } catch (e) {
      console.warn(`\n  ! ${label} ${book}: ${e.message}`);
    }
  }
  return { out, index };
}

(async () => {
  await mkdir(OUT_DIR, { recursive: true });
  console.log("Fetching KJV…");
  const kjv = await build(KJV_BASE, "KJV");
  console.log("\nFetching WEB…");
  const web = await build(WEB_BASE, "WEB");

  await writeFile(join(OUT_DIR, "kjv.json"), JSON.stringify(kjv.out));
  await writeFile(join(OUT_DIR, "web.json"), JSON.stringify(web.out));
  await writeFile(join(OUT_DIR, "books.json"), JSON.stringify(kjv.index.length ? kjv.index : web.index));

  console.log(`\nDone. Wrote kjv.json, web.json, books.json to ${OUT_DIR}`);
  console.log("These bundle into the app at build → the Bible works fully offline.");
})();
