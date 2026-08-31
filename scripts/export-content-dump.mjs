/**
 * Exporta las colecciones de contenido del Mongo local a un archivo EJSON gzip,
 * para sembrar la BD de producción (que arranca vacía).
 * Recibe: `MONGODB_URI` (default local `portfolioNew`).
 * Produce: `portfolio-content-dump.ejson.gz` en el cwd.
 * NO exporta datos de runtime (leads, joboffers, jevychatstats, sessionattachments).
 * Par: scripts/import-content-dump.mjs
 */
import { MongoClient, BSON } from "mongodb";
import { gzipSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const URI = process.env.MONGODB_URI || "mongodb://localhost:27017/portfolioNew";
const COLLECTIONS = [
  "projects",
  "certificates",
  "experiences",
  "contents",
  "blogposts",
  "jevytaxonomies",
  "skills",
  "otherskills",
  "stattypes",
  "users",
];
const OUT = "portfolio-content-dump.ejson.gz";

const client = new MongoClient(URI);
await client.connect();
const db = client.db();
console.log("origen:", db.databaseName);

const collections = {};
for (const name of COLLECTIONS) {
  const docs = await db.collection(name).find({}).toArray();
  collections[name] = docs;
  console.log(`  ${name}: ${docs.length}`);
}

const payload = BSON.EJSON.stringify(
  { exportedAt: new Date(), source: db.databaseName, collections },
  { relaxed: false },
);
writeFileSync(OUT, gzipSync(Buffer.from(payload)));
await client.close();
console.log(`\nescrito ${OUT}`);
