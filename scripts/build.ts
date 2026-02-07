import { build } from "bun";

const buildDate = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "2-digit",
});

await build({
    entrypoints: ["src/main.ts"],
    outdir: "dist",
    target: "browser",
    minify: true,
    define: {
        BUILD_DATE: JSON.stringify(buildDate),
    },
    loader: {
        ".md": "text",
        ".ml": "text",
        ".toml": "toml",
    },
});

console.log(`[build] bundled src/main.ts with BUILD_DATE="${buildDate}"`);
