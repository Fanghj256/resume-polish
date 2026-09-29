# 来源与原创说明

本仓库是基于 **xupengli406-del/resume-builder** 的二次开发。上游的原始提交保留在版本历史里（`91b76be` *Publish standalone resume skill with guided intake and private-data separation*），作者署名仍在该提交中，来源可追溯。

下面把「哪些沿用上游、哪些是本仓库新增」逐项写清楚。

## 一、沿用上游的部分（呈现层）

| 模块 | 具体文件 |
| --- | --- |
| A4 单页模板与视觉规范 | `templates/resume.html` 的 CSS 与版式、`templates/header-with-photo.html`、`layout-spec.md`、`style-guide.md`、`version-strategy.md` |
| 示例 | `examples/demo.html`、`examples/preview.png`、`examples/portrait-placeholder.svg` |
| PDF 导出链路 | `scripts/render_pdf.mjs`、`scripts/extract_pdf.py` 及其依赖说明 |
| 信息引导与追问 | `references/intake-and-follow-up.md` |
| 商务照流程 | `references/american-business-headshot/`（作者独立发布，MIT，许可原文随附在该目录内） |

这些文件里的改动仅限于：区块名统一（「核心项目经历」→「实践与项目经历」）、为内建编辑层增加的包裹与脚本、以及随流程调整的文档措辞。

## 二、本仓库新增的部分（方法与工具层）

| 模块 | 具体文件 | 说明 |
| --- | --- | --- |
| 浏览器编辑层 | `templates/resume.html`、`examples/demo.html` 内的 `<style id="editor-layer">`／`.toolbar`／尾部 `<script>` | 在页面上直接改字、看单页余量、隐藏隐私、导出 PDF、写回源文件。由本人早前简历项目里的编辑器移植而来，**非上游代码** |
| 五步工作流 | `references/workflow.md` | 建立简历衣柜 → 拆解 JD → 匹配打分 → 写成条目 → 投递前质检 |
| 提示词库 | `references/prompts.md` | 五个环节的提示词模板 |
| 单页量尺与编辑层冒烟 | `scripts/measure_layout.mjs`、`scripts/smoke_editor.mjs`、`scripts/browser.mjs` | 压单页时定位该删哪一行；交付前自检编辑层 |
| 文档导出 | `scripts/md_to_docx.py`、`scripts/md_tables_to_xlsx.py` | 衣柜 md→Word、打分表 md→Excel |
| 目录约定与进度卡 | `templates/progress-card.md`、`references/workflow.md` | 数据目录与 Skill 目录分离；岗位级进度与待确认事项 |
| 编辑层说明 | `references/html-editor-layer.md` | 编辑层的做法、边界与不能踩的坑 |

## 三、与原作者的差异

上游的思路是「上传 JD + 经历 → 生成一份简历」，经历只活在这一次对话里；本仓库先把经历沉淀成可复用的**简历衣柜**，之后每投一个岗位只跑后面四步——投得越多，衣柜越厚，前面几步越省事。

## 四、许可

- **本仓库原创部分**（第二节列出的文件）采用 MIT 许可，见 [LICENSE](LICENSE)，可自由使用、修改、再分发。
- **沿用上游的部分**（第一节列出的文件）版权归原作者 `xupengli406-del` 所有。本仓库作者已与原作者沟通并获其同意（2026-09-29）。这部分**不在本仓库 MIT 许可的覆盖范围内**：上游 `resume-builder` 仓库未附许可证文件（默认保留所有权利），其 `american-business-headshot` 为 MIT、许可原文随附在 `references/american-business-headshot/LICENSE`。
- 因此：使用、修改本仓库的**原创部分**没有限制；再分发其中沿用自上游的文件前，仍需另行取得原作者许可。范围速览另见 [NOTICE.md](NOTICE.md)。
