// api/proxy.js
// 该服务为 vercel serve跨域处理

import { createProxyMiddleware } from "http-proxy-middleware";

// const { createProxyMiddleware } = require("http-proxy-middleware");
export default (req, res) => {
  let target = "";
  // 代理目标地址
  // 这里使用 backend 主要用于区分 vercel serverless 的 api 路径
  if (req.url.startsWith("/api")) {
    target = "https://wallhaven.cc";
  }
  // 创建代理对象并转发请求
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      // 通过路径重写，去除请求路径中的 `/api`
      //'^/api/': '/',
    },
  })(req, res);
};
