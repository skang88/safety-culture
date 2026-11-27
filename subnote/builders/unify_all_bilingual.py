# -*- coding: utf-8 -*-
"""
Unified Builder for Chapters 1-16 Bilingual Parallel Readers
Generates chapter{1..16}_bilingual.html directly from chapter{1..16}_bilingual.json
with identical Ch 1-3 architecture:
- Unified sticky top header (Portal Home, TOC toggle, Chapter badge + title,
  Search, 5:5/EN/KO switcher, Font A-/A+, Prev/Next Chapter, Subnote link, Dark/Light toggle)
- Left sticky Table of Contents sidebar auto-extracted from headings
- Hero chapter title banner (EN + KO + total blocks)
- Boxed max-w-7xl 1:1 .en-pane / .ko-pane card layout (fixing Ch 5 full-bleed & Ch 10 empty body)
- Complete Light Mode CSS overrides + localStorage('safety_culture_theme') persistence
"""

import html
import json
import os
import re

CHAPTER_KO_FALLBACK = {
    1: "안전에 대한 지각의 정의",
    2: "조직문화 분석",
    3: "네트워크 분석 및 활용",
    4: "안전문화를 위한 방향 설정",
    5: "기본 안전경영시스템(SMS) 개요",
    6: "안전 프로세스 구축",
    7: "리더십 및 안전문화 평가",
    8: "안전경영시스템에의 근로자 참여 유도",
    9: "위험 지각의 정의",
    10: "기본적 위험 관리 원칙의 이해",
    11: "활동 기반 안전시스템(ABSS)의 구축",
    12: "직무 위험성 평가(JHA)의 활용",
    13: "안전 교육훈련 요구사항의 수립",
    14: "안전경영시스템(SMS) 자체평가",
    15: "안전경영시스템을 위한 정보 큐레이션",
    16: "콘텐츠 제작 전략 개발",
}


def format_inline(text: str) -> str:
    """Format markdown inline emphasis/code/links without dropping HTML line breaks."""
    # Preserve explicit <br> / <br/> while formatting markdown spans
    text = re.sub(r"`([^`]+)`", r'<code class="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-xs border border-slate-700/60">\1</code>', text)
    text = re.sub(r"\*\*(.+?)\*\*", r'<strong class="text-white font-semibold">\1</strong>', text)
    text = re.sub(r"(?<!\*)\*([^*]+?)\*(?!\*)", r'<em class="text-sky-300 not-italic font-medium">\1</em>', text)
    text = re.sub(
        r"\[([^\]]+)\]\((https?://[^)]+)\)",
        r'<a href="\2" target="_blank" rel="noopener noreferrer" class="text-sky-400 underline underline-offset-2 hover:text-sky-300">\1</a>',
        text,
    )
    return text


def md_to_html(md_text: str) -> str:
    """Convert block markdown to styled HTML snippets while preserving 100% of content."""
    if not md_text or not md_text.strip():
        return ""

    # Strip HTML comments (e.g., <!-- ![alt](image-xxx.png) -->) so broken placeholder images don't render
    cleaned_md = re.sub(r"<!--.*?-->", "", md_text, flags=re.S)
    lines = cleaned_md.strip().split("\n")
    parts = []
    i = 0
    n = len(lines)

    while i < n:
        raw_line = lines[i]
        line = raw_line.strip()
        if not line:
            i += 1
            continue

        # Horizontal rule
        if re.match(r"^[-*_]{3,}$", line):
            parts.append('<hr class="border-slate-800 my-4" />')
            i += 1
            continue

        # Fenced code block
        if line.startswith("```"):
            lang = line[3:].strip()
            code_lines = []
            i += 1
            while i < n and not lines[i].strip().startswith("```"):
                code_lines.append(html.escape(lines[i]))
                i += 1
            if i < n:
                i += 1
            code_body = "\n".join(code_lines)
            parts.append(
                f'<pre class="my-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto text-xs font-mono text-sky-300"><code>{code_body}</code></pre>'
            )
            continue

        # Headings (# to ####)
        if line.startswith("#### "):
            t = format_inline(line[5:].strip())
            parts.append(f'<h4 class="text-base lg:text-lg font-semibold text-teal-300 mt-4 mb-2">{t}</h4>')
            i += 1
            continue
        if line.startswith("### "):
            t = format_inline(line[4:].strip())
            parts.append(f'<h3 class="text-lg lg:text-xl font-bold text-amber-300 mt-4 mb-2">{t}</h3>')
            i += 1
            continue
        if line.startswith("## "):
            t = format_inline(line[3:].strip())
            parts.append(
                f'<h2 class="text-xl lg:text-2xl font-bold text-sky-400 tracking-tight mt-2 mb-3 flex items-center gap-2"><span class="w-1.5 h-5 rounded bg-sky-400 inline-block shrink-0"></span><span>{t}</span></h2>'
            )
            i += 1
            continue
        if line.startswith("# "):
            t = format_inline(line[2:].strip())
            parts.append(
                f'<h1 class="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-3 border-b border-sky-500/30 pb-3">{t}</h1>'
            )
            i += 1
            continue

        # Image line
        img_match = re.match(r"^!\[(.*?)\]\(([^)]+)\)$", line)
        if img_match:
            alt_raw = img_match.group(1).strip()
            alt_txt, src = html.escape(alt_raw), html.escape(img_match.group(2).strip())
            if "image-xxx" not in src:
                cap_html = (
                    f'<p class="text-[11px] text-slate-400 mt-1.5">{alt_txt}</p>'
                    if alt_raw.lower() not in ("", "alt text", "image", "img")
                    else ""
                )
                parts.append(
                    f'<div class="my-4 text-center"><img src="{src}" alt="{alt_txt}" class="rounded-xl shadow-lg mx-auto max-h-96 border border-slate-700 bg-slate-900 p-2 object-contain" />{cap_html}</div>'
                )
            i += 1
            continue

        # Blockquote
        if line.startswith(">"):
            q_lines = []
            while i < n and lines[i].strip().startswith(">"):
                q_l = lines[i].strip()[1:].strip()
                if q_l:
                    q_lines.append(format_inline(q_l))
                i += 1
            q_html = "<br/>".join(q_lines)
            parts.append(
                f'<blockquote class="border-l-4 border-sky-400 pl-4 py-2.5 my-3 bg-sky-950/20 rounded-r-lg text-slate-300 italic text-sm lg:text-base">{q_html}</blockquote>'
            )
            continue

        # Markdown Table
        if line.startswith("|") and "|" in line[1:]:
            table_lines = []
            while i < n and lines[i].strip().startswith("|") and "|" in lines[i].strip()[1:]:
                table_lines.append(lines[i].strip())
                i += 1
            t_html = [
                '<div class="overflow-x-auto my-4 rounded-xl border border-slate-700"><table class="w-full text-left text-xs sm:text-sm border-collapse">'
            ]
            in_tbody = False
            for tl in table_lines:
                cells = [c.strip() for c in tl.strip("|").split("|")]
                if cells and all(re.match(r"^[:\-\s]+$", c) or c == "" for c in cells) and any("-" in c for c in cells):
                    in_tbody = True
                    continue
                if not in_tbody:
                    t_html.append('<thead class="bg-slate-800/80 text-sky-300 font-semibold border-b border-slate-700"><tr>')
                    for c in cells:
                        t_html.append(f'<th class="px-3 py-2 border-r border-slate-700/50 last:border-0">{format_inline(c)}</th>')
                    t_html.append("</tr></thead><tbody>")
                else:
                    t_html.append('<tr class="border-b border-slate-800/60 hover:bg-slate-800/40 transition">')
                    for c in cells:
                        t_html.append(f'<td class="px-3 py-2 text-slate-300 border-r border-slate-800/50 last:border-0">{format_inline(c)}</td>')
                    t_html.append("</tr>")
            t_html.append("</tbody></table></div>")
            parts.append("\n".join(t_html))
            continue

        # Lists
        is_ul = line.startswith(("* ", "- "))
        is_ol = bool(re.match(r"^\d+\.\s+", line))
        if is_ul or is_ol:
            tag = "ol" if is_ol else "ul"
            cls = (
                "list-decimal ml-5 space-y-1.5 my-3 text-sm lg:text-base text-slate-300"
                if is_ol
                else "list-disc ml-5 space-y-1.5 my-3 text-sm lg:text-base text-slate-300"
            )
            items = []
            while i < n:
                cur = lines[i].strip()
                if not cur:
                    i += 1
                    continue
                if is_ul and cur.startswith(("* ", "- ")):
                    item_txt = re.sub(r"^(\*|-)\s+", "", cur)
                elif is_ol and re.match(r"^\d+\.\s+", cur):
                    item_txt = re.sub(r"^\d+\.\s+", "", cur)
                elif (lines[i].startswith("  ") or lines[i].startswith("\t")) and items:
                    items[-1] += " " + format_inline(cur)
                    i += 1
                    continue
                else:
                    break
                items.append(format_inline(item_txt))
                i += 1
            li_html = "".join(f'<li class="pl-1 leading-relaxed text-slate-300">{it}</li>' for it in items)
            parts.append(f'<{tag} class="{cls}">{li_html}</{tag}>')
            continue

        # Paragraph (collect consecutive text lines until block boundary)
        p_lines = []
        while i < n:
            cur = lines[i].strip()
            if not cur:
                i += 1
                break
            if (
                cur.startswith(("# ", "## ", "### ", "#### ", "> ", "* ", "- ", "```"))
                or re.match(r"^[-*_]{3,}$", cur)
                or re.match(r"^\d+\.\s+", cur)
                or (cur.startswith("|") and "|" in cur[1:])
                or re.match(r"^!\[(.*?)\]\(([^)]+)\)$", cur)
            ):
                break
            # Replace inline image occurrences inside paragraphs gracefully
            cur = re.sub(
                r"!\[(.*?)\]\(([^)]+)\)",
                lambda m: ""
                if "image-xxx" in m.group(2)
                else f'<img src="{html.escape(m.group(2).strip())}" alt="{html.escape(m.group(1))}" class="rounded-lg my-2 max-h-80 border border-slate-700 bg-slate-900 p-1.5" />',
                cur,
            )
            if cur.strip():
                p_lines.append(format_inline(cur))
            i += 1
        if p_lines:
            parts.append(f'<p class="mb-3 leading-relaxed text-slate-300 text-sm lg:text-base">{" ".join(p_lines)}</p>')

    return "\n".join(parts)


def extract_clean_titles(n: int, first_block: dict) -> tuple[str, str]:
    """Extract clean English and Korean chapter titles from block 0."""
    en_lines = [l.strip() for l in first_block.get("en", "").splitlines() if l.strip()]
    ko_lines = [l.strip() for l in first_block.get("ko", "").splitlines() if l.strip()]

    en_raw = next((l for l in en_lines if l.startswith("#")), en_lines[0] if en_lines else f"Chapter {n}")
    en_raw = re.sub(r"^#+\s*", "", en_raw)
    en_raw = re.sub(rf"^Chapter\s+{n}\b[\s:.\-–—]*", "", en_raw, flags=re.I).strip()
    if not en_raw:
        en_raw = f"Chapter {n}"

    ko_raw = next((l for l in ko_lines if l.startswith("#")), ko_lines[0] if ko_lines else "")
    ko_raw = re.sub(r"^#+\s*", "", ko_raw)
    ko_raw = re.sub(rf"^(?:제\s*{n}\s*장|Chapter\s+{n})\b[\s:.\-–—]*", "", ko_raw, flags=re.I).strip()
    # Remove trailing duplicate parenthetical English if equal
    ko_raw = re.sub(r"\s*\([^)]+\)\s*$", "", ko_raw).strip()
    if not ko_raw or re.fullmatch(r"[A-Za-z0-9\s:.,\-–—&/]+", ko_raw):
        ko_raw = CHAPTER_KO_FALLBACK.get(n, f"제{n}장")

    return en_raw, ko_raw


def extract_heading_for_toc(md_text: str) -> tuple[int, str] | None:
    """Return (level, clean_heading_text) for the first markdown heading in a block."""
    cleaned = re.sub(r"<!--.*?-->", "", md_text or "", flags=re.S)
    for line in cleaned.splitlines():
        s = line.strip()
        m = re.match(r"^(#{1,4})\s+(.+)$", s)
        if m:
            level = len(m.group(1))
            text = re.sub(r"\*\*|\*|`|\[([^\]]+)\]\([^)]+\)", lambda x: x.group(1) or "", m.group(2)).strip()
            if text:
                return level, text
    return None


def align_figure_block(en_md: str, ko_md: str) -> tuple[str, str]:
    """Ensure heading/caption and image order matches between EN and KO (heading first)."""
    def reorder_if_img_first(md: str) -> str:
        cleaned = re.sub(r"<!--.*?-->", "", md, flags=re.S).strip()
        lines = [l for l in cleaned.splitlines() if l.strip()]
        img_lines = [l for l in lines if re.match(r"^!\[.*?\]\(([^)]+)\)$", l.strip()) and "image-xxx" not in l]
        other_lines = [l for l in lines if l not in img_lines]
        if len(img_lines) == 1 and other_lines and lines[0].strip().startswith("!["):
            # Only reorder compact figure/table blocks (not long multi-paragraph articles)
            if len(other_lines) <= 4 and any(l.strip().startswith("#") for l in other_lines):
                return "\n\n".join(other_lines + img_lines)
        return md

    en_clean = re.sub(r"<!--.*?-->", "", en_md or "", flags=re.S).strip()
    ko_clean = re.sub(r"<!--.*?-->", "", ko_md or "", flags=re.S).strip()
    en_first = en_clean.splitlines()[0].strip() if en_clean.splitlines() else ""
    ko_first = ko_clean.splitlines()[0].strip() if ko_clean.splitlines() else ""
    if en_first.startswith("![") != ko_first.startswith("!["):
        return reorder_if_img_first(en_md), reorder_if_img_first(ko_md)
    return en_md, ko_md


def build_chapter_html(subnote_dir: str, n: int) -> tuple[int, int, float]:
    jp = os.path.join(subnote_dir, f"chapter{n}_bilingual.json")
    hp = os.path.join(subnote_dir, f"chapter{n}_bilingual.html")

    with open(jp, "r", encoding="utf-8") as f:
        blocks = json.load(f)

    en_title, ko_title = extract_clean_titles(n, blocks[0] if blocks else {})
    header_title = f"{en_title} ({ko_title})"

    toc_items = []
    row_items = []
    paired_dict = {}

    for idx, b in enumerate(blocks, 1):
        bid = str(b.get("id") or f"b-{idx:03d}")
        en_md = b.get("en", "")
        ko_md = b.get("ko", "")
        paired_dict[bid] = {"en": en_md, "ko": ko_md}

        # TOC entry if heading exists
        ko_h = extract_heading_for_toc(ko_md)
        en_h = extract_heading_for_toc(en_md)
        h_info = ko_h or en_h
        if h_info:
            lvl, ko_lbl = h_info
            en_lbl = en_h[1] if en_h else ""
            if lvl == 1:
                a_cls = "block py-1.5 pl-2 font-bold text-sky-300 hover:text-amber-300 hover:bg-slate-800/60 rounded px-2 transition text-sm truncate"
            elif lvl == 2:
                a_cls = "block py-1.5 pl-4 font-medium text-slate-200 hover:text-amber-300 hover:bg-slate-800/60 rounded px-2 transition text-sm truncate"
            else:
                a_cls = "block py-1.5 pl-7 text-xs text-slate-400 hover:text-amber-300 hover:bg-slate-800/60 rounded px-2 transition truncate"
            sub_span = (
                f'<span class="block text-[11px] font-normal text-slate-500 truncate">{html.escape(en_lbl)}</span>'
                if en_lbl and en_lbl != ko_lbl
                else ""
            )
            toc_items.append(
                f"""        <a href="#{html.escape(bid)}" onclick="scrollToBlock('{html.escape(bid)}'); return false;" class="{a_cls}">
            {html.escape(ko_lbl)}
            {sub_span}
        </a>"""
            )

        aligned_en, aligned_ko = align_figure_block(en_md, ko_md)
        en_html = md_to_html(aligned_en)
        ko_html = md_to_html(aligned_ko)

        row_items.append(
            f"""        <!-- Block {idx} -->
        <div id="{html.escape(bid)}" class="bilingual-row group border-b border-slate-800/80 hover:bg-slate-800/30 transition-colors duration-200" data-id="{html.escape(bid)}">
            <div class="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                <!-- Row Action Bar -->
                <div class="row-badge absolute right-5 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
                    <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/60 shadow">#{idx}</span>
                    <button onclick="copyBlockText('{html.escape(bid)}', 'en')" title="영문 복사" class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">EN📋</button>
                    <button onclick="copyBlockText('{html.escape(bid)}', 'ko')" title="한글 복사" class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">KO📋</button>
                </div>

                <!-- Left: English Original -->
                <div class="en-pane rounded-xl p-4 bg-slate-900/60 border border-slate-800 group-hover:border-sky-900/60 transition">
                    <div class="flex items-center justify-between mb-2 pb-1 border-b border-slate-800/60">
                        <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span> English Original
                        </span>
                        <span class="text-[10px] font-mono text-slate-500">Block {idx}</span>
                    </div>
                    <div class="content-body text-[15px] font-sans selection:bg-sky-500 selection:text-white">
                        {en_html}
                    </div>
                </div>

                <!-- Right: Korean Translation -->
                <div class="ko-pane rounded-xl p-4 bg-slate-900/80 border border-slate-800/80 group-hover:border-amber-900/60 transition">
                    <div class="flex items-center justify-between mb-2 pb-1 border-b border-slate-800/60">
                        <span class="text-[11px] font-semibold text-amber-400/90 uppercase tracking-wider flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> 한국어 정밀 번역 (100% 무삭제)
                        </span>
                        <span class="text-[10px] font-mono text-slate-500">Block {idx}</span>
                    </div>
                    <div class="content-body text-[15px] font-sans selection:bg-amber-500 selection:text-white">
                        {ko_html}
                    </div>
                </div>
            </div>
        </div>"""
        )

    prev_link = (
        f'<a href="chapter{n-1}_bilingual.html" class="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition whitespace-nowrap" title="이전 장 (Chapter {n-1})">◀ Ch{n-1}</a>'
        if n > 1
        else ""
    )
    next_link = (
        f'<a href="chapter{n+1}_bilingual.html" class="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition whitespace-nowrap" title="다음 장 (Chapter {n+1})">Ch{n+1} ▶</a>'
        if n < 16
        else ""
    )

    paired_json = json.dumps(paired_dict, ensure_ascii=False).replace("</", "<\\/")
    toc_html = "\n".join(toc_items)
    rows_html = "\n".join(row_items)

    page_html = f"""<!doctype html>
<html lang="ko" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Chapter {n}: {html.escape(en_title)} — 1:1 대조형 영·한 완전번역 리더</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {{
            darkMode: 'class',
            theme: {{
                extend: {{
                    colors: {{
                        slate: {{
                            850: '#111b2d',
                            950: '#070c18',
                        }}
                    }}
                }}
            }}
        }}
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        body {{
            font-family: 'IBM Plex Sans KR', sans-serif;
        }}
        code, pre, .font-mono {{
            font-family: 'JetBrains Mono', monospace;
        }}
        .mode-en-only .ko-pane {{ display: none !important; }}
        .mode-en-only .en-pane {{ grid-column: 1 / -1; }}
        .mode-ko-only .en-pane {{ display: none !important; }}
        .mode-ko-only .ko-pane {{ grid-column: 1 / -1; }}

        .bilingual-row.active-highlight {{
            background-color: rgba(14, 165, 233, 0.08) !important;
        }}
        .bilingual-row.active-highlight .en-pane {{
            border-color: #0284c7 !important;
            box-shadow: 0 0 15px rgba(2, 132, 199, 0.25);
        }}
        .bilingual-row.active-highlight .ko-pane {{
            border-color: #f59e0b !important;
            box-shadow: 0 0 15px rgba(245, 158, 11, 0.25);
        }}

        ::-webkit-scrollbar {{ width: 8px; height: 8px; }}
        ::-webkit-scrollbar-track {{ background: #0f172a; }}
        ::-webkit-scrollbar-thumb {{ background: #334155; border-radius: 4px; }}
        ::-webkit-scrollbar-thumb:hover {{ background: #475569; }}

/* LIGHT_MODE_OVERRIDE_START */
html:not(.dark) body {{
    background-color: #f8fafc !important;
    color: #0f172a !important;
}}
html:not(.dark) header {{
    background-color: rgba(255, 255, 255, 0.96) !important;
    border-color: #e2e8f0 !important;
}}
html:not(.dark) aside#sidebar {{
    background-color: #ffffff !important;
    border-color: #e2e8f0 !important;
}}
html:not(.dark) [class*="bg-slate-950"] {{
    background-color: #f8fafc !important;
}}
html:not(.dark) [class*="bg-slate-900"],
html:not(.dark) [class*="bg-slate-850"] {{
    background-color: #ffffff !important;
}}
html:not(.dark) [class*="bg-slate-800"] {{
    background-color: #f1f5f9 !important;
}}
html:not(.dark) .from-slate-900,
html:not(.dark) .via-slate-900,
html:not(.dark) .to-slate-950 {{
    --tw-gradient-from: #f1f5f9 !important;
    --tw-gradient-via: #f8fafc !important;
    --tw-gradient-to: #ffffff !important;
}}
html:not(.dark) [class*="border-slate-800"] {{
    border-color: #e2e8f0 !important;
}}
html:not(.dark) [class*="border-slate-700"] {{
    border-color: #cbd5e1 !important;
}}
html:not(.dark) .en-pane,
html:not(.dark) .ko-pane {{
    background-color: #ffffff !important;
    box-shadow: 0 2px 10px -3px rgba(15, 23, 42, 0.06);
}}
html:not(.dark) blockquote {{
    background-color: #f0f9ff !important;
    color: #0c4a6e !important;
}}
html:not(.dark) table th {{
    background-color: #f1f5f9 !important;
    color: #0369a1 !important;
}}
html:not(.dark) table td {{
    color: #1e293b !important;
}}
html:not(.dark) .text-white:not(.bg-sky-600):not(.bg-amber-600):not(.bg-blue-600):not(.bg-indigo-600):not(.bg-emerald-600):not([class*="bg-gradient-"]) {{
    color: #0f172a !important;
}}
html:not(.dark) .bg-sky-600,
html:not(.dark) .bg-sky-600 *,
html:not(.dark) .bg-amber-600,
html:not(.dark) .bg-amber-600 *,
html:not(.dark) .bg-blue-600,
html:not(.dark) .bg-blue-600 *,
html:not(.dark) .bg-indigo-600,
html:not(.dark) .bg-indigo-600 *,
html:not(.dark) .bg-emerald-600,
html:not(.dark) .bg-emerald-600 * {{
    color: #ffffff !important;
}}
html:not(.dark) .text-slate-100,
html:not(.dark) .text-slate-200 {{
    color: #1e293b !important;
}}
html:not(.dark) .text-slate-300 {{
    color: #334155 !important;
}}
html:not(.dark) .text-slate-400,
html:not(.dark) .text-slate-500 {{
    color: #475569 !important;
}}
html:not(.dark) .text-sky-300,
html:not(.dark) .text-sky-400 {{
    color: #0369a1 !important;
}}
html:not(.dark) .text-amber-200,
html:not(.dark) .text-amber-300,
html:not(.dark) .text-amber-400 {{
    color: #b45309 !important;
}}
html:not(.dark) .text-teal-300,
html:not(.dark) .text-emerald-300,
html:not(.dark) .text-emerald-400 {{
    color: #047857 !important;
}}
html:not(.dark) input,
html:not(.dark) select,
html:not(.dark) textarea {{
    background-color: #ffffff !important;
    color: #0f172a !important;
    border-color: #cbd5e1 !important;
}}
html:not(.dark) ::-webkit-scrollbar-track {{
    background: #f1f5f9 !important;
}}
html:not(.dark) ::-webkit-scrollbar-thumb {{
    background: #cbd5e1 !important;
}}
/* LIGHT_MODE_OVERRIDE_END */
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">

    <!-- Unified Top Navigation Header -->
    <header class="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 shadow-md">
        <div class="max-w-[1600px] mx-auto px-3 sm:px-5 h-16 flex items-center justify-between gap-2">
            <!-- Left: Portal Home, Sidebar Toggle, Badge & Chapter Title -->
            <div class="flex items-center gap-2 min-w-0">
                <a href="index.html" title="포털 메인으로 돌아가기" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition shrink-0 whitespace-nowrap">
                    🏠 <span class="hidden sm:inline">포털 메인</span>
                </a>
                <button onclick="toggleSidebar()" title="목차 열기/닫기" class="lg:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                        <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 whitespace-nowrap">CHAPTER {n}</span>
                        <span class="text-[11px] text-sky-400 font-mono hidden md:inline whitespace-nowrap">1:1 대조 리더</span>
                    </div>
                    <h1 class="text-xs sm:text-sm font-bold text-white tracking-tight truncate max-w-[180px] sm:max-w-xs lg:max-w-md">
                        {html.escape(header_title)}
                    </h1>
                </div>
            </div>

            <!-- Right: Search, View Mode, Font Size, Chapter Pager, Subnote & Theme -->
            <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div class="relative hidden xl:block">
                    <input type="text" id="searchInput" placeholder="영문/한글 검색..." oninput="handleSearch(this.value)" class="w-40 2xl:w-52 px-2.5 py-1.5 pl-7 text-xs rounded-lg bg-slate-800 text-slate-200 border border-slate-700 focus:outline-none focus:border-sky-500 transition" />
                    <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>

                <!-- View Mode Switcher -->
                <div class="hidden md:inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                    <button onclick="setViewMode('split')" id="btn-mode-split" title="나란히 보기 (기본 5:5)" class="px-2 py-1 text-xs font-medium rounded-md bg-sky-600 text-white shadow-sm transition whitespace-nowrap">5:5</button>
                    <button onclick="setViewMode('en-only')" id="btn-mode-en" title="영문 원문만 보기" class="px-2 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-white transition whitespace-nowrap">EN</button>
                    <button onclick="setViewMode('ko-only')" id="btn-mode-ko" title="한글 번역만 보기" class="px-2 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-white transition whitespace-nowrap">KO</button>
                </div>

                <!-- Font Size Controls -->
                <div class="hidden sm:inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                    <button onclick="changeFontSize(-1)" title="글자 축소" class="px-2 py-1 text-xs font-bold text-slate-300 hover:text-white transition">A-</button>
                    <button onclick="changeFontSize(1)" title="글자 확대" class="px-2 py-1 text-xs font-bold text-slate-300 hover:text-white transition">A+</button>
                </div>

                <!-- Chapter Prev/Next Pager & Subnote Link -->
                <div class="flex items-center gap-1 border-l border-slate-700 pl-1.5 sm:pl-2">
                    {prev_link}
                    {next_link}
                    <a href="chapter{n}_subnote.html" class="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition whitespace-nowrap" title="제{n}장 서브노트 열기">
                        📘 <span class="hidden sm:inline">서브노트</span>
                    </a>
                </div>

                <!-- Theme Toggle -->
                <button onclick="toggleTheme()" title="다크/일반 모드 전환" class="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition shrink-0">
                    <span id="themeIcon">☀️</span>
                </button>
            </div>
        </div>
    </header>

    <div class="flex-1 flex max-w-full">
        <!-- Left Sticky Sidebar: TOC -->
        <aside id="sidebar" class="fixed lg:sticky top-16 z-30 w-72 h-[calc(100vh-4rem)] bg-slate-900 border-r border-slate-800 overflow-y-auto p-4 transition-transform -translate-x-full lg:translate-x-0 shrink-0">
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-400">목차 (TABLE OF CONTENTS)</span>
                <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-400">{len(blocks)} Blocks</span>
            </div>
            <nav class="space-y-1">
{toc_html}
            </nav>
        </aside>

        <!-- Main Bilingual Content Canvas -->
        <main id="readerCanvas" class="flex-1 min-w-0 transition-all">
            <!-- Hero Chapter Title Banner -->
            <div class="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-8 text-center">
                <span class="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-3">
                    Safety Culture (Elsevier, 2019) — Bilingual Academic Parallel Reader
                </span>
                <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                    Chapter {n}: {html.escape(en_title)}
                </h2>
                <p class="text-lg text-amber-300 font-medium mb-4">
                    제{n}장: {html.escape(ko_title)}
                </p>
                <p class="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    본 리더는 Elsevier 원문의 {len(blocks)}개 블록 전체를 100% 무삭제 원칙으로 영어 원문과 한국어 정밀 번역문을 1:1 완벽 대조하여 학술 연구 및 학습 효과를 극대화하도록 제작되었습니다.
                </p>
            </div>

            <!-- Bilingual Rows (Boxed max-w-7xl 1:1 Cards) -->
            <div id="blocksContainer" class="divide-y divide-slate-800/40">
{rows_html}
            </div>
        </main>
    </div>

    <!-- Floating Quick Action Notification -->
    <div id="toast" class="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-medium shadow-2xl transition-all opacity-0 pointer-events-none transform translate-y-3">
        복사되었습니다!
    </div>

    <!-- Unified Client-side Scripts -->
    <script>
        const pairedBlocks = {paired_json};
        let currentFontSize = 15;

        function setViewMode(mode) {{
            const canvas = document.getElementById('readerCanvas');
            canvas.classList.remove('mode-en-only', 'mode-ko-only');

            document.getElementById('btn-mode-split').className = 'px-2 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-white transition whitespace-nowrap';
            document.getElementById('btn-mode-en').className = 'px-2 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-white transition whitespace-nowrap';
            document.getElementById('btn-mode-ko').className = 'px-2 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-white transition whitespace-nowrap';

            if (mode === 'en-only') {{
                canvas.classList.add('mode-en-only');
                document.getElementById('btn-mode-en').className = 'px-2 py-1 text-xs font-medium rounded-md bg-sky-600 text-white shadow-sm transition whitespace-nowrap';
            }} else if (mode === 'ko-only') {{
                canvas.classList.add('mode-ko-only');
                document.getElementById('btn-mode-ko').className = 'px-2 py-1 text-xs font-medium rounded-md bg-amber-600 text-white shadow-sm transition whitespace-nowrap';
            }} else {{
                document.getElementById('btn-mode-split').className = 'px-2 py-1 text-xs font-medium rounded-md bg-sky-600 text-white shadow-sm transition whitespace-nowrap';
            }}
        }}

        function changeFontSize(delta) {{
            currentFontSize = Math.min(24, Math.max(12, currentFontSize + delta));
            document.querySelectorAll('.content-body').forEach(el => {{
                el.style.fontSize = currentFontSize + 'px';
            }});
            showToast(`글꼴 크기: ${{currentFontSize}}px`);
        }}

        function copyBlockText(bid, lang) {{
            const block = pairedBlocks[bid];
            if (!block) return;
            const textToCopy = lang === 'en' ? block.en : block.ko;
            navigator.clipboard.writeText(textToCopy).then(() => {{
                showToast(`${{lang.toUpperCase()}} 블록 복사 완료!`);
            }});
        }}

        function showToast(msg) {{
            const toast = document.getElementById('toast');
            toast.textContent = msg;
            toast.classList.remove('opacity-0', 'translate-y-3', 'pointer-events-none');
            setTimeout(() => {{
                toast.classList.add('opacity-0', 'translate-y-3', 'pointer-events-none');
            }}, 2000);
        }}

        function scrollToBlock(bid) {{
            const el = document.getElementById(bid);
            if (!el) return;
            el.scrollIntoView({{ behavior: 'smooth', block: 'start' }});
            document.querySelectorAll('.bilingual-row').forEach(r => r.classList.remove('active-highlight'));
            el.classList.add('active-highlight');
            if (window.innerWidth < 1024) {{
                toggleSidebar();
            }}
        }}

        function toggleSidebar() {{
            const sb = document.getElementById('sidebar');
            sb.classList.toggle('-translate-x-full');
        }}

        function applyStoredTheme() {{
            const saved = localStorage.getItem('safety_culture_theme');
            const htmlEl = document.documentElement;
            const icon = document.getElementById('themeIcon');
            if (saved === 'light') {{
                htmlEl.classList.remove('dark');
                if (icon) icon.textContent = '🌙';
            }} else {{
                htmlEl.classList.add('dark');
                if (icon) icon.textContent = '☀️';
            }}
        }}

        function toggleTheme() {{
            const htmlEl = document.documentElement;
            const icon = document.getElementById('themeIcon');
            if (htmlEl.classList.contains('dark')) {{
                htmlEl.classList.remove('dark');
                localStorage.setItem('safety_culture_theme', 'light');
                if (icon) icon.textContent = '🌙';
            }} else {{
                htmlEl.classList.add('dark');
                localStorage.setItem('safety_culture_theme', 'dark');
                if (icon) icon.textContent = '☀️';
            }}
        }}
        applyStoredTheme();

        function handleSearch(query) {{
            const q = query.trim().toLowerCase();
            const rows = document.querySelectorAll('.bilingual-row');
            if (!q) {{
                rows.forEach(r => r.style.display = '');
                return;
            }}
            rows.forEach(r => {{
                const text = r.textContent.toLowerCase();
                r.style.display = text.includes(q) ? '' : 'none';
            }});
        }}

        document.addEventListener('click', function(e) {{
            const row = e.target.closest('.bilingual-row');
            if (row) {{
                document.querySelectorAll('.bilingual-row').forEach(r => r.classList.remove('active-highlight'));
                row.classList.add('active-highlight');
            }}
        }});
    </script>
</body>
</html>
"""

    with open(hp, "w", encoding="utf-8") as f:
        f.write(page_html)

    # Measure plain text ratio vs JSON
    m = re.search(r"<main[^>]*>(.*?)</main>", page_html, flags=re.S)
    plain_len = len(re.sub(r"<[^>]+>", "", m.group(1))) if m else 0
    json_len = sum(len(b.get("en", "")) + len(b.get("ko", "")) for b in blocks)
    ratio = (plain_len / json_len * 100) if json_len else 0.0
    return len(blocks), len(toc_items), ratio


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    subnote_dir = os.path.abspath(os.path.join(script_dir, ".."))
    for n in range(1, 17):
        blocks_cnt, toc_cnt, ratio = build_chapter_html(subnote_dir, n)
        print(f"Built Ch{n:2d}: blocks={blocks_cnt:3d} | toc_items={toc_cnt:3d} | text_ratio={ratio:5.1f}%")


if __name__ == "__main__":
    main()
