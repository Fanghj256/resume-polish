# 版式规格手册

`resume-builder` 的视觉锁定标准。任何编辑必须**沿用 templates/resume.html 内的 CSS 块**，下面的规格是给 agent 校对、给未来重构时还原版式用的，不是手动重新实现版式的指南。

---

## 一、纸张与边距

| 项 | 值 |
| --- | --- |
| 纸张 | A4 (210mm × 297mm) |
| `@page` margin | 0（边距由 `.page` 内 padding 控制） |
| `.page` padding | 顶 10.5mm / 右 12.5mm / 底 9mm / 左 12.5mm |
| 内容宽度 | 185mm（210 − 12.5 × 2） |
| 内容高度 | 277.5mm（297 − 10.5 − 9） |
| 渲染目标 | 严格单页 |

---

## 二、字体与字号

| 元素 | 字号 | 字重 | 行高 |
| --- | --- | --- | --- |
| 正文（body） | 9.15pt | 400 | 1.42 |
| 姓名（.name） | 25pt | 700 | 1 |
| 联系方式（.contact） | 9.2pt | 400 | — |
| 意向岗位标签（.label） | 8.7pt | 400 | letter-spacing 5px |
| 意向岗位（.target） | 13.2pt | 700 | — |
| Section 标题（.section-title） | 10.7pt | 700 | letter-spacing 1px |
| 项目/工作标题（.item-title） | 10.2pt | 700 | — |
| 项目时间/角色（.item-meta） | 8.9pt | 500 | nowrap |
| 教育/技能行 | 8.95–9.4pt | 700 表头 | — |
| Bullet 正文 | 9.05pt | 400 | 1.43 |

字体栈：`"PingFang SC", "Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", "Hiragino Sans GB", "Segoe UI", "Helvetica Neue", Arial, sans-serif`

---

## 三、配色

| 用途 | 色值 |
| --- | --- |
| 主文字 | `#1c1c1e` |
| 次要文字（item-meta、label） | `#4a4a4f` / `#6b6b6f` |
| 分隔线（.contact 的竖线） | `#c8c8c8` |
| Section 标题底色 | `#1c1c1e`（白字） |
| 页面背景 | `#fff` |

**排版元素只用黑/白/灰**，不增加彩色文字、边框或装饰。本人照片可保留原色，不必为了配色统一擅自转成黑白。

---

## 四、Section 结构

```
┌─ section ─────────────────────────────┐
│ ▌section-title（黑底白字 inline-block）│
│                                       │
│  内容区（edu-row / item / kv-row）    │
└───────────────────────────────────────┘
```

Section 之间间距：`margin-top: 8px`（首个 section 为 0）。Section 标题与内容间距：`margin-bottom: 4px`。

默认 Section 顺序（不存在的经历或荣誉可删去，不填虚构内容）：

1. 核心优势（3 条 bullets，每条 1–3 行）
2. 教育背景（1 行 edu-row）
3. 核心项目经历（通常 2–4 个 item；定制版按岗位相关性优先，同等相关性按时间倒序）
4. 工作经历（2–3 个 item，按时间倒序）
5. 技能与荣誉（2 行 kv-row：荣誉证书 + 核心技能）

---

## 五、关键栅格

### Header

```
flex space-between, align-items: flex-end
border-bottom: 1px solid #1c1c1e
padding-bottom: 7px
margin-bottom: 9px
```

左侧：姓名（粗黑大字） + 联系方式（手机 | 邮箱）
右侧：意向岗位标签（小灰字带 letter-spacing） + 意向岗位（中黑字）

### 有照片时的页首变体（默认使用合适的现有照片）

- 检查用户提供或指定的个人资料中的照片；旧简历没有照片，不代表新版也应省略。已有明确选择时沿用该照片，否则优先使用本人清晰的证件照或商务头像。
- 如用户要求无照片或岗位明确要求匿名/无照片，则用上方无照片页首。缺少现成商务照时，先走 `SKILL.md` 的“照片与内置商务照流程”：有清晰本人参考照就衔接内置证件照流程，没有可靠参考则引导补充照片；不要因为旧简历无照而直接跳过。只有多人照、明显文字/水印遮挡的图或身份不确定的照片时，先确认选择；不要拿身份证扫描件直接上简历。
- 左侧排“姓名 → 联系方式 → 意向岗位”，右侧放照片。保留 `.header` 的 flex 和底部分隔线，仅调整页首 HTML；照片可加局部尺寸样式，不改整份模板的字号、边距和 `<style>` 块。
- 照片尺寸以宽约 26–28mm、高约 30–34mm 为起点，按原图比例和页首内容微调。用 `object-fit: cover` 等比例裁切，并目视调整 `object-position`，完整保留头顶、面部和适当肩部；若裁切会损伤主体，改用保留原比例的尺寸。禁止拉伸或放大照片来填页。
- 原图完整保留；把所选图作为简历项目内相对路径依赖（如 `assets/portrait.png`），不要依赖临时剪贴板路径或易失效的远程图片链接。已有合适成片时直接复用；缺少成片时按内置证件照流程制作，严格保持本人面部特征。保留完整 3:4 成片，只在简历展示框内做必要裁切，不将照片写入 Skill 或公开仓库。
- 导出后同时检查整页可读性和实际 PDF 内的照片：图片已嵌入，不破图、不变形、不遮挡姓名/联系方式/意向岗位，仍为单页 A4。

### 教育背景 edu-row

```
display: grid
grid-template-columns: 1.35fr 1.35fr 0.7fr 1fr
column-gap: 14px
```

四列：学校（粗体） / 专业 / 学历 / 时间（右对齐灰色）

### 项目/工作 item-head

```
display: flex
justify-content: space-between
align-items: baseline
```

左：item-title（粗黑 10.2pt）
右：item-meta = `<span class="role">角色</span>时间`（角色加粗，role 与时间间距 14px）

### Bullets

```
list-style: none
正文 padding-left: 11px（给方块留位）
li::before { width: 3.5px; height: 3.5px; background: #1c1c1e; top: 0.55em; }
```

**3.5×3.5 px 实心方块**，不是圆点。bullet 间距 `margin: 1px 0`。

### 技能与荣誉 kv-row

```
display: grid
grid-template-columns: 76px 1fr
column-gap: 10px
```

两列：标签（76px 固定，粗体且 `white-space: nowrap`） / 内容。`Vibe Coding` 等标签必须保持单行。

---

## 六、渲染参数（render_pdf.mjs 锁死）

```js
viewport: { width: 1240, height: 1754 }
deviceScaleFactor: 2
emulateMedia: 'print'
pdf: {
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
}
```

`preferCSSPageSize: true` 让 `@page { size: A4; margin: 0 }` 生效，避免 Playwright 自动加 margin。

---

## 七、单页容量：同时检查留白与溢出

“一页”只是页数要求。内容要清晰、充分地证明岗位匹配度；不能把半页材料直接当作完成，也不追求把每个空隙塞满。

### 明显留白时

- 结合整页预览与实际 PDF 检查最后一行的位置，不用 `.page` 高度判断内容是否充足，因为容器本身可能已设为 A4 高度。
- 正文终点距页面底部超过约 25mm，可作为复查提示（包括固定 9mm 底边距），不是必须填到的硬指标；更关键的是是否仍有目标岗位相关、已确认却未写入的经历。
- 优先扩充核心项目中的本人行动、判断、协同和已知结果/跟进；再考虑加入另一项能证明不同岗位能力的真实项目，遵循 `style-guide.md` 的“让核心项目写充分”部分。
- 不靠放大字号、行距、区块间距或照片填满；也不增加重复技能、泛化形容词和无依据的数据。
- 证据已经充分或没有更多可靠材料时允许留白，简要说明限制；不能把填页压力转成编造经历。

### 溢出时

按修改风险**从低到高**：

1. 缩短最长 bullet 一句话（最安全）。
2. 删掉某个项目的尾条 bullet（中等风险）。
3. 合并两段相邻短工作经历（影响经历完整性）。
4. ⚠️ **绝不要** 改字号、行高、margin、padding —— 一改全盘版式都要重新校对。

---

## 八、视觉 QA checklist

```
- [ ] 实际 PDF 仍为单页 A4，未仅凭浏览器截图判断
- [ ] 页面无明显未利用空间，或已确认没有可补充的相关证据
- [ ] 核心项目充分呈现岗位相关行动，没有重复凑字或修改版式填页
- [ ] Header 左右两端对齐；有合适照片时已采用含照片页首，或有明确省略依据
- [ ] 所选照片身份与版本正确，实际 PDF 已嵌入，裁切自然且无拉伸/遮挡
- [ ] 每个 section 的标题都是黑底白字
- [ ] bullet 是方块不是圆点
- [ ] 所有 item 的"角色 + 时间"都对齐右侧
- [ ] 技能与荣誉左侧标签均保持单行
- [ ] 文字与装饰保持黑/白/灰；照片允许保留原色
- [ ] 没有任何 {{占位符}} 漏渲染
```
