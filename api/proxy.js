// api/proxy.js
// 该服务为 vercel serve跨域处理

import { createProxyMiddleware } from "http-proxy-middleware";

export default (req, res) => {
  let target = "";
  // 代理目标地址
  // 这里使用 backend 主要用于区分 vercel serverless 的 api 路径
  if (req.url.startsWith("/wallpaperApi") || req.url.startsWith("/api")) {
    target = "https://wallhaven.cc";
  } else if (req.url.startsWith("/geoApi")) {
    target = "https://geoapi.qweather.com";
  } else if (req.url.startsWith("/weatherApi")) {
    target = "https://devapi.qweather.com";
  } else if (req.url.startsWith("/iconApi")) {
    target = "https://www.google.com";
  }
  // 创建代理对象并转发请求
  const rewriteFn = function (path, req) {
    console.log("req is:", req);
    console.log("path is:", path);
    return path;
  };

  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: rewriteFn,
    // pathRewrite: {
    //   // "^/wallpaperApi/": "/",
    //   // "^/geoApi/": "/",
    //   // "^/weatherApi/": "/",
    //   // "^/iconApi/": "/",
    // },
  })(req, res);
};
