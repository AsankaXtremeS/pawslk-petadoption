import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { PAGE_META, DEFAULT_IMAGE, absoluteUrl, type PageMeta } from "./src/lib/seo";

const escapeAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** Rewrites the static SEO tags in the built index.html for one route. */
function injectMeta(html: string, { title, description, path: route = "/", image = DEFAULT_IMAGE }: PageMeta) {
  const url = absoluteUrl(route);
  const t = escapeAttr(title);
  const d = escapeAttr(description);
  const tags: [RegExp, string][] = [
    [/(<title>)[^<]*(<\/title>)/, t],
    [/(<meta\s+name="description"\s+content=")[^"]*(")/, d],
    [/(<link\s+rel="canonical"\s+href=")[^"]*(")/, url],
    [/(<meta\s+property="og:title"\s+content=")[^"]*(")/, t],
    [/(<meta\s+property="og:description"\s+content=")[^"]*(")/, d],
    [/(<meta\s+property="og:url"\s+content=")[^"]*(")/, url],
    [/(<meta\s+property="og:image"\s+content=")[^"]*(")/, escapeAttr(image)],
    [/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, t],
    [/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, d],
  ];
  return tags.reduce((out, [pattern, value]) => {
    if (!pattern.test(out)) throw new Error(`prerender-route-meta: tag not found in index.html: ${pattern}`);
    return out.replace(pattern, (_, open, close) => open + value + close);
  }, html);
}

/**
 * Emits about.html, animals.html, … next to index.html with route-specific
 * title/description/canonical/OG tags baked in, so crawlers and link-preview
 * bots that don't run JS still see correct metadata. Served via cleanUrls in vercel.json.
 */
function prerenderRouteMeta(): Plugin {
  return {
    name: "prerender-route-meta",
    apply: "build",
    enforce: "post",
    generateBundle(_, bundle) {
      const index = bundle["index.html"];
      if (!index || index.type !== "asset") return;
      for (const [route, meta] of Object.entries(PAGE_META)) {
        if (route === "/") continue;
        this.emitFile({ type: "asset", fileName: `${route.slice(1)}.html`, source: injectMeta(String(index.source), meta) });
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
