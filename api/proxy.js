// api/proxy.js
// 该服务为 vercel serve跨域处理

import { createProxyMiddleware } from "http-proxy-middleware";

// const { createProxyMiddleware } = require("http-proxy-middleware");
export default (req, res) => {
  let target = "";
  // 代理目标地址
  // 这里使用 backend 主要用于区分 vercel serverless 的 api 路径
  if (req.url.startsWith("/wallpaperApi")) {
    target = "https://wallhaven.cc";
  } else if (req.url.startsWith("/geoApi")) {
    target = "https://geoapi.qweather.com";
  } else if (req.url.startsWith("/weatherApi")) {
    target = "https://devapi.qweather.com";
  } else if (req.url.startsWith("/iconApi")) {
    target = "https://www.google.com";
  }
  // 创建代理对象并转发请求
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      // 通过路径重写，去除请求路径中的 `/api`
      "^/wallpaperApi/": "/",
      "^/geoApi/": "/",
      "^/weatherApi/": "/",
      "^/iconApi/": "/",
    },
  })(req, res);
};
