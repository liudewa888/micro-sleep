import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const proxyUrl = "http://www.yztpsg.cn/book/";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        // target: "http://127.0.0.1:3001/",
        target: proxyUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/image": {
        target: proxyUrl + "image/",
        // target: "http://127.0.0.1:3002/image/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ImgBaseLink/, ""),
      },
      "/video": {
        target: proxyUrl + "video/",
        // target: "http://127.0.0.1:3002/video/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/video/, ""),
      },
    },
  },
  optimizeDeps: {},
});
