import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true, // Listen on all local IPs
    port: 8080,
    strictPort: true, // Don't try other ports if 8080 is taken
    hmr: {
      clientPort: 443, // Force client to use HTTPS for WebSocket
      host: `${process.env.VITE_PROJECT_ID}.lovableproject.com`,
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));