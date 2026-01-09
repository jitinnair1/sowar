import { serve } from "bun";

const server = serve({
  port: 8080,
  development: true,

  async fetch(req) {
    const url = new URL(req.url);
    let filePath = url.pathname;

    //default to index.html for root path
    if (filePath === "/") {
      filePath = "/index.html";
    }

    //serve files from dist directory
    const file = Bun.file(`./dist${filePath}`);

    if (await file.exists()) {
      return new Response(file);
    }

    //return 404 for missing files
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
