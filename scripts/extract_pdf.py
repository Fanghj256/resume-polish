"""Extract text and actual PDF page renders to a user-selected local folder."""
import argparse
import json
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('pdf', type=Path)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    try:
        import pymupdf as fitz
    except ImportError:
        parser.exit(2, '缺少 PyMuPDF，请先运行 python -m pip install pymupdf。\n')
    if not args.pdf.is_file():
        parser.error('输入 PDF 不存在。')
    args.out.mkdir(parents=True, exist_ok=True)
    with fitz.open(args.pdf) as doc:
        text, pages = [], []
        for index, page in enumerate(doc, 1):
            text.append(f'## 第 {index} 页\n\n{page.get_text()}')
            page.get_pixmap(matrix=fitz.Matrix(2.5, 2.5)).save(args.out / f'page_{index:02}.png')
            pages.append({'page': index, 'width': page.rect.width, 'height': page.rect.height})
        (args.out / 'extracted.md').write_text('\n\n'.join(text), encoding='utf-8')
        (args.out / 'pages.json').write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding='utf-8')
        print(f'已提取 {len(pages)} 页至 {args.out}。若文本为空，请查看实际页面图。')


if __name__ == '__main__':
    main()
