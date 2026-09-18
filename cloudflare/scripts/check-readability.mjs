import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const minimumTextSize = 14;

function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? files(filename) : [filename];
  });
}

function report(file, source, offset, message) {
  const line = source.slice(0, offset).split("\n").length;
  failures.push(`${path.relative(root, file)}:${line}: ${message}`);
}

const sources = files(path.join(root, "src")).filter((file) => /\.(css|astro|tsx|ts)$/.test(file));
for (const file of sources) {
  const source = fs.readFileSync(file, "utf8");
  // Replace comments with spaces, preserving locations for actionable errors.
  const text = source.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, " "));
  const declarations = [
    ...text.matchAll(/(?<![\w-])font(?:-size)?\s*:\s*([^;"'}\n]+)/g),
    ...text.matchAll(/\bfont\s*:\s*["']([^"']+)["']/g),
    ...text.matchAll(/\bfontSize\s*:\s*["']([^"']+)["']/g),
  ];
  for (const declaration of declarations) {
    for (const size of declaration[1].matchAll(/(?<![\w.-])(\d+(?:\.\d+)?)(px|rem|em)\b/g)) {
      const pixels = Number(size[1]) * (size[2] === "px" ? 1 : 16);
      if (pixels < minimumTextSize) report(file, source, declaration.index, `Text size ${size[0]} is below ${minimumTextSize}px; use the shared typography tokens.`);
    }
  }
  for (const size of text.matchAll(/\bfontSize\s*:\s*(\d+(?:\.\d+)?)\b/g)) {
    if (Number(size[1]) < minimumTextSize) report(file, source, size.index, `Text size ${size[1]} is below ${minimumTextSize}px.`);
  }
  if (!file.endsWith(".css")) {
    for (const color of text.matchAll(/(?<![\w-])(?:color|badgeColor)\s*:\s*["']?(?:#[\da-f]{3,8}\b|rgba?\(|hsla?\()/gi)) {
      report(file, source, color.index, "Fixed text color in a component/data helper; use a paired token from readability-tokens.css.");
    }
  }
}

const tokenFile = path.join(root, "src/styles/readability-tokens.css");
const tokenSource = fs.readFileSync(tokenFile, "utf8");
const pairs = new Map([...tokenSource.matchAll(/(--[\w-]+):\s*light-dark\((#[\da-f]{6}),\s*(#[\da-f]{6})\)/gi)].map((match) => [match[1], [match[2], match[3]]]));
function luminance(hex) {
  const rgb = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const linear = rgb.map((v) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
}
function checkContrast(foreground, background) {
  if (!pairs.has(foreground) || !pairs.has(background)) {
    failures.push(`Missing paired token: ${foreground} or ${background}`);
    return;
  }
  for (const [index, theme] of ["light", "dark"].entries()) {
    const values = [luminance(pairs.get(foreground)[index]), luminance(pairs.get(background)[index])].sort((a, b) => a - b);
    const ratio = (values[1] + .05) / (values[0] + .05);
    if (ratio < 4.5) failures.push(`${foreground} on ${background} in ${theme}: ${ratio.toFixed(2)}:1 contrast; 4.5:1 required.`);
  }
}
for (const foreground of ["--text-primary", "--text-secondary", "--status-success", "--status-info", "--status-purple", "--status-warning", "--status-danger", "--status-brand", "--status-silver", "--status-bronze"]) {
  for (const surface of ["--surface-card", "--surface-inset"]) checkContrast(foreground, surface);
}
checkContrast("--status-success", "--status-success-bg");
checkContrast("--medal-ink", "--medal-bg");
for (const [token, minimum] of Object.entries({ meta: 14, label: 15, body: 16, metric: 24 })) {
  const size = tokenSource.match(new RegExp(`--text-${token}:\\s*([\\d.]+)px`));
  if (!size || Number(size[1]) < minimum) failures.push(`--text-${token} must be at least ${minimum}px.`);
}

if (failures.length) {
  console.error(`Readability check failed:\n${failures.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Readability checks passed (${sources.length} source files; text sizes, component colors, and light/dark token contrast).`);
}
