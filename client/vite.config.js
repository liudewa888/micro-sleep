import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    proxy: {
      "/api": {
        // target: "http://127.0.0.1:3001/",
        target: "http://www.yztpsg.cn/node/bookserver/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/ImgBaseLink": {
        target: "http://www.yztpsg.cn/node/bookserver/image/",
        // target: "http://127.0.0.1:3002/image/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ImgBaseLink/, ""),
      },
      "/video": {
        target: "http://www.yztpsg.cn/node/bookserver/video/",
        // target: "http://127.0.0.1:3002/video/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/video/, ""),
      },
    },
  },
  optimizeDeps: {},
});
