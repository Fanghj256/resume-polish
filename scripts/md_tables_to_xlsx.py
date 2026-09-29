"""Markdown → Excel（.xlsx）：把 markdown 里的表格逐张导出成一个 Excel 工作表。

常见用法是导出「经历打分表」，让用户直接在 Excel 里勾「采用」、排「简历顺序」，再回传给 Agent。
真相源仍然是 markdown；Excel 只是给用户填写的界面，**改完以 Excel 为准回读**。

用法：
    python scripts/md_tables_to_xlsx.py --md="/path/to/02_经历打分.md" --out="/path/to/02_经历打分.xlsx"

依赖：openpyxl（python -m pip install openpyxl）
"""
import argparse
import re
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

HEADER_FILL = PatternFill("solid", fgColor="1C1C1E")
HEADER_FONT = Font(color="FFFFFF", bold=True)
MAX_WIDTH = 60
MIN_WIDTH = 8


def is_separator(line: str) -> bool:
    return bool(re.fullmatch(r"\|[\s:|-]+\|", line.strip()))


def split_row(line: str) -> list[str]:
    return [cell.strip() for cell in line.strip().strip("|").split("|")]


def clean_sheet_name(name: str, used: set[str]) -> str:
    name = re.sub(r"[\\/*?:\[\]]", "-", name).strip() or "表"
    name = re.sub(r"^[#\s]+", "", name)[:28]
    candidate, index = name, 2
    while candidate in used:
        candidate = f"{name}-{index}"
        index += 1
    used.add(candidate)
    return candidate


def collect_tables(lines: list[str]) -> list[tuple[str, list[list[str]]]]:
    """返回 [(表名, 行列表)]，表名取最近的一级/二级/三级标题。"""
    tables, heading, index = [], "表格", 0
    while index < len(lines):
        line = lines[index].strip()
        match = re.match(r"^#{1,6}\s+(.*)$", line)
        if match:
            heading = match.group(1)
            index += 1
            continue
        if line.startswith("|") and index + 1 < len(lines) and is_separator(lines[index + 1]):
            rows = []
            while index < len(lines) and lines[index].strip().startswith("|"):
                if not is_separator(lines[index]):
                    rows.append(split_row(lines[index]))
                index += 1
            if rows:
                tables.append((heading, rows))
            continue
        index += 1
    return tables


def write_sheet(sheet, rows: list[list[str]]) -> None:
    width = max(len(row) for row in rows)
    for row in rows:
        sheet.append(row + [""] * (width - len(row)))
    for col in range(1, width + 1):
        sheet.cell(row=1, column=col).fill = HEADER_FILL
        sheet.cell(row=1, column=col).font = HEADER_FONT
        longest = max(len(str(sheet.cell(row=r, column=col).value or "")) for r in range(1, len(rows) + 1))
        sheet.column_dimensions[get_column_letter(col)].width = min(MAX_WIDTH, max(MIN_WIDTH, longest * 1.4 + 2))
    for row in sheet.iter_rows(min_row=2):
        for cell in row:
            cell.alignment = Alignment(vertical="top", wrap_text=True)
    sheet.freeze_panes = "A2"
    # 「采用」「是否」这类列给一个下拉，省得用户手打
    for col in range(1, width + 1):
        header = str(sheet.cell(row=1, column=col).value or "")
        if "采用" in header or "是否" in header:
            letter = get_column_letter(col)
            validation = DataValidation(type="list", formula1='"是,否"', allow_blank=True)
            sheet.add_data_validation(validation)
            validation.add(f"{letter}2:{letter}{max(len(rows), 2)}")


def convert(md_path: Path, out_path: Path) -> None:
    lines = md_path.read_text(encoding="utf-8").splitlines()
    tables = collect_tables(lines)
    if not tables:
        raise SystemExit(f"没有在 {md_path} 里找到 markdown 表格。")
    workbook = Workbook()
    workbook.remove(workbook.active)
    used: set[str] = set()
    for heading, rows in tables:
        write_sheet(workbook.create_sheet(clean_sheet_name(heading, used)), rows)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    workbook.save(out_path)
    print(f"已生成 {out_path}（{len(tables)} 张表）")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--md", type=Path, required=True, help="输入的 markdown 文件")
    parser.add_argument("--out", type=Path, required=True, help="输出的 xlsx 路径")
    args = parser.parse_args()
    if not args.md.is_file():
        parser.error(f"输入文件不存在：{args.md}")
    convert(args.md, args.out)


if __name__ == "__main__":
    main()
