# 导出与检查

从 Skill 根目录运行下列命令。个人材料和输出保存在另一个简历项目中，模板保持可重复使用。

## 一次性准备

Node.js 20+：

```bash
npm ci
npx playwright install chromium
```

浏览器安装失败时可使用已安装的 Chrome/Edge，或通过 `RESUME_BROWSER_PATH` 指定本机浏览器可执行文件。Linux 上如果缺少浏览器系统库，按 Playwright 的错误信息补齐依赖。

需要提取 PDF 或查看最终 PDF 页面时，在可用 Python 环境安装：

```bash
python -m pip install pymupdf
```

需要把衣柜、打分表导成 Word／Excel 时，再装两个：

```bash
python -m pip install python-docx openpyxl
```

字体栈见 [版式规格](../layout-spec.md)。macOS 通常使用 PingFang SC，Windows 通常使用 Microsoft YaHei；没有中文字体的 Linux 环境先安装 Noto Sans SC 或思源黑体，检查实际导出，不能用空框替代中文。

## 制作与导出

1. 复制 `templates/resume.html` 到用户项目，如 `简历投递/公司_岗位/制作源文件/简历.html`。
2. 填写真实内容，按经历增删整块项目。基础 CSS 保持不变。模板已带浏览器编辑层（`<style id="editor-layer">`、工具栏、`.stage`/`.doc` 包裹、末尾 `<script>`），填写时只替换 `#doc` 里的内容块，其余保持原样，详见 [浏览器内改稿](../references/html-editor-layer.md)。有照片时用 `templates/header-with-photo.html` 替换页首，将照片存于项目自己的 `assets/` 并使用相对路径。
3. 运行：

```bash
node scripts/render_pdf.mjs --html="/path/to/简历.html" --out="/path/to/投递文件" --name="候选人姓名" --role="目标岗位" --suffix="目标公司"
```

`--html` 必填；`--out` 未指定时为当前目录的 `output/`。其余参数仅决定文件名。输入必须是本地 HTML，照片和字体采用本地或内嵌资源；渲染器阻止外部网络请求。

输出为命名 PDF、`preview.png` 和 `layout-check.json`。预览是浏览器按打印样式生成的整页截图；实际 PDF 的页数和 A4 尺寸另行验证。仍须检查最终 PDF 的真实页面图：

```bash
python scripts/extract_pdf.py "/path/to/投递文件/候选人姓名_目标岗位_简历_目标公司.pdf" --out="/path/to/PDF检查"
```

## 单页量尺与编辑层自检

```bash
node scripts/measure_layout.mjs --html="/path/to/制作源文件/简历.html"
node scripts/smoke_editor.mjs --html="/path/to/制作源文件/简历.html"
```

`measure_layout.mjs` 逐条打印每个 bullet、技能行和项目标题的毫米高度与估算行数，并给出单页余量。压回单页时用它决定删哪一行，不要靠猜；余量口径与浏览器编辑层右上角的「只剩 Xmm」一致（`297 −（内容底 − 页顶 + 9mm）`）。`render_pdf.mjs` 写进 `layout-check.json` 的 `bottomSpaceMm` 是内容底到纸张底，含这 9mm，不要当余量用。

`smoke_editor.mjs` 检查编辑层是否正常：JS 报错、工具栏按钮、编辑态、单页余量读数、照片已加载且不可删除、隐私遮罩（含 `?privacy=1`）、打印时是否隐藏。任一项不通过就以非零码退出，可直接用于交付前检查。

两个脚本与 `render_pdf.mjs` 共用 `browser.mjs`：启动 Chromium，失败时回退本机 Chrome/Edge（或用 `RESUME_BROWSER_PATH` 指定），并拦掉一切外部请求。

## 文档导出：衣柜 → Word、打分表 → Excel

```bash
python scripts/md_to_docx.py --md="/path/to/简历衣柜/简历衣柜.md" --out="/path/to/简历衣柜/简历衣柜.docx"
python scripts/md_tables_to_xlsx.py --md="/path/to/02_经历打分.md" --out="/path/to/02_经历打分.xlsx"
python scripts/md_tables_to_xlsx.py --md="简历投递/投递台账.md" --out="简历投递/投递台账.xlsx"
```

**markdown 是唯一可编辑源**，docx／xlsx 都是单向导出的视图：改内容要么改 md，要么让 Agent 按「记衣柜：…」回写，然后重新导出——不要反向手工编辑 docx 再当数据源。

`md_tables_to_xlsx.py` 会把 markdown 里每张表导成一个工作表（表名取最近的标题，表头加粗并冻结首行，列宽按内容自适应）；标题里含「采用／是否」的列会自动加「是,否」下拉，用户可以只在 Excel 里勾选、排序，改完直接回传。

## 常见问题

| 情况 | 下一步 |
| --- | --- |
| 提示占位符未填写 | 填写必要项；不适用的项目整块删除，不拿模板直接导出 |
| 提示照片加载失败 | 检查相对路径，使用项目内照片；不要继续交付缺图 PDF |
| 超出一页或横向溢出 | 优先删重复与缩短长句，再调整项目数量；保持字号与边距 |
| 页面明显留白 | 按岗位补问个人行动、取舍和交付；没有更多事实就保留适度留白 |
| 中文缺字 | 补齐中文字体再导出，并查看实际 PDF 页面图 |
| 浏览器里改完，PDF 还是旧的 | 「写回源文件」只改这份 HTML；点「导出 PDF」或重跑 `render_pdf.mjs` 后投递件才更新 |
| 交付的 HTML 没有工具栏 | 正文替换时删掉了编辑层，按 [浏览器内改稿](../references/html-editor-layer.md) 补回模板结构 |
| 隐私遮罩没盖住联系方式 | 手机号和邮箱要包 `<span class="pii">`；正文里的 URL 不要包，否则两端对齐的换行会变 |
| 「写回源文件」不可用 | Firefox/Safari 没有 File System Access，会自动回退成下载改后 HTML；Chrome/Edge 打开可直接写回 |
| 没有 Node/运行权限 | 先完成内容；由支持脚本的 Agent 或本机环境导出，不假称已生成 PDF |

## 虚构演示

```bash
node scripts/render_pdf.mjs --html="examples/demo.html" --out="output/demo" --name="示例姓名" --role="产品经理" --suffix="虚构演示"
```

演示中的信息全部虚构，照片区是占位图，不能把演示内容用于真实投递。演示能验证本机版式和导出链路，不能证明真实求职内容已完成核对。
