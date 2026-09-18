import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(__dirname, "../dist");
const client = path.join(dist, "client");

if (fs.existsSync(client)) {
  for (const file of fs.readdirSync(client)) {
    const src = path.join(client, file);
    const dest = path.join(dist, file);
    fs.cpSync(src, dest, { recursive: true });
  }
}

fs.writeFileSync(
  path.join(dist, "_worker.js"),
  'export { default } from "./server/entry.mjs";\n'
);
console.log("Successfully prepared dist/_worker.js and static assets for Cloudflare Pages");
