#!/usr/bin/env python3
"""把 resume-polish 更新到最新版。

用法：
    python scripts/update_self.py              # 拉取最新代码，必要时同步依赖
    python scripts/update_self.py --skip-npm   # 只拉代码
    python scripts/update_self.py --remote upstream

做四件事：
  ① 确认这是 git 克隆（ZIP／复制安装的会给出手动更新指引，不硬来）
  ② 确认已跟踪文件没有未提交的改动（有就停下，避免冲突）
  ③ git pull --ff-only（只做快进，不产生意外合并）
  ④ 只有 package.json 变了才跑 npm ci（没变就跳过，省时间）

依赖：Python 3.9+，标准库即可；git 必须可用。
"""
from __future__ import annotations

import argparse
import hashlib
import shutil
import subprocess
import sys
from pathlib import Path

TOOLS_DIR = Path(__file__).resolve().parent
REPO_ROOT = TOOLS_DIR.parent
PACKAGE_JSON = REPO_ROOT / "package.json"
SKILL_MD = REPO_ROOT / "SKILL.md"

NOT_A_REPO = """这份 resume-polish 不是 git 克隆，无法自动更新。

它现在的路径：{root}

如果你是用下载 ZIP／复制文件夹安装的：
  1. 重新下载最新版：https://github.com/Fanghj256/resume-polish/releases/latest
  2. 解压到一个新文件夹，把你原来的资料目录（衣柜、投递件）照旧留在原处——
     它们本来就不在技能目录里，不需要搬
  3. 重新装依赖：npm ci 与 npx playwright install chromium；
     用到 Word／Excel 导出时再 pip install pymupdf python-docx openpyxl
  4. 想以后一条命令更新：改用 git clone 安装（推荐）

推荐装法（一次到位）：
  cd ~/.zcode/skills
  git clone https://github.com/Fanghj256/resume-polish.git
  cd resume-polish && npm ci && npx playwright install chromium
国内网络不稳时，可先给仓库建一个 AtomGit／Gitee 镜像再克隆，见
references/mirror-and-network.md。"""


def setup_stdio() -> None:
    """Windows 控制台默认 GBK，中文提示容易乱码；能改就改成 UTF-8。"""
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8")  # type: ignore[union-attr]
        except (AttributeError, OSError):
            pass


def say(message: str = "") -> None:
    print(message, file=sys.stderr)


def git(args: list[str], *, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", *args],
        cwd=REPO_ROOT,
        check=check,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )


def digest(path: Path) -> str | None:
    if not path.is_file():
        return None
    return hashlib.sha256(path.read_bytes()).hexdigest()


def ensure_repo(remote: str) -> None:
    if not (REPO_ROOT / ".git").exists():
        raise RuntimeError(NOT_A_REPO.format(root=REPO_ROOT))
    if not SKILL_MD.is_file():
        raise RuntimeError(f"{REPO_ROOT} 看起来不是 resume-polish 仓库（缺 SKILL.md）。")
    if shutil.which("git") is None:
        raise RuntimeError("找不到 git，请先安装 git。")
    if git(["remote", "get-url", remote], check=False).returncode != 0:
        raise RuntimeError(f"仓库里没有名为 {remote} 的远程，检查一下 git remote -v。")


def ensure_clean() -> None:
    status = git(["status", "--porcelain", "--untracked-files=no"], check=False)
    if status.returncode != 0:
        raise RuntimeError((status.stderr or status.stdout).strip() or "无法读取 git 状态。")
    if status.stdout.strip():
        raise RuntimeError(
            "检测到未提交的改动（已跟踪文件被改过）。\n"
            "请先 commit 或 stash 再更新，例如：\n"
            "  git stash        # 暂时收起改动\n"
            "  git stash pop    # 更新完再放回来"
        )


def sync_npm() -> None:
    npm = shutil.which("npm")
    if npm is None:
        say("package.json 变了，但找不到 npm。装了 Node.js 20+ 后再手动跑：npm ci")
        return
    say("package.json 有变化，正在同步依赖（npm ci）…")
    if sys.platform == "win32":
        command = f'"{npm}" ci --no-audit --no-fund'
        result = subprocess.run(command, cwd=REPO_ROOT, shell=True, text=True, encoding="utf-8", errors="replace")
    else:
        result = subprocess.run([npm, "ci", "--no-audit", "--no-fund"], cwd=REPO_ROOT, text=True,
                                encoding="utf-8", errors="replace")
    say("依赖同步完成。" if result.returncode == 0 else "依赖同步失败，请手动跑：npm ci")


def main(argv: list[str] | None = None) -> int:
    setup_stdio()
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--skip-npm", action="store_true", help="即使 package.json 变了也不装依赖")
    parser.add_argument("--remote", default="origin", help="用哪个远程更新，默认 origin")
    args = parser.parse_args(argv)

    try:
        ensure_repo(args.remote)
        ensure_clean()

        before_head = git(["rev-parse", "HEAD"]).stdout.strip()
        before_pkg = digest(PACKAGE_JSON)

        say(f"仓库：{REPO_ROOT}")
        say(f"远程：{args.remote}")
        pull = git(["pull", "--ff-only", args.remote], check=False)
        output = (pull.stdout + pull.stderr).strip()
        if pull.returncode != 0:
            raise RuntimeError(f"git pull 失败：\n{output}")
        if output:
            say(output)

        after_head = git(["rev-parse", "HEAD"]).stdout.strip()
        if before_head == after_head:
            say("已经是最新版。")
        else:
            say(f"已更新：{before_head[:7]} → {after_head[:7]}")
            say(git(["log", "--oneline", f"{before_head}..{after_head}"], check=False).stdout.strip())

        if args.skip_npm:
            say("按参数跳过依赖同步（--skip-npm）。")
        elif before_pkg != digest(PACKAGE_JSON):
            sync_npm()
        else:
            say("package.json 没变，跳过依赖同步。")

        if before_head != after_head:
            say()
            say("提示：")
            say("  · 新的会话才会加载更新后的技能说明（当前会话可继续用，但可能读的是旧内容）")
            say("  · 用到 Word／Excel 导出时报缺包，跑：python -m pip install pymupdf python-docx openpyxl")
            say("  · 浏览器导出异常时，跑：npx playwright install chromium")
        return 0
    except RuntimeError as error:
        say(str(error))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
