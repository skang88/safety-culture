# -*- coding: utf-8 -*-
"""
Chapter 5 Bilingual Reader & Markdown Builder
Combines all translation parts, outputs chapter5-번역.md, chapter5_bilingual.json, and chapter5_bilingual.html
"""

import os
import json
import re

import ch5_translations_p1 as p1
import ch5_translations_p2 as p2
import ch5_translations_p3 as p3

def get_all_translations():
    combined = {}
    combined.update(p1.translations)
    combined.update(p2.translations)
    combined.update(p3.translations)
    return combined

def md_to_html_snippet(text):
    lines = text.strip().split("\n")
    first = lines[0].strip()
    
    # Heading 1
    if first.startswith("# "):
        title = first[2:].strip()
        return f'<h1 class="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-4 border-b border-sky-500/30 pb-3">{title}</h1>'
    
    # Heading 2
    if first.startswith("## "):
        title = first[3:].strip()
        return f'<h2 class="text-xl lg:text-2xl font-bold text-sky-400 tracking-tight mt-6 mb-3 flex items-center gap-2"><span class="w-2 h-2 rounded bg-sky-400 inline-block"></span>{title}</h2>'
    
    # Heading 3
    if first.startswith("### "):
        title = first[4:].strip()
        return f'<h3 class="text-lg lg:text-xl font-semibold text-amber-300 tracking-tight mt-5 mb-2">{title}</h3>'
    
    # Image
    img_match = re.search(r"!\[(.*?)\]\((.*?)\)", text)
    if img_match:
        alt, src = img_match.group(1), img_match.group(2)
        return f'<div class="my-4 text-center"><img src="{src}" alt="{alt}" class="rounded-xl shadow-lg mx-auto max-h-96 border border-slate-700 bg-slate-900 p-2 object-contain hover:scale-105 transition-transform" /></div>'
    
    # Table (Markdown table)
    if any(line.strip().startswith("|") for line in lines):
        table_html = ['<div class="overflow-x-auto my-4 rounded-xl border border-slate-700"><table class="w-full text-left text-sm border-collapse">']
        in_tbody = False
        for line in lines:
            line_str = line.strip()
            if not line_str.startswith("|"):
                continue
            cells = [c.strip() for c in line_str.split("|")[1:-1]]
            if all(set(c).issubset({'-', ':', ' '}) for c in cells):
                table_html.append('</thead><tbody>')
                in_tbody = True
                continue
            if not in_tbody:
                table_html.append('<thead class="bg-slate-800 text-sky-300 font-semibold"><tr>')
                for c in cells:
                    table_html.append(f'<th class="px-4 py-2 border-b border-slate-700">{c}</th>')
                table_html.append('</tr>')
            else:
                table_html.append('<tr class="border-b border-slate-800/80 hover:bg-slate-800/50 transition">')
                for c in cells:
                    table_html.append(f'<td class="px-4 py-2.5 text-slate-300 leading-relaxed">{c}</td>')
                table_html.append('</tr>')
        if in_tbody:
            table_html.append('</tbody>')
        table_html.append('</table></div>')
        return "".join(table_html)
    
    # List block
    if any(line.strip().startswith(("* ", "- ")) or re.match(r"^\d+\.\s", line.strip()) for line in lines):
        html_out = []
        in_list = False
        list_tag = "ul"
        
        for line in lines:
            line_str = line.strip()
            num_match = re.match(r"^(\d+)\.\s+(.*)", line_str)
            bullet_match = re.match(r"^[\*\-]\s+(.*)", line_str)
            
            if num_match:
                if not in_list:
                    html_out.append('<ol class="list-decimal list-outside ml-6 space-y-2 my-3 text-slate-300">')
                    in_list = True
                    list_tag = "ol"
                elif list_tag != "ol":
                    html_out.append(f'</{list_tag}><ol class="list-decimal list-outside ml-6 space-y-2 my-3 text-slate-300">')
                    list_tag = "ol"
                html_out.append(f'<li class="leading-relaxed">{num_match.group(2)}</li>')
            elif bullet_match:
                if not in_list:
                    html_out.append('<ul class="list-disc list-outside ml-6 space-y-2 my-3 text-slate-300">')
                    in_list = True
                    list_tag = "ul"
                elif list_tag != "ul":
                    html_out.append(f'</{list_tag}><ul class="list-disc list-outside ml-6 space-y-2 my-3 text-slate-300">')
                    list_tag = "ul"
                html_out.append(f'<li class="leading-relaxed">{bullet_match.group(1)}</li>')
            else:
                if in_list:
                    html_out.append(f'</{list_tag}>')
                    in_list = False
                if line_str:
                    html_out.append(f'<p class="mb-2 leading-relaxed text-slate-300">{line_str}</p>')
        if in_list:
            html_out.append(f'</{list_tag}>')
        return "".join(html_out)
    
    # Standard Paragraphs
    paragraphs = text.strip().split("\n\n")
    p_html = []
    for p in paragraphs:
        cleaned = p.replace("\n", " ").strip()
        cleaned = re.sub(r"\*\*(.*?)\*\*", r'<strong class="text-white font-semibold">\1</strong>', cleaned)
        cleaned = re.sub(r"\*(.*?)\*", r'<em class="text-sky-200">\1</em>', cleaned)
        if cleaned.startswith("&gt; ") or cleaned.startswith("> "):
            quote_text = cleaned[2:].strip()
            p_html.append(f'<blockquote class="border-l-4 border-amber-400 pl-4 py-1 my-3 italic text-amber-200/90 bg-amber-950/20 rounded-r">{quote_text}</blockquote>')
        else:
            p_html.append(f'<p class="mb-3 leading-relaxed text-slate-300">{cleaned}</p>')
    return "".join(p_html)


def build_bilingual_system():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    subnote_dir = os.path.dirname(base_dir)
    
    raw_blocks_path = os.path.join(subnote_dir, "chapter5_raw_blocks.json")
    with open(raw_blocks_path, "r", encoding="utf-8") as f:
        en_blocks = json.load(f)
    
    ko_dict = get_all_translations()
    
    total_blocks = len(en_blocks)
    print(f"Total EN blocks: {total_blocks}, Total KO translations: {len(ko_dict)}")
    
    paired_data = []
    ko_markdown_lines = []
    toc_items = []
    
    for idx, b_item in enumerate(en_blocks, 1):
        bid = b_item["id"]
        en_text = b_item["content"]
        ko_text = ko_dict.get(bid, "[번역 준비중...]")
        
        # Check TOC
        heading_match = re.match(r"^(#{1,3})\s+(.*)", en_text.splitlines()[0])
        if heading_match:
            level = len(heading_match.group(1))
            en_title = heading_match.group(2).strip()
            ko_heading_match = re.match(r"^(#{1,3})\s+(.*)", ko_text.splitlines()[0])
            ko_title = ko_heading_match.group(2).strip() if ko_heading_match else en_title
            toc_items.append({
                "id": bid,
                "level": level,
                "en": en_title,
                "ko": ko_title
            })
        
        paired_data.append({
            "id": bid,
            "order": idx,
            "en": en_text,
            "ko": ko_text
        })
        
        ko_markdown_lines.append(f"<!-- BLOCK: {bid} -->\n" + ko_text)
    
    # 1. Output chapter5-번역.md
    md_path = os.path.join(subnote_dir, "chapter5-번역.md")
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("\n\n".join(ko_markdown_lines) + "\n")
    print(f"[OK] Successfully built markdown: {md_path}")
    
    # 2. Output chapter5_bilingual.json
    json_path = os.path.join(subnote_dir, "chapter5_bilingual.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(paired_data, f, ensure_ascii=False, indent=2)
    print(f"[OK] Successfully built JSON: {json_path}")
    
    # 3. Generate Interactive HTML
    rows_html = []
    for item in paired_data:
        bid = item["id"]
        en_raw = item["en"]
        ko_raw = item["ko"]
        
        en_html = md_to_html_snippet(en_raw)
        ko_html = md_to_html_snippet(ko_raw)
        
        row_str = f"""
        <div id="{bid}" class="bilingual-row group border-b border-slate-800/80 hover:border-sky-500/40 hover:bg-slate-900/40 transition-all duration-200">
            <div class="max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 px-4 lg:px-8 py-5">
                <!-- English Column -->
                <div class="en-col relative pr-0 lg:pr-4 border-b lg:border-b-0 border-slate-800/60 pb-4 lg:pb-0">
                    <div class="flex items-center justify-between mb-2">
                        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-800 text-slate-400 group-hover:text-sky-300 group-hover:bg-sky-950/40 transition">
                            <span class="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-sky-400"></span>
                            {bid} (EN)
                        </span>
                        <button onclick="copyBlockText('{bid}', 'en')" class="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition text-xs flex items-center gap-1" title="원문 복사">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                        </button>
                    </div>
                    <div class="content-body text-slate-300 leading-relaxed font-sans select-text">
                        {en_html}
                    </div>
                </div>

                <!-- Korean Column -->
                <div class="ko-col relative pl-0 lg:pl-4">
                    <div class="flex items-center justify-between mb-2">
                        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-950/30 text-amber-400 border border-amber-900/30">
                            <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            {bid} (한글 완역)
                        </span>
                        <button onclick="copyBlockText('{bid}', 'ko')" class="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 text-slate-400 hover:text-amber-300 rounded transition text-xs flex items-center gap-1" title="번역문 복사">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                        </button>
                    </div>
                    <div class="content-body text-slate-200 leading-relaxed font-sans select-text">
                        {ko_html}
                    </div>
                </div>
            </div>
        </div>
        """
        rows_html.append(row_str)

    # Sidebar TOC HTML
    toc_links = []
    for t in toc_items:
        indent = "pl-2" if t["level"] == 1 else ("pl-4" if t["level"] == 2 else "pl-7")
        size = "text-xs font-bold text-sky-300" if t["level"] == 1 else ("text-xs font-semibold text-slate-300" if t["level"] == 2 else "text-[11px] text-slate-400")
        toc_links.append(f"""
        <a href="#{t['id']}" onclick="scrollToBlock('{t['id']}')" class="block py-1.5 {indent} {size} hover:text-sky-400 hover:bg-slate-800/60 rounded transition truncate" title="{t['ko']}">
            {t['ko']}
        </a>
        """)

    full_html = f"""<!DOCTYPE html>
<html lang="ko" class="dark scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chapter 5 1:1 한영 대조 리더 | SafePulse 360</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {{
            darkMode: 'class',
            theme: {{
                extend: {{
                    colors: {{
                        slate: {{
                            925: '#0B1120',
                            950: '#060B16',
                        }}
                    }}
                }}
            }}
        }}
    </script>
    <style>
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        body {{
            font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
            background-color: #060B16;
            color: #E2E8F0;
        }}
        .custom-scrollbar::-webkit-scrollbar {{
            width: 5px;
            height: 5px;
        }}
        .custom-scrollbar::-webkit-scrollbar-track {{
            background: #0B1120;
        }}
        .custom-scrollbar::-webkit-scrollbar-thumb {{
            background: #1E293B;
            border-radius: 4px;
        }}
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {{
            background: #334155;
        }}
        .active-highlight {{
            background-color: rgba(14, 165, 233, 0.08) !important;
            border-left: 3px solid #38BDF8 !important;
        }}
        .mode-en-only .ko-col {{ display: none; }}
        .mode-ko-only .en-col {{ display: none; }}
        .mode-en-only .bilingual-row .grid,
        .mode-ko-only .bilingual-row .grid {{
            grid-template-columns: minmax(0, 1fr) !important;
        }}
    </style>
</head>
<body class="bg-slate-950 text-slate-200 antialiased min-h-screen flex flex-col">

    <!-- Top Sticky Header -->
    <header class="sticky top-0 z-40 bg-slate-925/90 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div class="max-w-[1700px] mx-auto px-4 lg:px-8 h-14 flex items-center justify-between gap-4">
            <!-- Left: Title & Chapter Navigation -->
            <div class="flex items-center gap-3">
                <button onclick="toggleSidebar()" class="lg:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white" title="목차 열기">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                </button>
                <div class="flex items-center gap-2">
                    <a href="index.html" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition" title="홈으로">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    </a>
                    <span class="px-2 py-0.5 rounded text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">Ch 5</span>
                    <h1 class="text-sm lg:text-base font-bold text-white truncate max-w-[280px] sm:max-w-md lg:max-w-none">
                        Overview of Basic Safety Management Systems
                    </h1>
                </div>
            </div>

            <!-- Chapter Navigation Selector -->
            <div class="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
                <a href="chapter4_bilingual.html" class="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 hover:text-white transition flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    4장
                </a>
                <span class="px-2 py-1 rounded bg-sky-600/30 text-sky-300 font-semibold border border-sky-500/40">5장</span>
                <a href="chapter6_bilingual.html" class="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 hover:text-white transition flex items-center gap-1">
                    6장
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </a>
            </div>

            <!-- Right Controls: View Mode & Font Size -->
            <div class="flex items-center gap-2 sm:gap-3">
                <!-- View Mode Segmented Controls -->
                <div class="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
                    <button id="btn-mode-split" onclick="setViewMode('split')" class="px-2.5 py-1 text-xs font-medium rounded-md bg-sky-600 text-white shadow-sm transition">대조</button>
                    <button id="btn-mode-en" onclick="setViewMode('en-only')" class="px-2.5 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-white transition">EN</button>
                    <button id="btn-mode-ko" onclick="setViewMode('ko-only')" class="px-2.5 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-white transition">KO</button>
                </div>

                <!-- Font Zoom -->
                <div class="flex items-center bg-slate-800/80 rounded-lg border border-slate-700/60 p-0.5">
                    <button onclick="changeFontSize(-1)" class="px-2 py-1 text-xs font-medium text-slate-400 hover:text-white transition" title="글꼴 축소">A-</button>
                    <button onclick="changeFontSize(1)" class="px-2 py-1 text-xs font-medium text-slate-400 hover:text-white transition" title="글꼴 확대">A+</button>
                </div>
            </div>
        </div>
    </header>

    <!-- Sub-Navbar: Progress & Search & Filter -->
    <div class="bg-slate-900/60 border-b border-slate-800/60 px-4 lg:px-8 py-2 text-xs text-slate-400">
        <div class="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3">
                <span class="text-slate-400">학술 연구자료 1:1 대조</span>
                <span class="text-slate-600">&bull;</span>
                <span class="text-sky-400 font-mono font-medium">Elsevier (2019) Roughton et al.</span>
            </div>
            <div class="flex items-center gap-2 text-[11px] text-slate-500">
                <span>총 64 블록 완비</span>
                <span>&bull;</span>
                <span>블록 호버 시 복사(EN/KO) 지원</span>
            </div>
        </div>
    </div>

    <!-- Main Bilingual Reader Canvas -->
    <main id="readerCanvas" class="flex-1 pb-24">
        {"".join(rows_html)}
    </main>

    <!-- Toast Notification -->
    <div id="toast" class="fixed bottom-6 right-6 bg-sky-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-3 opacity-0 pointer-events-none z-50 flex items-center gap-2">
        <span>복사되었습니다!</span>
    </div>

    <!-- Interactive Script -->
    <script>
        const pairedBlocks = {json.dumps({item["id"]: {"en": item["en"], "ko": item["ko"]} for item in paired_data}, ensure_ascii=False)};
        let currentFontSize = 15;

        function setViewMode(mode) {{
            const canvas = document.getElementById('readerCanvas');
            canvas.classList.remove('mode-en-only', 'mode-ko-only');
            
            document.getElementById('btn-mode-split').className = 'px-2.5 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-white transition';
            document.getElementById('btn-mode-en').className = 'px-2.5 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-white transition';
            document.getElementById('btn-mode-ko').className = 'px-2.5 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-white transition';
            
            if (mode === 'en-only') {{
                canvas.classList.add('mode-en-only');
                document.getElementById('btn-mode-en').className = 'px-2.5 py-1 text-xs font-medium rounded-md bg-sky-600 text-white shadow-sm transition';
            }} else if (mode === 'ko-only') {{
                canvas.classList.add('mode-ko-only');
                document.getElementById('btn-mode-ko').className = 'px-2.5 py-1 text-xs font-medium rounded-md bg-amber-600 text-white shadow-sm transition';
            }} else {{
                document.getElementById('btn-mode-split').className = 'px-2.5 py-1 text-xs font-medium rounded-md bg-sky-600 text-white shadow-sm transition';
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

    html_path = os.path.join(subnote_dir, "chapter5_bilingual.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"[OK] Successfully built interactive bilingual HTML: {html_path}")

if __name__ == '__main__':
    build_bilingual_system()
