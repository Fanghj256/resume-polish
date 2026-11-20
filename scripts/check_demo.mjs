import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(ROOT, path), 'utf8');

function fail(message) {
  console.error('check:demo 失败：' + message);
  process.exit(1);
}

function styleBlock(html, name) {
  const match = html.match(/<style>([\s\S]*?)<\/style>/);
  if (!match) fail(name + ' 缺少基础 <style> 块');
  return match[1];
}

function headerRule(css, name) {
  const match = css.match(/\.header\s*\{([^}]*)\}/);
  if (!match) fail(name + ' 缺少 .header 规则');
  return match[1];
}

function cssValue(rule, prop) {
  const match = rule.match(new RegExp(prop + '\\s*:\\s*([^;]+);'));
  return match ? match[1].trim() : '';
}

function sectionOrder(html, name) {
  const sections = [...html.matchAll(/<div class="section-title">([^<]+)<\/div>/g)]
    .map((match) => match[1].trim());
  if (!sections.length) fail(name + ' 没有找到 section-title');
  return sections;
}

const template = read('templates/resume.html');
const demo = read('examples/demo.html');

const templateHeader = headerRule(styleBlock(template, 'templates/resume.html'), 'templates/resume.html');
const demoHeader = headerRule(styleBlock(demo, 'examples/demo.html'), 'examples/demo.html');

for (const prop of ['padding-bottom', 'margin-bottom']) {
  const expected = cssValue(templateHeader, prop);
  const actual = cssValue(demoHeader, prop);
  if (!expected) fail('模板 .header 缺少 ' + prop);
  if (expected !== actual) {
    fail(`demo 的 .header ${prop} 是 ${actual || '(空)'}，模板是 ${expected}`);
  }
}

const templateSections = sectionOrder(template, 'templates/resume.html');
const demoSections = sectionOrder(demo, 'examples/demo.html');
if (templateSections.join(' → ') !== demoSections.join(' → ')) {
  fail('demo 的 section 顺序与模板不一致：\n  模板：' + templateSections.join(' → ') +
    '\n  demo：' + demoSections.join(' → '));
}

if (/\{\{[^}]+\}\}/.test(demo)) {
  fail('demo 里还有未填写的 {{placeholder}}');
}
if (!demo.includes('id="editor-layer"')) {
  fail('demo 缺少浏览器编辑层，无法用于验证编辑/导出链路');
}

console.log(`check:demo 通过：header ${cssValue(templateHeader, 'padding-bottom')} / ` +
  `${cssValue(templateHeader, 'margin-bottom')}，section 顺序一致。`);