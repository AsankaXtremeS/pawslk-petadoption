import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { NOINDEX_META, PAGE_META } from "./src/lib/seo";
import { injectMeta } from "./src/lib/seo-core.js";

/**
 * Rewrites index.html with the home page meta and emits about.html,
 * adopt/dogs.html, … next to it with route-specific title, description,
 * canonical, Open Graph and breadcrumb tags baked in, so crawlers and
 * link-preview bots that don't run JS still see correct metadata. Private
 * pages (NOINDEX_META) get noindex in their HTML the same way.
 * Served via cleanUrls in vercel.json. /animals/:id is handled at request
 * time by api/animal-page.js instead.
 */
function prerenderRouteMeta(): Plugin {
  return {
    name: "prerender-route-meta",
    apply: "build",
    enforce: "post",
    generateBundle(_, bundle) {
      const index = bundle["index.html"];
      if (!index || index.type !== "asset") return;
      const shell = String(index.source);
      for (const [route, meta] of Object.entries({ ...PAGE_META, ...NOINDEX_META })) {
        const html = injectMeta(shell, meta);
        if (route === "/") {
          index.source = html;
        } else {
          this.emitFile({ type: "asset", fileName: `${route.slice(1)}.html`, source: html });
        }
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), prerenderRouteMeta()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-framer': ['framer-motion'],
          'vendor-radix': [
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-tooltip',
          ],
          'vendor-utils': ['react-icons', 'clsx', 'tailwind-merge'],
          'vendor-charts': ['recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
