/**
 * Siembra la BD de producción con el dump generado por export-content-dump.mjs.
 * Para cada colección del dump: borra lo que haya y reinserta.
 * Recibe: `MONGODB_URI` (prod, de las env del contenedor) + ruta del .ejson.gz como arg (default `portfolio-content-dump.ejson.gz`).
 * NO toca colecciones que no estén en el dump (leads, joboffers, jevychatstats, sessionattachments se quedan intactas).
 * Par: scripts/export-content-dump.mjs
 */
import { MongoClient, BSON } from "mongodb";
import { gunzipSync } from "node:zlib";
import { readFileSync } from "node:fs";

const URI = process.env.MONGODB_URI;
if (!URI) throw new Error("MONGODB_URI no está seteada");

const file = process.argv[2] || "portfolio-content-dump.ejson.gz";
const data = BSON.EJSON.parse(gunzipSync(readFileSync(file)).toString());

const client = new MongoClient(URI);
await client.connect();
const db = client.db();
console.log("destino:", db.databaseName, "| dump de:", data.source, "|", data.exportedAt);

for (const [name, docs] of Object.entries(data.collections)) {
  const col = db.collection(name);
  const before = await col.countDocuments();
  await col.deleteMany({});
  if (docs.length) await col.insertMany(docs, { ordered: false });
  console.log(`  ${name}: ${before} -> ${docs.length}`);
}

await client.close();
console.log("\nlisto");
