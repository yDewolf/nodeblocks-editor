import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { chmodSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const UV_VERSION = process.env.UV_VERSION ?? "0.13.7";
const tripleT = process.env.TAURI_ENV_TARGET_TRIPLE ?? execFileSync("rustc", ["--print", "host-tuple"]).toString().trim();

const isWindows = tripleT.includes("windows");
const exe = isWindows ? ".exe" : "";
const archiveName = `uv-${tripleT}.${isWindows ? "zip" : "tar.gz"}`;
const baseUrl = `https://github.com/astral-sh/uv/releases/download/${UV_VERSION}`;

const outDir = join("src-tauri", "binaries");
const outFile = join(outDir, `uv-${tripleT}${exe}`);

if (existsSync(outFile)) {
  console.log(`uv already present: ${outFile}`);
  process.exit(0);
}

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function findFile(dir, name) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const hit = findFile(full, name);
      if (hit) return hit;
    } else if (entry.name === name) {
      return full;
    }
  }
  return null;
}

const work = mkdtempSync(join(tmpdir(), "uv-fetch-"));
try {
  console.log(`Downloading uv ${UV_VERSION} for ${tripleT}...`);
  const archive = await download(`${baseUrl}/${archiveName}`);

  if (!process.env.SKIP_UV_SHA256) {
    const expected = (await download(`${baseUrl}/${archiveName}.sha256`)).toString().trim().split(/\s+/)[0];
    const actual = createHash("sha256").update(archive).digest("hex");
    if (expected.toLowerCase() !== actual) {
      throw new Error(`SHA-256 mismatch for ${archiveName}: expected ${expected}, got ${actual}`);
    }
  }

  const archivePath = join(work, archiveName);
  writeFileSync(archivePath, archive);
  execFileSync("tar", ["-xf", archivePath, "-C", work]);

  const binary = findFile(work, `uv${exe}`);
  if (!binary) throw new Error(`uv${exe} not found inside ${archiveName}`);

  mkdirSync(outDir, { recursive: true });
  copyFileSync(binary, outFile);
  if (!isWindows) chmodSync(outFile, 0o755);
  console.log(`Wrote ${outFile}`);

} finally {
  rmSync(work, { recursive: true, force: true });
}
