// Render a filled, local resume HTML without modifying the Skill template.
import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const arg = (key, fallback) => process.argv.find(a => a.startsWith(`--${key}=`))?.slice(key.length + 3) ?? fallback;
const clean = value => value.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').trim() || '简历';

async function launch() {
  if (process.env.RESUME_BROWSER_PATH) return chromium.launch({ executablePath: process.env.RESUME_BROWSER_PATH });
  try { return await chromium.launch(); }
  catch (firstError) {
    const candidates = process.platform === 'darwin'
      ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge']
      : process.platform === 'win32'
        ? [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA].filter(Boolean)
          .flatMap(base => [path.join(base, 'Google/Chrome/Application/chrome.exe'), path.join(base, 'Microsoft/Edge/Application/msedge.exe')])
        : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
    for (const executablePath of candidates) {
      try { await fs.access(executablePath); return await chromium.launch({ executablePath }); } catch {}
    }
    throw new Error(`无法启动浏览器。请运行 npx playwright install chromium，或设置 RESUME_BROWSER_PATH。\n${firstError.message}`);
  }
}

async function main() {
  const input = arg('html');
  if (!input) throw new Error('请指定 --html="已填好的简历.html"，--out="投递目录"。不要覆盖 Skill 自带模板。');
  const htmlPath = path.resolve(input);
  const html = await fs.readFile(htmlPath, 'utf8');
  const leftovers = html.replace(/<!--[\s\S]*?-->/g, '').match(/\{\{[^}]+\}\}/g);
  if (leftovers) throw new Error(`仍有未填写的占位符：${[...new Set(leftovers)].join('、')}`);
  const out = path.resolve(arg('out', 'output'));
  const name = clean(arg('name', '候选人'));
  const role = clean(arg('role', '目标岗位'));
  const suffix = clean(arg('suffix', '通用'));
  const browser = await launch();
  try {
    const context = await browser.newContext({ viewport: { width: 1240, height: 1754 }, deviceScaleFactor: 2 });
    // The resume should use local assets; no external upload or remote image/font request.
    await context.route('**/*', route => /^(file:|data:|blob:)/.test(route.request().url()) ? route.continue() : route.abort());
    const page = await context.newPage();
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'print' });
    await page.evaluate(() => document.fonts.ready);
    const metrics = await page.evaluate(async () => {
      await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
      const container = document.querySelector('.page');
      if (!container) throw new Error('缺少 .page 容器，请使用提供的模板。');
      const rect = container.getBoundingClientRect();
      const wrappedLabels = [...document.querySelectorAll('.kv-row > div:first-child')].filter(node => {
        const range = document.createRange(); range.selectNodeContents(node);
        return range.getClientRects().length !== 1;
      }).map(node => node.textContent.trim());
      const brokenImages = [...document.images].filter(img => !img.complete || img.naturalWidth === 0).map(img => img.getAttribute('src'));
      const elements = [...container.querySelectorAll('li,.item-head,.edu-row,.kv-row,.header,.section-title,img')];
      const contentBottom = Math.max(rect.top, ...elements.map(node => node.getBoundingClientRect().bottom));
      const horizontalOverflow = elements.some(node => {
        const r = node.getBoundingClientRect();
        return r.left < rect.left - 1 || r.right > rect.right + 1 || node.scrollWidth > node.clientWidth + 2;
      });
      return { pageWidth: rect.width, pageHeight: rect.height, contentBottom: contentBottom - rect.top,
        bottomSpaceMm: (rect.bottom - contentBottom) * 25.4 / 96, wrappedLabels, brokenImages, horizontalOverflow };
    });
    if (metrics.brokenImages.length) throw new Error(`图片无法加载：${metrics.brokenImages.join('、')}`);
    if (metrics.wrappedLabels.length) throw new Error(`技能标签换行：${metrics.wrappedLabels.join('、')}`);
    if (metrics.horizontalOverflow) throw new Error('检测到横向溢出，请缩短文本或修正局部结构，不要缩小全局字号。');
    if (metrics.pageHeight > 297 / 25.4 * 96 + 1 || Math.abs(metrics.pageWidth - 210 / 25.4 * 96) > 1)
      throw new Error('内容超出单页 A4 或页面宽度不正确，请先调整正文。');
    const bytes = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' } });
    const pdf = await PDFDocument.load(bytes);
    if (pdf.getPageCount() !== 1) throw new Error(`实际 PDF 有 ${pdf.getPageCount()} 页，需要调整到一页。`);
    const { width, height } = pdf.getPage(0).getSize();
    if (Math.abs(width - 595.276) > 1 || Math.abs(height - 841.89) > 1) throw new Error('实际 PDF 不是 A4。');
    await fs.mkdir(out, { recursive: true });
    const pdfPath = path.join(out, `${name}_${role}_简历_${suffix}.pdf`);
    await fs.writeFile(pdfPath, bytes);
    await page.locator('.page').screenshot({ path: path.join(out, 'preview.png') });
    await fs.writeFile(path.join(out, 'layout-check.json'), JSON.stringify({ pages: 1, widthPt: width, heightPt: height, ...metrics }, null, 2));
    console.log(`PDF: ${pdfPath}\n预览: ${path.join(out, 'preview.png')}`);
    if (metrics.bottomSpaceMm > 25) console.log(`提示：末行距底部约 ${metrics.bottomSpaceMm.toFixed(1)}mm，请检查是否遗漏岗位相关证据；不要无依据填页。`);
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
