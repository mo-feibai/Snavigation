// api/proxy.js
// 该服务为 vercel serve跨域处理

import { createProxyMiddleware } from "http-proxy-middleware";

export default (req, res) => {
  let target = "";
  // 代理目标地址
  // 这里使用 backend 主要用于区分 vercel serverless 的 api 路径
  console.log("url is:", req.url);
  if (req.url.startsWith("/wallpaperApi") || req.url.startsWith("/api")) {
    target = "https://wallhaven.cc";
  } else if (req.url.startsWith("/geoApi")) {
    target = "https://geoapi.qweather.com";
  } else if (req.url.startsWith("/weatherApi")) {
    target = "https://devapi.qweather.com";
  } else if (req.url.startsWith("/iconApi")) {
    target = "https://www.google.com";
  }

  function removePrefix(str, prefixes) {
    for (let prefix of prefixes) {
      if (str.startsWith(prefix)) {
        return str.slice(prefix.length);
      }
    }
    // 如果没有匹配到任何前缀，则返回原字符串
    return str;
  }

  // 创建代理对象并转发请求
  const rewriteFn = function (path) {
    const prefixes = ["/wallpaperApi", "/geoApi", "/weatherApi", "/iconApi"];
    return removePrefix(path, prefixes);
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
