// @ts-check
import { defineConfig, envField } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  server: {
    port: 3000,
  },
  env: {
    schema: {
      SUPABASE_URL: envField.string({ context: "server", access: "secret" }),
      SUPABASE_KEY: envField.string({ context: "server", access: "secret" }),
      SUPABASE_SERVICE_ROLE_KEY: envField.string({ context: "server", access: "secret" }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      alias: import.meta.env.PROD && {
        "react-dom/server": "react-dom/server.edge",
      },
    },
  },
  devToolbar: {
    enabled: false,
  },
  integrations: [react()],
  adapter: cloudflare(),
  experimental: {
    session: true,
  },
});
