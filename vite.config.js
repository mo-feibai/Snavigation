import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import vue from "@vitejs/plugin-vue";
import path from "path";
import viteCompression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // PWA
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /(.*?)\.(woff2|woff|ttf)/,
            handler: "CacheFirst",
            options: {
              cacheName: "file-cache",
            },
          },
          {
            urlPattern: /(.*?)\.(webp|png|jpe?g|svg|gif|bmp|psd|tiff|tga|eps)/,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
            },
          },
        ],
      },
      manifest: {
        name: "Snavigation",
        short_name: "Snavigation",
        description: "一个极致简约的导航页",
        display: "standalone",
        start_url: "/",
        theme_color: "#fff",
        background_color: "#efefef",
        icons: [
          {
            src: "/icon/logo-144.png",
            sizes: "144x144",
            type: "image/png",
          },
        ],
      },
    }),
    // viteCompression
    viteCompression(),
  ],
  server: {
    port: 5588,
    open: false,
    proxy: {
      "/wallpaperApi": {
        target: "https://wallhaven.cc",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/wallpaperApi/, ""),
      },
      "/geoApi": {
        target: "https://geoapi.qweather.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/geoApi/, ""),
      },
      "/weatherApi": {
        target: "https://devapi.qweather.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/weatherApi/, ""),
      },
      "/iconApi": {
        target: "https://t3.gstatic.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/iconApi\/t[0123]/, ""),
      },
      "/hitokotoApi": {
        target: "https://international.v1.hitokoto.cn",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hitokotoApi/, ""),
      },
    },
  },
  resolve: {
    // 配置路径别名
    alias: {
      // eslint-disable-next-line no-undef
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        // 生产环境时移除 console
        pure_funcs: ["console.log"],
      },
    },
  },
});
