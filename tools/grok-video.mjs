// Animates stills with Grok Imagine (image-to-video) and saves the clips.
// Usage: node grok-video.mjs <shots.json> <outDir> [only-id ...]
import fs from "node:fs";
import path from "node:path";

const [shotsFile, outDir, ...only] = process.argv.slice(2);
const shots = JSON.parse(fs.readFileSync(shotsFile, "utf8")).filter((s) => !only.length || only.includes(s.id));
const key = process.env.XAI_API_KEY;
const base = path.dirname(path.resolve(shotsFile));
fs.mkdirSync(outDir, { recursive: true });

const api = async (url, init = {}) => {
  const r = await fetch(url, { ...init, headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...init.headers } });
  const text = await r.text();
  if (!r.ok) throw new Error(`${r.status} ${text.slice(0, 400)}`);
  return JSON.parse(text);
};

async function run(shot) {
  const img = fs.readFileSync(path.resolve(base, shot.still)).toString("base64");
  const body = {
    model: shot.model ?? "grok-imagine-video-1.5-lite",
    prompt: shot.prompt,
    image: { url: `data:image/jpeg;base64,${img}` },
    duration: shot.duration ?? 5,
    resolution: shot.resolution ?? "720p",
    generate_audio: false,
  };
  const { request_id } = await api("https://api.x.ai/v1/videos/generations", { method: "POST", body: JSON.stringify(body) });
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const d = await api(`https://api.x.ai/v1/videos/${request_id}`);
    if (d.status === "done") {
      const v = await fetch(d.video.url);
      const file = path.join(outDir, `${shot.id}.mp4`);
      fs.writeFileSync(file, Buffer.from(await v.arrayBuffer()));
      return `${shot.id}: done, ${d.video.duration}s -> ${file}`;
    }
    if (d.status !== "pending") return `${shot.id}: ${d.status} ${JSON.stringify(d).slice(0, 300)}`;
  }
  return `${shot.id}: timed out (${request_id})`;
}

const results = await Promise.allSettled(shots.map(run));
for (const r of results) console.log(r.status === "fulfilled" ? r.value : `error: ${r.reason.message}`);
