import { serve } from "bun";
import index from "./index.html";

const server = serve({
  // Listen on all interfaces to allow access from other devices on the network
  hostname: "0.0.0.0",
  port: 3000,

  // Define routes for the server
  routes: {
    "/": index,
  },

  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // Serve static files from public/
    const publicFile = Bun.file(`./public${path}`);
    if (await publicFile.exists()) {
      return new Response(publicFile);
    }
    if (path === "/") {
      return new Response(Bun.file("./index.html"), {
        headers: { "Content-Type": "text/html" },
      });
    }
    // SPA fallback: serve the app for any non-file route
    const errorPage = Bun.file("./public/404.html");
    return new Response(errorPage, { status: 404 });
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
