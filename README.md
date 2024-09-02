<p>
<strong><h2>Snavigation</h2></strong>
一个简约的起始页
</p>

> **当前采用的是浏览器本地存储所有数据，所以清空浏览器数据会导致书签和配置丢失！！！**

![Snavigation.png](https://s2.loli.net/2022/07/15/FE6U2BJCynHDep8.jpg)

### 功能

- [x] 载入动画
- [x] 时间及天气显示
- [x] 网站背景自定义
- [x] 数据备份及恢复
- [x] 切换搜索引擎
- [x] 设置
- [x] 备份
- [x] 书签
- [x] 书签排序
- [x] 移动端适配
- [x] 一言

* [ ] 书签置顶
* [ ] 书签搜索（可能）

---
未来考虑

- 后端存储数据源
- 书签备份加密
- 书签备份方式

### 配置

修改项目的部分默认设置可前往根目录下的 `.env` 文件中修改

### 部署

- **安装** [node.js](https://nodejs.org/zh-cn/) **环境**

  > node > 16.16.0  
  > npm > 8.15.0

- 然后以 **管理员权限** 运行 `cmd` 终端，并 `cd` 到 项目根目录
- 在 `终端` 中输入：

  ```bash
  # 安装 pnpm
  npm install -g pnpm

  # 安装依赖
  pnpm install

  # 开发
  pnpm dev

  # 构建
  pnpm build
  ```

  > 构建完成后，静态资源会在 **`dist` 目录** 中生成，可将 **`dist` 文件夹下的文件**上传至服务器，
  > 也可使用 [Vercel](https://vercel.com/) 或 [Cloudflare Pages](https://pages.cloudflare.com/) 等托管平台一键自动部署

### 技术栈

- [Vue](https://cn.vuejs.org/)
- [Vite](https://vitejs.cn/vite3-cn/)
- [Pinia](https://pinia.vuejs.org/zh/)
- [iconfont](https://www.iconfont.cn/)
- [naive-ui](https://www.naiveui.com/zh-CN/os-theme)

### API

- [wallhavencc(良心壁纸网站) api](https://wallhaven.cc/)
- [缙哥哥 API](https://www.dujin.org/3618.html)
- [Hitokoto 一言](https://hitokoto.cn/)
- [和风天气api(需自行申请api key)](https://dev.qweather.com/docs/api/)

### 鸣谢

- 本站部分样式及功能参考自[青柠起始页](https://limestart.cn/)
- 基于[imsyy/Snavigation](https://github.com/imsyy/Snavigation)二次修改

