# Mm的专属美照库

> Mm的专属照片展示网站。极简、高级、沉浸式。

## 快速开始

### 1. 添加照片

把照片放入 `photos/` 文件夹下的分类子目录：

```
photos/
├── portraits/      # 人像
├── landscapes/     # 风景
├── street/         # 街拍
└── your-category/  # 自定义分类（新建文件夹即可）
```

**支持的格式：** JPG / PNG / WebP / AVIF / GIF

### 2. 生成照片清单

运行扫描脚本生成 `data/gallery.json`：

```bash
python generate_gallery.py
```

### 3. 打开网站

双击 `index.html`，或在浏览器中打开即可查看。

**注意：** 由于浏览器安全限制（CORS），部分浏览器可能不允许 `fetch` 本地文件。如遇此问题，可选以下任一方式：

- **方式 A**：使用本地服务器
  ```bash
  # Python
  python -m http.server 8000
  # 然后打开 http://localhost:8000
  ```
- **方式 B**：将 gallery.json 内联到 HTML（小众用法，见下方）

## 自定义

- **网站标题**：编辑 `index.html` 中的 `<title>` 和各文字区域
- **分类名称**：在 `generate_gallery.py` 的 `CATEGORY_NAMES` 字典中添加
- **配色**：编辑 `css/style.css` 中的 `:root` 变量
- **字体**：编辑 `index.html` 中的 Google Fonts 链接和 CSS 引用

## 设计特性

- 🎨 暗色高级主题，突出照片色彩
- 🖼️ 瀑布流（Masonry）自适应布局
- ✨ 滚动入场动画（cascade fade-in）
- 🖱️ Hover 缩放 + 渐变叠加标题
- 🔍 沉浸式全灯箱预览（键盘/触摸/点击导航）
- 📱 完整响应式（手机 / 平板 / 桌面）
- 🧭 毛玻璃固定导航栏
- 💅 自定义滚动条 + 优雅加载动画

## License

Mm的专属美照库 ❤️
