# -*- coding: utf-8 -*-
"""
Chapter 3 Bilingual Reader & Markdown Builder
Combines all translation parts, outputs chapter3-번역.md, chapter3_bilingual.json, and chapter3_bilingual.html
"""

import os
import json
import re

from ch3_translations_p1 import PART1_TRANSLATIONS
from ch3_translations_p2 import PART2_TRANSLATIONS
from ch3_translations_p3 import PART3_TRANSLATIONS
from ch3_translations_p4 import PART4_TRANSLATIONS

def get_all_translations():
    combined = {}
    combined.update(PART1_TRANSLATIONS)
    combined.update(PART2_TRANSLATIONS)
    combined.update(PART3_TRANSLATIONS)
    combined.update(PART4_TRANSLATIONS)
    return combined

def md_to_html_snippet(text):
    lines = text.strip().split("\n")
    first = lines[0].strip()
    
    # Heading 1
    if first.startswith("# "):
        title = first[2:].strip()
        return f'<h1 class="font-extrabold text-2xl lg:text-3xl text-sky-400 mb-3 tracking-tight">{title}</h1>'
    # Heading 2
    if first.startswith("## "):
        title = first[3:].strip()
        return f'<h2 class="font-bold text-xl lg:text-2xl text-amber-300 mt-6 mb-3 pb-2 border-b border-slate-700">{title}</h2>'
    # Heading 3
    if first.startswith("### "):
        title = first[4:].strip()
        return f'<h3 class="font-semibold text-lg lg:text-xl text-teal-300 mt-4 mb-2">{title}</h3>'
    # Image
    img_match = re.match(r"!\[(.*?)\]\((.*?)\)", first)
    if img_match:
        alt, src = img_match.groups()
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
    
    raw_blocks_path = os.path.join(subnote_dir, "chapter3_raw_blocks.json")
    with open(raw_blocks_path, "r", encoding="utf-8") as f:
        en_blocks = json.load(f)
    
    ko_dict = get_all_translations()
    
    total_blocks = len(en_blocks)
    print(f"Total EN blocks: {total_blocks}, Total KO translations: {len(ko_dict)}")
    
    paired_data = []
    ko_markdown_lines = []
    toc_items = []
    
    for idx in range(1, total_blocks + 1):
        en_text = en_blocks[idx - 1]
        ko_text = ko_dict.get(idx, "[번역 준비중...]")
        
        # Check TOC
        heading_match = re.match(r"^(#{1,3})\s+(.*)", en_text.splitlines()[0])
        if heading_match:
            level = len(heading_match.group(1))
            en_title = heading_match.group(2).strip()
            ko_heading_match = re.match(r"^(#{1,3})\s+(.*)", ko_text.splitlines()[0])
            ko_title = ko_heading_match.group(2).strip() if ko_heading_match else en_title
            toc_items.append({
                "id": f"b-{idx:03d}",
                "level": level,
                "en": en_title,
                "ko": ko_title
            })
        
        paired_data.append({
            "id": f"b-{idx:03d}",
            "block_num": idx,
            "en": en_text,
            "ko": ko_text
        })
        
        ko_markdown_lines.append(ko_text)
        ko_markdown_lines.append("")
    
    # 1. Output chapter3-번역.md
    ko_md_path = os.path.join(subnote_dir, "chapter3-번역.md")
    with open(ko_md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(ko_markdown_lines))
    print(f"[OK] Created full translation markdown: {ko_md_path}")
    
    # 2. Output chapter3_bilingual.json
    json_path = os.path.join(subnote_dir, "chapter3_bilingual.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(paired_data, f, ensure_ascii=False, indent=2)
    print(f"[OK] Created paired JSON data: {json_path}")
    
    # 3. Build HTML rows
    rows_html = []
    for item in paired_data:
        bid = item["id"]
        bnum = item["block_num"]
        en_snippet = md_to_html_snippet(item["en"])
        ko_snippet = md_to_html_snippet(item["ko"])
        
        row = f"""
        <!-- Block {bnum} -->
        <div id="{bid}" class="bilingual-row group border-b border-slate-800/80 hover:bg-slate-800/30 transition-colors duration-200" data-id="{bid}">
            <div class="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                <!-- Row Action Bar -->
                <div class="row-badge absolute -left-2 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
                    <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/60 shadow">#{bnum}</span>
                    <button onclick="copyBlockText('{bid}', 'en')" title="영문 복사" class="text-[10px] px-1 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">EN📋</button>
                    <button onclick="copyBlockText('{bid}', 'ko')" title="한글 복사" class="text-[10px] px-1 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">KO📋</button>
                </div>
                
                <!-- Left: English Original -->
                <div class="en-pane rounded-xl p-4 bg-slate-900/60 border border-slate-800 group-hover:border-sky-900/60 transition">
                    <div class="flex items-center justify-between mb-2 pb-1 border-b border-slate-800/60">
                        <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span> English Original
                        </span>
                        <span class="text-[10px] font-mono text-slate-500">Block {bnum}</span>
                    </div>
                    <div class="content-body text-[15px] font-sans selection:bg-sky-500 selection:text-white">
                        {en_snippet}
                    </div>
                </div>
                
                <!-- Right: Korean Translation -->
                <div class="ko-pane rounded-xl p-4 bg-slate-900/80 border border-slate-800/80 group-hover:border-amber-900/60 transition">
                    <div class="flex items-center justify-between mb-2 pb-1 border-b border-slate-800/60">
                        <span class="text-[11px] font-semibold text-amber-400/90 uppercase tracking-wider flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> 한국어 정밀 번역 (100% 무삭제)
                        </span>
                        <span class="text-[10px] font-mono text-slate-500">Block {bnum}</span>
                    </div>
                    <div class="content-body text-[15px] font-sans selection:bg-amber-500 selection:text-white">
                        {ko_snippet}
                    </div>
                </div>
            </div>
        </div>
        """
        rows_html.append(row)
    
    # Build TOC HTML
    toc_html = []
    for t in toc_items:
        indent = "pl-2" if t["level"] == 1 else ("pl-5" if t["level"] == 2 else "pl-8 text-xs")
        font_weight = "font-bold text-sky-300" if t["level"] == 1 else ("font-medium text-slate-200" if t["level"] == 2 else "text-slate-400")
        toc_html.append(f"""
        <a href="#{t['id']}" onclick="scrollToBlock('{t['id']}'); return false;" class="block py-1.5 {indent} {font_weight} hover:text-amber-300 hover:bg-slate-800/60 rounded px-2 transition text-sm truncate">
            {t['ko']}
            <span class="block text-[11px] font-normal text-slate-500 truncate">{t['en']}</span>
        </a>
        """)
    
    # HTML Template
    full_html = f"""<!doctype html>
<html lang="ko" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Chapter 3: Analyzing and Using Your Network — 1:1 대조형 영·한 완전번역 리더</title>
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
        /* View modes */
        .mode-en-only .ko-pane {{ display: none !important; }}
        .mode-en-only .max-w-7xl > div {{ grid-column: span 2 / span 2; }}
        .mode-ko-only .en-pane {{ display: none !important; }}
        .mode-ko-only .max-w-7xl > div {{ grid-column: span 2 / span 2; }}
        
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
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar {{
            width: 8px;
            height: 8px;
        }}
        ::-webkit-scrollbar-track {{
            background: #0f172a;
        }}
        ::-webkit-scrollbar-thumb {{
            background: #334155;
            border-radius: 4px;
        }}
        ::-webkit-scrollbar-thumb:hover {{
            background: #475569;
        }}
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">

    <!-- Top Navigation Header -->
    <header class="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 shadow-md">
        <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <!-- Left: Title & Chapter -->
            <div class="flex items-center gap-3">
                <a href="index.html" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300" title="메인 포털">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </a>
                <button onclick="toggleSidebar()" class="lg:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                <div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">CHAPTER 3</span>
                        <span class="text-xs text-amber-400 font-mono hidden sm:inline">100% 무삭제 1:1 대조 리더</span>
                    </div>
                    <h1 class="text-sm sm:text-base font-bold text-white tracking-tight truncate max-w-md">
                        Analyzing and Using Your Network (네트워크 분석 및 활용)
                    </h1>
                </div>
            </div>

            <!-- Middle/Right: Controls -->
            <div class="flex items-center gap-2 sm:gap-3">
                <!-- Search Bar -->
                <div class="relative hidden md:block">
                    <input type="text" id="searchInput" placeholder="영문/한글 실시간 검색..." oninput="handleSearch(this.value)" class="w-48 lg:w-64 px-3 py-1.5 pl-8 text-xs rounded-lg bg-slate-800 text-slate-200 border border-slate-700 focus:outline-none focus:border-sky-500 transition">
                    <svg class="w-4 h-4 text-slate-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>

                <!-- View Mode Buttons -->
                <div class="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                    <button onclick="setViewMode('split')" id="btn-mode-split" title="나란히 보기 (기본 5:5)" class="px-2.5 py-1 text-xs font-medium rounded-md bg-sky-600 text-white shadow-sm transition">5:5 나란히</button>
                    <button onclick="setViewMode('en-only')" id="btn-mode-en" title="영문 원문만 집중" class="px-2.5 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-white transition">EN만</button>
                    <button onclick="setViewMode('ko-only')" id="btn-mode-ko" title="한글 번역만 집중" class="px-2.5 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-white transition">KO만</button>
                </div>

                <!-- Font size controls -->
                <div class="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                    <button onclick="changeFontSize(-1)" title="글자 축소" class="px-2 py-1 text-xs font-bold text-slate-300 hover:text-white">A-</button>
                    <button onclick="changeFontSize(1)" title="글자 확대" class="px-2 py-1 text-xs font-bold text-slate-300 hover:text-white">A+</button>
                </div>

                <!-- Theme Toggle -->
                <button onclick="toggleTheme()" title="테마 변경" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">
                    <span id="themeIcon">☀️</span>
                </button>
            </div>
        </div>
    </header>

    <div class="flex-1 flex max-w-full">
        <!-- Left Sidebar: TOC -->
        <aside id="sidebar" class="fixed lg:sticky top-16 z-30 w-72 h-[calc(100vh-4rem)] bg-slate-900 border-r border-slate-800 overflow-y-auto p-4 transition-transform -translate-x-full lg:translate-x-0">
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-400">목차 (TABLE OF CONTENTS)</span>
                <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-400">{total_blocks} Blocks</span>
            </div>
            <nav class="space-y-1">
                {"".join(toc_html)}
            </nav>
        </aside>

        <!-- Main Bilingual Content Canvas -->
        <main id="readerCanvas" class="flex-1 min-w-0 transition-all">
            <!-- Hero Banner -->
            <div class="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-8 text-center">
                <span class="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
                    Safety Culture (Elsevier, 2019) — Bilingual Academic Parallel Reader
                </span>
                <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                    Chapter 3: Analyzing and Using Your Network
                </h2>
                <p class="text-lg text-amber-300 font-medium mb-4">
                    제3장: 네트워크 분석 및 활용
                </p>
                <p class="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    본 리더는 Elsevier 원문의 85개 블록 전체를 100% 무삭제 원칙으로 영어 원문과 한국어 정밀 번역문을 1:1 완벽 대조하여 학술 연구 및 학습 효과를 극대화하도록 제작되었습니다.
                </p>
            </div>

            <!-- Bilingual Rows -->
            <div id="blocksContainer" class="divide-y divide-slate-800/40">
                {"".join(rows_html)}
            </div>
        </main>
    </div>

    <!-- Floating Toast Notification -->
    <div id="toast" class="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-medium shadow-2xl transition-all opacity-0 pointer-events-none transform translate-y-3">
        복사되었습니다!
    </div>

    <!-- Client Scripts -->
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
            
            if (window.innerWidth < 1024) {{
                toggleSidebar();
            }}
        }}

        function toggleSidebar() {{
            const sb = document.getElementById('sidebar');
            sb.classList.toggle('-translate-x-full');
        }}

        function toggleTheme() {{
            const html = document.documentElement;
            const icon = document.getElementById('themeIcon');
            if (html.classList.contains('dark')) {{
                html.classList.remove('dark');
                icon.textContent = '🌙';
            }} else {{
                html.classList.add('dark');
                icon.textContent = '☀️';
            }}
        }}

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

    html_path = os.path.join(subnote_dir, "chapter3_bilingual.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"[OK] Successfully built interactive bilingual HTML: {html_path}")

if __name__ == '__main__':
    build_bilingual_system()
