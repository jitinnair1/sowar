import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import siteConfig from "../site.toml";

const distPath = join(process.cwd(), "dist", "index.html");

try {
    console.log("Injecting SEO meta tags...");
    let html = readFileSync(distPath, "utf-8");
    const { headline, description, keywords, og_image } = siteConfig;

    if (headline) {
        html = html.replace(/<title>.*<\/title>/, `<title>${headline}</title>`);
        html = html.replace("</head>", `<meta property="og:title" content="${headline}">\n</head>`);
    }

    if (description) {
        html = html.replace("</head>", `<meta name="description" content="${description}">\n</head>`);
        html = html.replace("</head>", `<meta property="og:description" content="${description}">\n</head>`);
    }

    if (keywords) {
        html = html.replace("</head>", `<meta name="keywords" content="${keywords}">\n</head>`);
    }

    if (og_image) {
        html = html.replace("</head>", `<meta property="og:image" content="${og_image}">\n</head>`);
        html = html.replace("</head>", `<meta name="twitter:card" content="summary_large_image">\n</head>`);
    }

    writeFileSync(distPath, html);
    console.log("SEO meta tags injected");

} catch (error) {
    console.error("Failed to inject meta tags:", error);
    process.exit(1);
}
