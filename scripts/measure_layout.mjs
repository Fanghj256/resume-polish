// 单页量尺：逐条列出每个 li / kv-row / item-head 的毫米高度与估算行数，压单页时用它定位该删哪一行。
// 余量口径与 HTML 编辑层的「只剩 Xmm」一致：297 −（内容底 − 页顶 + 9mm 底边距）。
import fs from 'node:fs/promises';
import { arg, launch, openLocalPage, requireHtmlPath } from './browser.mjs';

const htmlPath = requireHtmlPath(arg('html', process.argv[2]));
await fs.access(htmlPath);

const browser = await launch();
try {
  const page = await openLocalPage(browser, htmlPath, { print: true });
  const m = await page.evaluate(async () => {
    await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
    const container = document.querySelector('.page');
    if (!container) throw new Error('缺少 .page 容器，请使用提供的模板。');
    const rect = container.getBoundingClientRect();
    const padBottom = parseFloat(getComputedStyle(container).paddingBottom) || 0;
    const px2mm = v => v / (rect.width / 210);
    const elements = [...container.querySelectorAll('li,.item-head,.edu-row,.kv-row,.header,.section-title,img')];
    const contentBottom = Math.max(rect.top, ...elements.map(n => n.getBoundingClientRect().bottom));
    const usedMm = px2mm(contentBottom - rect.top) + (padBottom * 25.4 / 96);
    const lines = [];
    container.querySelectorAll('.section').forEach(sec => {
      lines.push(`## ${sec.querySelector('.section-title').textContent.trim()}  ${px2mm(sec.getBoundingClientRect().height).toFixed(1)}mm`);
      sec.querySelectorAll(':scope > .item').forEach(item => {
        const head = item.querySelector('.item-head');
        lines.push(`  * ${item.querySelector('.item-title').textContent.trim()} | head ${px2mm(head.getBoundingClientRect().height).toFixed(1)} | item ${px2mm(item.getBoundingClientRect().height).toFixed(1)}`);
        item.querySelectorAll('li').forEach(li => {
          const lh = parseFloat(getComputedStyle(li).lineHeight);
          const rows = Math.round((li.getBoundingClientRect().height - 2) / lh);
          lines.push(`      li ${px2mm(li.getBoundingClientRect().height).toFixed(1)}mm ~${rows}行 | ${li.textContent.trim().slice(0, 28)}`);
        });
      });
      sec.querySelectorAll(':scope > .kv-row').forEach(kv => {
        const lh = parseFloat(getComputedStyle(kv).lineHeight);
        lines.push(`  kv ${px2mm(kv.getBoundingClientRect().height).toFixed(1)}mm ~${Math.round((kv.getBoundingClientRect().height - 2) / lh)}行 | ${kv.children[0].textContent.trim()}`);
      });
      sec.querySelectorAll(':scope > ul.bullets > li').forEach(li => {
        const lh = parseFloat(getComputedStyle(li).lineHeight);
        lines.push(`  li ${px2mm(li.getBoundingClientRect().height).toFixed(1)}mm ~${Math.round((li.getBoundingClientRect().height - 2) / lh)}行 | ${li.textContent.trim().slice(0, 30)}`);
      });
    });
    return { usedMm, remainMm: 297 - usedMm, lines };
  });
  console.log(m.lines.join('\n'));
  console.log(`\n内容底距页顶 ${(m.usedMm - 9).toFixed(1)}mm + 9mm 底边距 = 已用 ${m.usedMm.toFixed(1)}mm`);
  console.log(`单页余量 ${m.remainMm.toFixed(1)}mm（可用内容高 277.5mm；此口径与编辑层的「只剩 Xmm」一致）`);
  console.log(m.remainMm < 0 ? '结论：已超出单页，导出会分成两页。' : `结论：还剩 ${m.remainMm.toFixed(1)}mm。`);
} finally {
  await browser.close();
}
