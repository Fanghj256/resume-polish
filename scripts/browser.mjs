// 三个脚本共用：浏览器启动、本地页面打开、参数解析。
// 简历只读本地文件，这里统一拦掉一切外部请求。
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const arg = (key, fallback) =>
  process.argv.find(a => a.startsWith(`--${key}=`))?.slice(key.length + 3) ?? fallback;

export function requireHtmlPath(value) {
  if (!value) {
    console.error('请指定 --html="/path/to/简历.html"。');
    process.exit(1);
  }
  return path.resolve(value);
}

export async function launch() {
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

// 打开本地简历页，等字体与图片就绪。print=true 时切成打印样式（导出与量尺都用这个口径）。
export async function openLocalPage(browser, htmlPath, { deviceScaleFactor = 2, print = true } = {}) {
  const context = await browser.newContext({ viewport: { width: 1240, height: 1754 }, deviceScaleFactor });
  await context.route('**/*', route => /^(file:|data:|blob:)/.test(route.request().url()) ? route.continue() : route.abort());
  const page = await context.newPage();
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
  if (print) await page.emulateMedia({ media: 'print' });
  await page.evaluate(() => document.fonts.ready);
  return page;
}
