import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/opensky": {
        target: "https://opensky-network.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/opensky/, "/api"),
      },
    },
  },
});