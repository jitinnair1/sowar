// scripts/dev.ts
import { $ } from "bun";

await $`bun run build:dist`;

//run watchers in parallel
await Promise.all([
  $`bun run build:ts --watch`,

  //output directly to dist during dev if that's what your server needs.
  $`bunx @tailwindcss/cli -i ./src/input.css -o ./dist/style.css --watch`,

  $`bun run serve`
]);

