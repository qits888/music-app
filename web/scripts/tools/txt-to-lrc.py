#!/usr/bin/env python3
"""
将纯文本歌词转换为 LRC 格式。

用法：
  python txt-to-lrc.py 歌词.txt
  python txt-to-lrc.py 歌词.txt --title "歌名" --start 4 --interval 3.2
"""

from pathlib import Path
import argparse


def format_time(seconds: float) -> str:
    minutes = int(seconds // 60)
    secs = seconds % 60
    return f"[{minutes:02d}:{secs:05.2f}]"


def convert_to_lrc(
    text: str,
    title: str = "",
    artist: str = "",
    start: float = 3.0,
    base_interval: float = 3.2,
    pause: float = 1.8,
) -> str:
    lines = []
    if title:
        lines.append(f"[ti:{title}]")
    if artist:
        lines.append(f"[ar:{artist}]")
    lines.append("[by:MusicApp]")
    lines.append("")

    t = start
    for raw in text.splitlines():
        line = raw.strip().rstrip("，。,.")
        if not line:
            t += pause
            continue

        char_count = len(line)
        interval = base_interval + max(0, (char_count - 8) * 0.12)
        interval = min(interval, 5.5)
        lines.append(f"{format_time(t)}{line}")
        t += interval

    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser(description="TXT 歌词转 LRC")
    parser.add_argument("input", help="输入 .txt 文件路径")
    parser.add_argument("-o", "--output", help="输出 .lrc 文件路径（默认同名）")
    parser.add_argument("--title", default="", help="歌曲标题")
    parser.add_argument("--artist", default="", help="艺术家")
    parser.add_argument("--start", type=float, default=3.0, help="首句开始时间（秒）")
    parser.add_argument("--interval", type=float, default=3.2, help="基础行间隔（秒）")
    parser.add_argument("--pause", type=float, default=1.8, help="空行停顿（秒）")
    args = parser.parse_args()

    src = Path(args.input)
    if not src.exists():
        raise SystemExit(f"文件不存在: {src}")

    text = src.read_text(encoding="utf-8")
    title = args.title or src.stem
    lrc = convert_to_lrc(
        text,
        title=title,
        artist=args.artist,
        start=args.start,
        base_interval=args.interval,
        pause=args.pause,
    )

    out = Path(args.output) if args.output else src.with_suffix(".lrc")
    out.write_text(lrc, encoding="utf-8")
    print(f"已生成: {out}")


if __name__ == "__main__":
    main()