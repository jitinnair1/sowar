import { serve } from "bun";

const portArg = Bun.argv.indexOf("--port");
const port = portArg > -1 ? parseInt(Bun.argv[portArg + 1]) : parseInt(process.env.PORT || "8080");

const server = serve({
  port,
  development: true,

  async fetch(req: Request) {
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
const baseDir = (import.meta as any).dir || process.cwd();
console.log(`Serving files from ${baseDir}/dist`);
