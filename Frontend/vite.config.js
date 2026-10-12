// ./vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    resolve: {
      alias: { "@": path.resolve(__dirname, "src") }
    },
    server: {
      port: 5173,
      open: true,
      proxy: {
        "/api": {
          target: env.VITE_BACKEND_URL || "http://localhost:8080",
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on("error", (_error, _request, response) => {
              if ("writeHead" in response) {
                response.writeHead(503, { "Content-Type": "application/json" });
                response.end(JSON.stringify({ message: "Backend unavailable" }));
              }
            });
          }
        }
      }
    },
    preview: { port: 4173 }
  };
});
