# 元境 · 生辰星图

在线体验：https://960668.github.io/yuanjing/
源码：https://github.com/960668/yuanjing

一个将四柱、十神和传统神煞呈现为「内景宇宙」的互动网页。中央为固定二维盘坐灵体；透干、藏干各沿一条三维轨道环绕，神煞分布在两条不共面的轨道。

## 功能

- 公历生日、当地时间、UTC 偏移及可选传统排盘性别输入。
- 四柱、十神、八字表层五行计数。
- 51 种常用神煞规则，重复项按柱位分别显示，可查看完整清单。
- 星环自动运动，支持拖拽、滚轮与双指缩放，点击星符查看来源。
- 出生时刻的太阳系近似星图，支持播放与命盘 JSON 导出。

## 运行

这是纯静态网站，没有后端，也无需安装依赖。安装 Node.js 后，在此目录运行：

```sh
npm run dev
```

打开终端显示的 `http://localhost:4173`。完整文件下载后可断网运行本地服务。请通过 HTTP 服务打开，不要直接双击 HTML；三维模块使用 ES modules。

```sh
npm run check
```

此检查验证脚本语法与本地资源引用；不替代浏览器视觉与手势实测。

## 发布到 GitHub Pages

1. 创建公开仓库（例如 `yuanjing`），将这个目录内的全部文件上传到 `main` 分支，包括 `.github/workflows/pages.yml`。
2. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 打开 **Actions → Publish Yuanjing to GitHub Pages → Run workflow**。以后推送到 `main` 会自动部署。
4. 部署成功后，在 Settings → Pages 或工作流的部署环境中取得公开网址，通常为 `https://你的用户名.github.io/yuanjing/`。

所有本地资源使用相对路径，可以放在仓库子路径下。只发布 `dist/`，没有 API 密钥或服务器配置。

官方说明：[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 数据与计算口径

输入的生辰信息只在浏览器内存中计算；应用没有将生辰上传的接口，也没有应用级追踪代码。选择导出后，JSON 保存到用户本机。访问在线站点本身会访问托管平台。

- 四柱采用 lunar-javascript 的节气与默认子时换日口径，不校正真太阳时。
- 神煞为 chxb/shensha 的 51 种常用规则，并非问真官方算法，尚未与问真逐项对齐。未指定传统排盘性别时不计算元辰。天赦与德秀在适配层只记录一次，避免按整盘条件重复挂载四柱。
- 行星使用 NASA/JPL 1800–2050 年开普勒近似轨道要素；地球以地月质心代替。显示距离压缩、大小不按比例。
- 神煞为传统文化的艺术表达；星环动画不改变命盘或出生时刻。
- 不支持 WebGL 的设备保留二维星图。三维效果、自动运动和手机手势需在实际浏览器检查。

## 项目文件

`dist/`：可独立部署的全部网页与资源。  
`tools/`：本地预览与发布前检查。  
`.github/workflows/pages.yml`：GitHub Pages 自动部署。

## 第三方组件

见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。所附 MIT 许可只适用于对应的第三方库，不自动为项目自编代码与图片授予开源许可。
