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

字体栈见 [版式规格](../layout-spec.md)。macOS 通常使用 PingFang SC，Windows 通常使用 Microsoft YaHei；没有中文字体的 Linux 环境先安装 Noto Sans SC 或思源黑体，检查实际导出，不能用空框替代中文。

## 制作与导出

1. 复制 `templates/resume.html` 到用户项目，如 `简历投递/公司_岗位/制作源文件/简历.html`。
2. 填写真实内容，按经历增删整块项目。基础 CSS 保持不变。有照片时用 `templates/header-with-photo.html` 替换页首，将照片存于项目自己的 `assets/` 并使用相对路径。
3. 运行：

```bash
node scripts/render_pdf.mjs --html="/path/to/简历.html" --out="/path/to/投递文件" --name="候选人姓名" --role="目标岗位" --suffix="目标公司"
```

`--html` 必填；`--out` 未指定时为当前目录的 `output/`。其余参数仅决定文件名。输入必须是本地 HTML，照片和字体采用本地或内嵌资源；渲染器阻止外部网络请求。

输出为命名 PDF、`preview.png` 和 `layout-check.json`。预览是浏览器按打印样式生成的整页截图；实际 PDF 的页数和 A4 尺寸另行验证。仍须检查最终 PDF 的真实页面图：

```bash
python scripts/extract_pdf.py "/path/to/投递文件/候选人姓名_目标岗位_简历_目标公司.pdf" --out="/path/to/PDF检查"
```

## 常见问题

| 情况 | 下一步 |
| --- | --- |
| 提示占位符未填写 | 填写必要项；不适用的项目整块删除，不拿模板直接导出 |
| 提示照片加载失败 | 检查相对路径，使用项目内照片；不要继续交付缺图 PDF |
| 超出一页或横向溢出 | 优先删重复与缩短长句，再调整项目数量；保持字号与边距 |
| 页面明显留白 | 按岗位补问个人行动、取舍和交付；没有更多事实就保留适度留白 |
| 中文缺字 | 补齐中文字体再导出，并查看实际 PDF 页面图 |
| 没有 Node/运行权限 | 先完成内容；由支持脚本的 Agent 或本机环境导出，不假称已生成 PDF |

## 虚构演示

```bash
node scripts/render_pdf.mjs --html="examples/demo.html" --out="output/demo" --name="示例姓名" --role="产品经理" --suffix="虚构演示"
```

演示中的信息全部虚构，照片区是占位图，不能把演示内容用于真实投递。演示能验证本机版式和导出链路，不能证明真实求职内容已完成核对。
