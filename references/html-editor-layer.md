# 浏览器内改稿（编辑层）

交付给用户的 `简历.html` 自带一层编辑器：双击用 Chrome/Edge 打开，就能直接在页面上改字、看单页余量、导出 PDF，再把改动写回源文件。这一层已经内建在 [模板](../templates/resume.html) 里，生成简历时不需要额外加装，也不要删。

编辑层只影响浏览器里的显示。打印样式把它整层隐藏，导出件与没有编辑层时逐像素一致（2026-09-29 用 `examples/demo.html` 做过改前/改后页面图差分，0 差异），所以它可以一直留在源文件里。

## 1. 交付文件的结构

主样式块 `<style>` 一个字都不改；编辑层全部另起，共五处：

| 位置 | 作用 |
| --- | --- |
| `<style id="editor-layer">` | 工具栏、格式条、余量指示、隐私遮罩的样式；`@media print` 里整层隐藏 |
| `<div class="toolbar">` | 按钮与提示文字 |
| `<div class="stage" id="stage">` | 屏幕上给固定工具栏让位；打印时 `padding:0; zoom:1` |
| `<div class="doc" id="doc">` | 正文容器，编辑态下就是 `contenteditable` 目标 |
| 末尾 `<script>` | 全部交互逻辑（原生 JS，无依赖） |

填写正文时只替换 `#doc` 里的内容块，页首、工具栏和脚本保持原样。

## 2. 工具条能做什么

- **开启编辑 / 完成编辑：**切换正文 `contenteditable`，并显示格式条与余量指示。
- **格式：**B / I / U、清除格式、撤销、重做。用 `execCommand` 且强制生成 `<b>/<i>/<u>` 标签，因为模板的加粗规则挂在 `b` 上，不是内联 `style`。
- **从 Word/WPS 粘贴**会被拦成纯文本，避免带入外部字体字号把版式顶开。
- **隐藏隐私：**给 `.pii` 加灰底并隐藏文字，照片加模糊。地址栏加 `?privacy=1` 可默认开启。
- **导出 PDF：**调 `window.print()`，工具栏自动隐藏。
- **写回源文件 / 另存改后 HTML：**见第 4 节。
- **单页余量：**编辑态右上角实时显示，见第 5 节。

## 3. 隐私遮罩只包手机号和邮箱

在页首联系方式里给手机号和邮箱各包一层 `<span class="pii">`，[照片页首片段](../templates/header-with-photo.html) 已带好。

**不要把正文 bullet 里的 URL 包进 `.pii`。**正文是 `text-align: justify`，在行内新增元素会改变空格分布，整段换行位置随之变化——2026-09-28 实测同一份简历产生过 101 像素的差异。GitHub 链接、作品集链接这类正文里的 URL 保持裸露即可。

照片由脚本在加载时统一设为 `contenteditable="false"`，编辑态里删不掉，不会出现误删照片或缺图导出。

## 4. 写回源文件的边界

「写回源文件」用 File System Access API（`showSaveFilePicker` + `createWritable`）原地覆盖第一次选定的文件，第二次点不再弹框；浏览器不支持或调用失败时自动回退成「下载一份改后 HTML」。`file://` 页面属于 secure context，Chrome/Edge 可用；Firefox/Safari 走回退路径。

要跟用户讲清楚的一条：**写回只改这份 HTML。**`投递文件/` 里的 PDF、`preview.png`、`layout-check.json` 不会跟着更新，只有点「导出 PDF」或重跑 `render_pdf.mjs` 之后才是新的。没有文件监听，"保存即出 PDF"做不到。

## 5. 单页余量怎么算

```
余量 = 297 −（内容底 − 页面顶 + 9mm 底边距）
```

用 `.page` 的宽度当比例尺（=210mm），所以页面缩放不影响读数。小于 10mm 显示黄字「只剩 Xmm，再加一行就可能超出」，小于 0 显示红字。

**注意与 `render_pdf.mjs` 的 `bottomSpaceMm` 差 9mm：**后者是「内容底到纸张底」，含那 9mm 底边距。判断"还能加多少"看编辑层或 [measure_layout.mjs](../scripts/measure_layout.mjs)，不要拿 `bottomSpaceMm` 当余量，否则会以为还有 12mm 可用而实际只剩 3mm。

## 6. 改动编辑层时的注意事项

- 不要改主 `<style>` 块。编辑层的样式全部写在 `<style id="editor-layer">` 里，改它不会影响版式。
- 不要删 `@media print` 里的 `.toolbar { display: none }` 和 `.stage { padding: 0; zoom: 1 }`。少了前者工具栏会印进 PDF，少了后者导出会带上屏幕上的缩放与留白。
- 不要给 `#doc`、`#stage` 改名或换层级，脚本按 id 取。
- 模板里 `.section:first-of-type { margin-top: 0 }` 实际上不命中任何元素（第一个 `div` 是 `.header`），所以首个板块保留 8px 上间距。这是既有版式的一部分，**不要顺手"修好"**，改了会让整页内容上移、导出件变化。
- 改动后必须重新验证导出件没变：渲染改前/改后各一版 PDF，取页面图做像素差分。

## 7. 自检

生成或改完简历后跑一遍编辑层冒烟测试：

```bash
node scripts/smoke_editor.mjs --html="/path/to/制作源文件/简历.html"
```

它检查 JS 报错、工具栏、编辑态、余量读数、照片保护、隐私遮罩（含 `?privacy=1`）、打印时是否隐藏，任一项不过就以非零码退出。压单页时配合 `node scripts/measure_layout.mjs --html="..."` 定位该删哪一行。
