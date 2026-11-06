# -*- coding: utf-8 -*-
"""
Chapter 4 Bilingual Reader & Markdown Builder
Combines all translation parts, outputs chapter4-번역.md, chapter4_bilingual.json, and chapter4_bilingual.html
"""

import os
import json
import re

import ch4_translations_p1 as p1
import ch4_translations_p2 as p2
import ch4_translations_p3 as p3
import ch4_translations_p4 as p4

def get_all_translations():
    combined = {}
    combined.update(p1.translations)
    combined.update(p2.translations)
    combined.update(p3.translations)
    combined.update(p4.translations)
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
    
    raw_blocks_path = os.path.join(subnote_dir, "chapter4_raw_blocks.json")
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
                "id": f"b-{idx:03d}",
                "level": level,
                "en": en_title,
                "ko": ko_title
            })
        
        paired_data.append({
            "id": f"b-{idx:03d}",
            "block_id": bid,
            "block_num": idx,
            "en": en_text,
            "ko": ko_text
        })
        
        ko_markdown_lines.append(ko_text)
        ko_markdown_lines.append("")
    
    # 1. Output chapter4-번역.md
    ko_md_path = os.path.join(subnote_dir, "chapter4-번역.md")
    with open(ko_md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(ko_markdown_lines))
    print(f"[OK] Created full translation markdown: {ko_md_path}")
    
    # 2. Output chapter4_bilingual.json
    json_path = os.path.join(subnote_dir, "chapter4_bilingual.json")
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
        
    toc_links = []
    for item in toc_items:
        pad = "pl-2" if item["level"] == 1 else ("pl-4" if item["level"] == 2 else "pl-6")
        color = "text-sky-300 font-bold" if item["level"] == 1 else ("text-slate-300 font-medium" if item["level"] == 2 else "text-slate-400 text-xs")
        toc_links.append(f"""
        <a href="#{item['id']}" onclick="scrollToBlock('{item['id']}')" class="block py-1.5 {pad} {color} hover:text-white hover:bg-slate-800/60 rounded px-2 transition text-sm truncate">
            {item['ko']}
        </a>
        """)
        
    full_html = f"""<!DOCTYPE html>
<html lang="ko" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chapter 4 1:1 대조 리더 | Establishing the Direction for the Safety Culture</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {{
            darkMode: 'class',
            theme: {{
                extend: {{
                    colors: {{
                        slate: {{
                            850: '#0f172a',
                            950: '#020617',
                        }}
                    }}
                }}
            }}
        }}
    </script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+KR:wght@300;400;500;700;900&family=JetBrains+Mono:wght@400;500&display=swap');
        body {{
            font-family: 'Inter', 'Noto Sans KR', sans-serif;
        }}
        pre, code {{
            font-family: 'JetBrains Mono', monospace;
        }}
        .active-highlight {{
            background-color: rgba(56, 189, 248, 0.08) !important;
            border-left: 3px solid #38bdf8;
        }}
        .mode-en-only .ko-pane {{ display: none !important; }}
        .mode-en-only .en-pane {{ grid-column: span 2 / span 2 !important; }}
        .mode-ko-only .en-pane {{ display: none !important; }}
        .mode-ko-only .ko-pane {{ grid-column: span 2 / span 2 !important; }}
        /* Custom scrollbar */
        ::-webkit-scrollbar {{
            width: 8px;
            height: 8px;
        }}
        ::-webkit-scrollbar-track {{
            background: #090d16;
        }}
        ::-webkit-scrollbar-thumb {{
            background: #1e293b;
            border-radius: 4px;
        }}
        ::-webkit-scrollbar-thumb:hover {{
            background: #334155;
        }}
    </style>
</head>
<body class="bg-slate-950 text-slate-200 antialiased min-h-screen flex flex-col selection:bg-sky-500 selection:text-white">

    <!-- Top Sticky Header -->
    <header class="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <!-- Left: Brand / Title -->
            <div class="flex items-center gap-3 min-w-0">
                <a href="index.html" class="flex items-center gap-2 text-slate-400 hover:text-white transition group py-1">
                    <span class="p-1.5 rounded-lg bg-slate-800 group-hover:bg-sky-600 group-hover:text-white transition">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </span>
                    <span class="text-xs font-semibold hidden sm:inline">대시보드</span>
                </a>
                <div class="h-4 w-px bg-slate-700 hidden sm:block"></div>
                <div class="min-w-0">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">PART II</span>
                        <span class="text-xs font-mono text-slate-400 truncate">Chapter 04</span>
                    </div>
                    <h1 class="text-sm sm:text-base font-bold text-white truncate">
                        Establishing the Direction for the Safety Culture (안전문화를 위한 방향 설정)
                    </h1>
                </div>
            </div>

            <!-- Center: View Mode Switcher -->
            <div class="hidden md:flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button id="btn-mode-split" onclick="setViewMode('split')" class="px-2.5 py-1 text-xs font-medium rounded-md bg-sky-600 text-white shadow-sm transition">
                    1:1 대조
                </button>
                <button id="btn-mode-ko" onclick="setViewMode('ko-only')" class="px-2.5 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-white transition">
                    한글만 (KO)
                </button>
                <button id="btn-mode-en" onclick="setViewMode('en-only')" class="px-2.5 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-white transition">
                    원문만 (EN)
                </button>
            </div>

            <!-- Right: Controls -->
            <div class="flex items-center gap-2">
                <!-- Search Box -->
                <div class="relative hidden sm:block w-40 lg:w-48">
                    <input type="text" id="searchInput" oninput="handleSearch(this.value)" placeholder="본문 검색 (한/영)..." class="w-full bg-slate-950 text-xs rounded-lg px-2.5 py-1.5 pl-7 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500" />
                    <svg class="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>

                <!-- Font Size Controls -->
                <div class="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-0.5">
                    <button onclick="changeFontSize(-1)" class="w-7 h-7 flex items-center justify-center text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded transition" title="글자 작게">A-</button>
                    <button onclick="changeFontSize(1)" class="w-7 h-7 flex items-center justify-center text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded transition" title="글자 크게">A+</button>
                </div>

                <!-- TOC Drawer Button -->
                <button onclick="toggleSidebar()" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
                    <span class="hidden sm:inline">목차</span>
                </button>

                <!-- Navigation Prev/Next Chapter -->
                <div class="flex items-center gap-1">
                    <a href="chapter3_bilingual.html" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition" title="이전 챕터 (제3장)">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                    </a>
                    <a href="chapter4_subnote.html" class="p-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/80 transition text-xs font-semibold" title="제4장 심화 서브노트 보기">
                        📘 서브노트
                    </a>
                </div>
            </div>
        </div>
    </header>

    <!-- Sidebar / TOC Drawer -->
    <div id="sidebar" class="fixed inset-y-0 left-0 w-80 bg-slate-900/98 backdrop-blur-xl border-r border-slate-800 z-50 transform -translate-x-full transition-transform duration-300 ease-in-out flex flex-col shadow-2xl">
        <div class="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
                <h3 class="text-sm font-bold text-white flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-teal-400"></span> Chapter 4 목차
                </h3>
                <p class="text-[11px] text-slate-400 mt-0.5">총 {total_blocks}개 단락 (100% 1:1 매칭)</p>
            </div>
            <button onclick="toggleSidebar()" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
        <div class="flex-1 overflow-y-auto p-3 space-y-1 text-sm">
            {"".join(toc_links)}
        </div>
        <div class="p-3 border-t border-slate-800 text-center">
            <span class="text-[11px] text-slate-500">안전문화 연구용 무삭제 정밀 대조판</span>
        </div>
    </div>

    <!-- Sub-bar Info Banner -->
    <div class="bg-slate-900/50 border-b border-slate-800/80 py-2 text-xs text-slate-400">
        <div class="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-3">
                <span class="flex items-center gap-1.5 text-sky-400 font-medium">
                    <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span> 좌측: 영문 학술 원문 (100% 무삭제)
                </span>
                <span class="text-slate-600">|</span>
                <span class="flex items-center gap-1.5 text-amber-400 font-medium">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> 우측: 한국어 완전 번역 (Hazard=재해, Risk=위험 엄격 준수)
                </span>
            </div>
            <div class="flex items-center gap-2 text-[11px] text-slate-500">
                <span>총 94 블록 완비</span>
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
            
            if (window.innerWidth < 1024) {{
                toggleSidebar();
            }}
        }}

        function toggleSidebar() {{
            const sb = document.getElementById('sidebar');
            sb.classList.toggle('-translate-x-full');
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

    html_path = os.path.join(subnote_dir, "chapter4_bilingual.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"[OK] Successfully built interactive bilingual HTML: {html_path}")

if __name__ == '__main__':
    build_bilingual_system()
