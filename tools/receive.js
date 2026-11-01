// Accepts PUT /<name> from the browser and saves the body into the folder given as argv[2].
const http = require("http"), fs = require("fs"), path = require("path");
const dir = process.argv[2];
fs.mkdirSync(dir, { recursive: true });
http.createServer((q, r) => {
  r.setHeader("Access-Control-Allow-Origin", "*");
  r.setHeader("Access-Control-Allow-Methods", "PUT, OPTIONS");
  r.setHeader("Access-Control-Allow-Headers", "*");
  r.setHeader("Access-Control-Allow-Private-Network", "true");
  if (q.method === "OPTIONS") return r.end();
  if (q.method !== "PUT") { r.statusCode = 405; return r.end(); }
  const name = path.basename(decodeURIComponent(q.url.split("?")[0]));
  const chunks = [];
  q.on("data", (c) => chunks.push(c));
  q.on("end", () => { fs.writeFileSync(path.join(dir, name), Buffer.concat(chunks)); r.end("ok"); });
}).listen(8766, "127.0.0.1", () => console.log("ready"));
