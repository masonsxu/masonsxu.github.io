import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    "/": index,
  },

  async fetch(req) {
    const url = new URL(req.url);

    // Serve static files from public/
    const publicFile = Bun.file(`./public${url.pathname}`);
    if (await publicFile.exists()) {
      return new Response(publicFile);
    }

    // SPA fallback: serve the app for any non-file route
    return new Response(null, { status: 404 });
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
