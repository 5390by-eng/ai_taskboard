import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const backendTarget =
  process.env.VITE_API_BASE_URL ?? "https://backend.2385390-by.workers.dev";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    watch: {
      ignored: ["**/playwright-report/**", "**/test-results/**"],
    },
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: backendTarget,
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
