// Records a music bed from Lyria RealTime into a WAV.
// Usage: node lyria.mjs <out.wav> <seconds> <bpm> "<prompt>"
import fs from "node:fs";
import { GoogleGenAI } from "@google/genai";

const [out, seconds = "55", bpm = "90", prompt] = process.argv.slice(2);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, apiVersion: "v1alpha" });
const chunks = [];
let bytes = 0;
const target = Number(seconds) * 48000 * 2 * 2; // 48 kHz, stereo, 16-bit

const done = new Promise((resolve, reject) => {
  ai.live.music
    .connect({
      model: "models/lyria-realtime-exp",
      callbacks: {
        onmessage: (m) => {
          for (const c of m.serverContent?.audioChunks ?? []) {
            const b = Buffer.from(c.data, "base64");
            chunks.push(b);
            bytes += b.length;
          }
          if (m.filteredPrompt) console.log("filtered:", JSON.stringify(m.filteredPrompt));
          if (bytes >= target) resolve();
        },
        onerror: (e) => reject(new Error(e.message ?? String(e))),
        onclose: () => resolve(),
      },
    })
    .then(async (session) => {
      await session.setWeightedPrompts({ weightedPrompts: [{ text: prompt, weight: 1.0 }] });
      await session.setMusicGenerationConfig({ musicGenerationConfig: { bpm: Number(bpm), temperature: 1.0, brightness: 0.6, density: 0.45 } });
      session.play();
      done.finally(() => session.close());
    }, reject);
});

const timer = setTimeout(() => console.log("timeout"), (Number(seconds) + 60) * 1000);
await Promise.race([done, new Promise((r) => setTimeout(r, (Number(seconds) + 60) * 1000))]);
clearTimeout(timer);

const pcm = Buffer.concat(chunks).subarray(0, target);
const h = Buffer.alloc(44);
h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVEfmt ", 8);
h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(48000, 24);
h.writeUInt32LE(48000 * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
fs.writeFileSync(out, Buffer.concat([h, pcm]));
console.log(`${out}: ${(pcm.length / 192000).toFixed(1)} s`);
process.exit(0);
