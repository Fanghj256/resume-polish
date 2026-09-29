// 编辑层冒烟测试：工具栏、编辑态、隐私遮罩、单页余量、照片保护、打印时隐藏。
// 任一项不通过就以非零码退出，便于自动检查。
import fs from 'node:fs/promises';
import { arg, launch, openLocalPage, requireHtmlPath } from './browser.mjs';

const htmlPath = requireHtmlPath(arg('html', process.argv[2]));
await fs.access(htmlPath);

const browser = await launch();
try {
  const page = await openLocalPage(browser, htmlPath, { print: false });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  const toolbar = page.locator('.toolbar');
  const before = await page.evaluate(() => {
    const bar = document.querySelector('.toolbar');
    const img = document.querySelector('.header img');
    return {
      docContainer: !!document.getElementById('doc'),
      pageWrapper: !!document.getElementById('stage'),
      toolbarVisible: !!bar && getComputedStyle(bar).display !== 'none',
      buttons: [...document.querySelectorAll('.toolbar button')].map(b => b.textContent.trim()),
      sections: [...document.querySelectorAll('.section-title')].map(t => t.textContent.trim()),
      items: document.querySelectorAll('.item').length,
      editingOff: document.getElementById('doc').getAttribute('contenteditable') !== 'true',
      fitHiddenWhenNotEditing: getComputedStyle(document.getElementById('pagefit')).display === 'none',
      photoSrc: img ? img.getAttribute('src') : null,
      photoOk: !img || (img.complete && img.naturalWidth > 0),
      photoLocked: !img || img.getAttribute('contenteditable') === 'false',
      piiCount: document.querySelectorAll('.pii').length,
      piiHasUrl: [...document.querySelectorAll('.pii')].some(el => /https?:\/\//.test(el.textContent)),
    };
  });

  await page.locator('#btn-edit').click();
  const editing = await page.evaluate(() => ({
    editingOn: document.getElementById('doc').getAttribute('contenteditable') === 'true',
    fmtVisible: getComputedStyle(document.getElementById('fmt')).display !== 'none',
    fitText: document.getElementById('pagefit').textContent.trim(),
    fitClass: document.getElementById('pagefit').className,
  }));
  await page.locator('#btn-edit').click();

  await page.locator('#btn-priv').click();
  const privacy = await page.evaluate(() => ({
    on: document.body.classList.contains('privacy'),
    masked: document.querySelector('.pii') ? getComputedStyle(document.querySelector('.pii')).color : null,
    photoBlurred: !document.querySelector('.header img') || getComputedStyle(document.querySelector('.header img')).filter !== 'none',
  }));
  await page.locator('#btn-priv').click();

  await page.locator('#btn-copy').click();
  await page
    .waitForFunction(() => /同步投递件/.test(document.getElementById('hint').textContent), null, { timeout: 5000 })
    .catch(() => {});
  const copyHint = await page.evaluate(() => document.getElementById('hint').textContent.trim());

  await page.goto(page.url().split('?')[0] + '?privacy=1', { waitUntil: 'networkidle' });
  const privacyByQuery = await page.evaluate(() => document.body.classList.contains('privacy'));

  await page.emulateMedia({ media: 'print' });
  const print = await page.evaluate(() => {
    const bar = document.querySelector('.toolbar');
    const stage = document.getElementById('stage');
    return {
      toolbarHidden: !bar || getComputedStyle(bar).display === 'none',
      stagePaddingZero: getComputedStyle(stage).paddingTop === '0px' && getComputedStyle(stage).paddingLeft === '0px',
      stageNoZoom: !stage.style.zoom || getComputedStyle(stage).zoom === '1',
    };
  });

  const saveApi = await page.evaluate(() => typeof window.showSaveFilePicker === 'function');

  const checks = {
    '无 JS 报错': errors.length === 0,
    '存在 #doc / #stage 容器': before.docContainer && before.pageWrapper,
    '工具栏可见且按钮齐全': before.toolbarVisible && before.buttons.filter(t => t.length > 1).length >= 5,
    '非编辑态默认不可编辑': before.editingOff && before.fitHiddenWhenNotEditing,
    '开启编辑后正文可编辑': editing.editingOn && editing.fmtVisible,
    '单页余量有读数': /单页 A4|超出/.test(editing.fitText),
    '照片已加载': before.photoOk,
    '照片不可编辑': before.photoLocked,
    '隐私遮罩包住 2 处联系方式': before.piiCount === 2 && !before.piiHasUrl,
    '隐藏隐私按钮生效': privacy.on && privacy.masked === 'rgba(0, 0, 0, 0)' && privacy.photoBlurred,
    '?privacy=1 默认开启': privacyByQuery,
    '复制同步话术可用': /同步投递件/.test(copyHint),
    '打印时不带工具栏': print.toolbarHidden && print.stagePaddingZero && print.stageNoZoom,
  };
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
  console.log(JSON.stringify({ file: htmlPath, sections: before.sections, items: before.items, photo: before.photoSrc, pagefit: editing.fitText, saveFilePicker: saveApi, errors, checks }, null, 1));
  console.log(failed.length ? `\n结论：不通过 —— ${failed.join('、')}` : '\n结论：全部通过');
  if (failed.length) process.exitCode = 1;
} finally {
  await browser.close();
}
