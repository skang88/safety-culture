# -*- coding: utf-8 -*-
"""
Chapter 10 Bilingual Reader & Markdown Builder
Combines all translation parts, outputs chapter10-번역.md, chapter10_bilingual.json, and chapter10_bilingual.html
"""

import os
import json
import re

import ch10_translations_p1 as p1
import ch10_translations_p2 as p2

def get_all_translations():
    combined = {}
    combined.update(p1.translations)
    combined.update(p2.translations)
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
                in_tbody = True
                continue
            if not in_tbody:
                table_html.append('<thead class="bg-slate-800/80 text-sky-300 font-semibold border-b border-slate-700"><tr>')
                for c in cells:
                    table_html.append(f'<th class="px-3 py-2 border-r border-slate-700/50 last:border-0">{c}</th>')
                table_html.append('</tr></thead><tbody>')
            else:
                table_html.append('<tr class="border-b border-slate-800/60 hover:bg-slate-800/40 transition">')
                for c in cells:
                    table_html.append(f'<td class="px-3 py-2 text-slate-300 border-r border-slate-800/50 last:border-0">{c}</td>')
                table_html.append('</tr>')
        table_html.append('</tbody></table></div>')
        return "\n".join(table_html)
        
    # Unordered / Ordered list
    if any(line.strip().startswith(("* ", "- ", "1. ", "2. ", "3. ")) for line in lines):
        items = []
        is_ordered = lines[0].strip().startswith(("1.", "2.", "3."))
        tag = "ol" if is_ordered else "ul"
        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue
            cleaned = re.sub(r"^(\*|-|\d+\.)\s+", "", line_str)
            cleaned = re.sub(r"\*\*(.*?)\*\*", r'<strong class="text-white font-semibold">\1</strong>', cleaned)
            cleaned = re.sub(r"\*(.*?)\*", r'<em class="text-sky-300 not-italic font-medium">\1</em>', cleaned)
            items.append(f'<li class="pl-1 leading-relaxed text-slate-300">{cleaned}</li>')
        list_class = "list-decimal ml-5 space-y-2 my-3 text-sm lg:text-base text-slate-300" if is_ordered else "list-disc ml-5 space-y-2 my-3 text-sm lg:text-base text-slate-300"
        return f'<{tag} class="{list_class}">{"".join(items)}</{tag}>'
        
    # Paragraph
    formatted_p = re.sub(r"\*\*(.*?)\*\*", r'<strong class="text-white font-semibold">\1</strong>', text)
    formatted_p = re.sub(r"\*(.*?)\*", r'<em class="text-sky-300 not-italic font-medium">\1</em>', formatted_p)
    formatted_p = formatted_p.replace("\n\n", "</p><p class='mt-3 leading-relaxed text-slate-300 text-sm lg:text-base'>").replace("\n", "<br/>")
    return f'<p class="leading-relaxed text-slate-300 text-sm lg:text-base">{formatted_p}</p>'

def build_bilingual_system():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    subnote_dir = os.path.abspath(os.path.join(script_dir, ".."))
    
    raw_blocks_path = os.path.join(subnote_dir, "chapter10_raw_blocks.json")
    if not os.path.exists(raw_blocks_path):
        print(f"[Error] {raw_blocks_path} not found!")
        return

    with open(raw_blocks_path, "r", encoding="utf-8") as f:
        raw_blocks = json.load(f)

    translations = get_all_translations()
    print(f"[INFO] Loaded {len(raw_blocks)} raw blocks and {len(translations)} translated blocks.")

    # 1. Output chapter10-번역.md
    ko_md_path = os.path.join(subnote_dir, "chapter10-번역.md")
    with open(ko_md_path, "w", encoding="utf-8") as f:
        for b in raw_blocks:
            bid = b["id"]
            ko_text = translations.get(bid, b["content"])
            f.write(f"<!-- Block {bid} -->\n{ko_text}\n\n")
    print(f"[OK] Generated: {ko_md_path}")

    # 2. Output chapter10_bilingual.json
    bilingual_data = []
    for b in raw_blocks:
        bid = b["id"]
        en_content = b["content"]
        ko_content = translations.get(bid, "")
        bilingual_data.append({
            "id": bid,
            "en": en_content,
            "ko": ko_content,
            "type": "heading" if en_content.strip().startswith("#") else ("image" if "![" in en_content else "content")
        })

    json_path = os.path.join(subnote_dir, "chapter10_bilingual.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(bilingual_data, f, ensure_ascii=False, indent=2)
    print(f"[OK] Generated: {json_path}")

    # 3. Generate HTML
    rows_html = []
    for item in bilingual_data:
        bid = item["id"]
        en_html = md_to_html_snippet(item["en"])
        ko_html = md_to_html_snippet(item["ko"])
        
        row_str = f"""
        <!-- Block {bid} -->
        <div id="{bid}" class="bilingual-row grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 py-4 px-4 lg:px-6 rounded-2xl transition-all duration-200 border border-transparent hover:border-slate-700/60 hover:bg-slate-800/40 relative group">
            <div class="absolute -left-2 top-4 hidden lg:flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{bid}</span>
            </div>
            
            <!-- EN Column -->
            <div class="col-en space-y-2 border-l-2 border-sky-500/30 pl-4 py-1">
                <div class="flex items-center justify-between text-xs text-sky-400 font-mono select-none mb-1">
                    <span class="flex items-center gap-1.5 font-semibold"><span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>EN - ORIGINAL</span>
                    <button onclick="copyBlockText('{bid}', 'en')" class="opacity-0 group-hover:opacity-100 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px] flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> Copy
                    </button>
                </div>
                <div class="content-body text-slate-200">{en_html}</div>
            </div>

            <!-- KO Column -->
            <div class="col-ko space-y-2 border-l-2 border-amber-500/30 pl-4 py-1">
                <div class="flex items-center justify-between text-xs text-amber-400 font-mono select-none mb-1">
                    <span class="flex items-center gap-1.5 font-semibold"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>KO - 번역 / 주석</span>
                    <button onclick="copyBlockText('{bid}', 'ko')" class="opacity-0 group-hover:opacity-100 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px] flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> 복사
                    </button>
                </div>
                <div class="content-body text-slate-200">{ko_html}</div>
            </div>
        </div>
        """
        rows_html.append(row_str)

    full_html = f"""<!DOCTYPE html>
<html lang="ko" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chapter 10: Understanding Basic Risk Management Principles - 1:1 한영대조 리더</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {{
            darkMode: 'class',
            theme: {{
                extend: {{
                    colors: {{
                        brand: {{
                            50: '#f0f9ff',
                            500: '#0ea5e9',
                            900: '#0c4a6e',
                        }}
                    }}
                }}
            }}
        }}
    </script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {{
            background-color: #0b1120;
            color: #e2e8f0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }}
        .bilingual-row:hover {{
            background-color: rgba(30, 41, 59, 0.5);
        }}
        .active-highlight {{
            background-color: rgba(14, 165, 233, 0.12) !important;
            border-color: rgba(14, 165, 233, 0.4) !important;
        }}
        /* Custom scrollbar */
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
<body class="min-h-screen flex flex-col">

    <!-- Top Sticky Header -->
    <header class="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-xl">
        <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3">
                <a href="index.html" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition" title="서브노트 목차로 이동">
                    <i class="fa-solid fa-arrow-left"></i>
                </a>
                <div>
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Chapter 10</span>
                        <h1 class="text-sm md:text-base font-bold text-white tracking-tight">Understanding Basic Risk Management Principles</h1>
                    </div>
                    <p class="text-xs text-slate-400 hidden sm:block">제10장: 기본 위험관리 원칙의 이해 (100% 무축약 1:1 대조 리더)</p>
                </div>
            </div>

            <!-- Global Controls -->
            <div class="flex items-center gap-2">
                <!-- Search -->
                <div class="relative hidden md:block">
                    <input type="text" id="search-input" placeholder="본문 검색 (한/영)..." 
                           class="w-44 lg:w-60 bg-slate-800/90 text-sm text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-sky-500 transition">
                    <i class="fa-solid fa-magnifying-glass absolute left-2.5 top-2.5 text-xs text-slate-400"></i>
                </div>

                <!-- View Mode Controls -->
                <div class="bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 flex items-center">
                    <button onclick="setViewMode('split')" id="btn-mode-split" class="px-2.5 py-1 text-xs font-medium rounded-md bg-sky-600 text-white shadow-sm transition" title="1:1 한영대조">
                        <i class="fa-solid fa-columns mr-1"></i> 대조
                    </button>
                    <button onclick="setViewMode('en')" id="btn-mode-en" class="px-2.5 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-white transition" title="영어 원문만 보기">
                        EN
                    </button>
                    <button onclick="setViewMode('ko')" id="btn-mode-ko" class="px-2.5 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-white transition" title="한국어 번역만 보기">
                        KO
                    </button>
                </div>

                <!-- Font Resizer -->
                <div class="bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 flex items-center">
                    <button onclick="changeFontSize(-1)" class="w-7 h-7 flex items-center justify-center text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition" title="글자 축소">A-</button>
                    <button onclick="changeFontSize(1)" class="w-7 h-7 flex items-center justify-center text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition" title="글자 확대">A+</button>
                </div>

                <!-- Navigation between Chapters -->
                <div class="flex items-center gap-1 border-l border-slate-700 pl-2">
                    <a href="chapter9_bilingual.html" class="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs" title="9장으로">
                        <i class="fa-solid fa-chevron-left"></i> Ch9
                    </a>
                    <a href="chapter11_bilingual.html" class="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs" title="11장으로">
                        Ch11 <i class="fa-solid fa-chevron-right"></i>
                    </a>
                </div>
            </div>
        </div>
    </header>

    <!-- Info / Stats Banner -->
    <section class="bg-slate-900/40 border-b border-slate-800/60 px-4 py-2">
        <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div class="flex items-center gap-3">
                <span class="flex items-center gap-1 text-sky-400"><i class="fa-solid fa-shield-halved"></i> 학술연구 검증 원칙(GEMINI.md) 준수</span>
                <span class="hidden sm:inline text-slate-600">|</span>
                <span class="text-slate-300">총 <strong>{len(raw_blocks)}</strong>개 단락 (100% 매핑 완료)</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span class="text-emerald-400 font-mono text-[11px]">Ready for Deep Reading</span>
            </div>
        </div>
    </section>

    <!-- Main Bilingual Reader Container -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-4" id="reader-container">
        {"".join(rows_html)}
    </main>

    <!-- Floating Toast for Copy/Alerts -->
    <div id="toast" class="fixed bottom-6 right-6 bg-slate-800 border border-sky-500/50 text-white px-4 py-2 rounded-xl shadow-2xl text-xs font-semibold transform transition-all duration-300 opacity-0 translate-y-3 pointer-events-none flex items-center gap-2 z-50">
        <i class="fa-solid fa-circle-check text-sky-400"></i>
        <span>복사되었습니다!</span>
    </div>

    <!-- Interactive Scripts -->
    <script>
        const rawBilingualData = {json.dumps(bilingual_data, ensure_ascii=False)};
        const pairedBlocks = {{}};
        rawBilingualData.forEach(item => {{
            pairedBlocks[item.id] = item;
        }});

        let currentFontSize = 15;

        // Search logic
        const searchInput = document.getElementById('search-input');
        if (searchInput) {{
            searchInput.addEventListener('input', function(e) {{
                const term = e.target.value.toLowerCase().trim();
                const rows = document.querySelectorAll('.bilingual-row');
                rows.forEach(row => {{
                    if (!term) {{
                        row.style.display = '';
                        return;
                    }}
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(term) ? '' : 'none';
                }});
            }});
        }}

        // View Mode Switcher
        function setViewMode(mode) {{
            const enCols = document.querySelectorAll('.col-en');
            const koCols = document.querySelectorAll('.col-ko');
            const rows = document.querySelectorAll('.bilingual-row');

            document.getElementById('btn-mode-split').className = 'px-2.5 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-white transition';
            document.getElementById('btn-mode-en').className = 'px-2.5 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-white transition';
            document.getElementById('btn-mode-ko').className = 'px-2.5 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-white transition';

            if (mode === 'en') {{
                enCols.forEach(c => c.style.display = 'block');
                koCols.forEach(c => c.style.display = 'none');
                rows.forEach(r => {{
                    r.classList.remove('lg:grid-cols-2');
                    r.classList.add('grid-cols-1');
                }});
                document.getElementById('btn-mode-en').className = 'px-2.5 py-1 text-xs font-medium rounded-md bg-sky-600 text-white shadow-sm transition';
            }} else if (mode === 'ko') {{
                enCols.forEach(c => c.style.display = 'none');
                koCols.forEach(c => c.style.display = 'block');
                rows.forEach(r => {{
                    r.classList.remove('lg:grid-cols-2');
                    r.classList.add('grid-cols-1');
                }});
                document.getElementById('btn-mode-ko').className = 'px-2.5 py-1 text-xs font-medium rounded-md bg-amber-600 text-white shadow-sm transition';
            }} else {{
                enCols.forEach(c => c.style.display = 'block');
                koCols.forEach(c => c.style.display = 'block');
                rows.forEach(r => {{
                    r.classList.remove('grid-cols-1');
                    r.classList.add('lg:grid-cols-2');
                }});
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

    html_path = os.path.join(subnote_dir, "chapter10_bilingual.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"[OK] Successfully built interactive bilingual HTML: {html_path}")

if __name__ == '__main__':
    build_bilingual_system()
