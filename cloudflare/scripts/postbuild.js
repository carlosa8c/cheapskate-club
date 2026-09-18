import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const client = path.join(dist, "client");
const server = path.join(dist, "server");

// 1. Flatten client assets into dist root
if (fs.existsSync(client)) {
  for (const file of fs.readdirSync(client)) {
    const src = path.join(client, file);
    const dest = path.join(dist, file);
    fs.cpSync(src, dest, { recursive: true });
  }
}

// 2. Create _worker.js in dist root for Cloudflare Pages
fs.writeFileSync(
  path.join(dist, "_worker.js"),
  'export { default } from "./server/entry.mjs";\n'
);

// 3. Remove .wrangler directory completely so Pages Beta reader does not find redirected config
const wranglerDeployDir = path.join(root, ".wrangler");
if (fs.existsSync(wranglerDeployDir)) {
  fs.rmSync(wranglerDeployDir, { recursive: true, force: true });
}

// 4. Remove dist/server/wrangler.json so Pages never validates the Worker-specific schema
const serverWrangler = path.join(server, "wrangler.json");
if (fs.existsSync(serverWrangler)) {
  fs.unlinkSync(serverWrangler);
}

console.log("Postbuild completed: flattened dist/, generated _worker.js, purged beta wrangler configs.");
