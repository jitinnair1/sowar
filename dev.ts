import { $ } from "bun";
import type { Subprocess } from "bun";
import { watch } from "node:fs";

const SRC_DIR = "src";
const PUBLIC_DIR = "public";

let server: Subprocess | null = null;

async function restart() {
  if (server && !server.killed) server.kill();

  try {
    await $`bun run build`;
  } catch {
    return;
  }

  server = Bun.spawn(["bun", "run", "serve", ...Bun.argv.slice(2)], {
    stdout: "inherit",
    stderr: "inherit",
  });
}

await restart();

let timer: Timer;
const run = () => {
  clearTimeout(timer);
  timer = setTimeout(restart, 300);
};

watch(SRC_DIR, { recursive: true }, run);
watch(PUBLIC_DIR, { recursive: true }, run);

process.on("SIGINT", () => {
  if (server && !server.killed) server.kill();
  process.exit(0);
});
