import { $ } from "bun";
import { watch } from "node:fs";
import { cp } from "node:fs/promises";
import { join } from "node:path";

const PUBLIC_DIR = "public";
const DIST_DIR = "dist";

async function syncFile(filename: string) {
  try {
    await cp(join(PUBLIC_DIR, filename), join(DIST_DIR, filename), { recursive: true });
    console.log(`[sync] ${filename} -> ${DIST_DIR}`);
  } catch (err) {
  }
}

console.log("Initializing dev build...");
await $`rm -rf ${DIST_DIR} && mkdir -p ${DIST_DIR}`;
await $`cp -r ${PUBLIC_DIR}/* ${DIST_DIR}/`;

watch(PUBLIC_DIR, { recursive: true }, (event, filename) => {
  if (filename) syncFile(filename);
});

const buildDate = JSON.stringify(new Date().toLocaleDateString(undefined, {
  year: "numeric",
  month: "long",
  day: "2-digit",
}));

console.log("Watching for changes...");
await Promise.all([
  $`bun build src/main.ts --outdir ${DIST_DIR} --target browser --define BUILD_DATE=${buildDate} --loader .md:text --loader .ml:text --watch`,
  $`bunx --bun @tailwindcss/cli -i ./src/input.css -o ./${DIST_DIR}/style.css --watch`,
  $`bun run server.ts`
]);
