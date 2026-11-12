# -*- coding: utf-8 -*-
import os
import re

NEW_MD_TO_HTML_SNIPPET = '''def md_to_html_snippet(text):
    if not text or not text.strip():
        return ""
        
    lines = text.strip().split("\\n")
    html_parts = []
    i = 0
    n = len(lines)
    
    while i < n:
        line = lines[i].strip()
        if not line:
            i += 1
            continue
            
        # 1. Heading 1
        if line.startswith("# "):
            title = line[2:].strip()
            html_parts.append(f'<h1 class="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-4 border-b border-sky-500/30 pb-3">{title}</h1>')
            i += 1
            continue
            
        # 2. Heading 2
        if line.startswith("## "):
            title = line[3:].strip()
            html_parts.append(f'<h2 class="text-xl lg:text-2xl font-bold text-sky-400 tracking-tight mt-6 mb-3 flex items-center gap-2"><span class="w-2 h-2 rounded bg-sky-400 inline-block"></span>{title}</h2>')
            i += 1
            continue
            
        # 3. Heading 3
        if line.startswith("### "):
            title = line[4:].strip()
            html_parts.append(f'<h3 class="text-lg lg:text-xl font-semibold text-amber-300 tracking-tight mt-5 mb-2">{title}</h3>')
            i += 1
            continue
            
        # 4. Image
        img_match = re.search(r"!\\[(.*?)\\]\\((.*?)\\)", line)
        if img_match:
            alt, src = img_match.group(1), img_match.group(2)
            html_parts.append(f'<div class="my-4 text-center"><img src="{src}" alt="{alt}" class="rounded-xl shadow-lg mx-auto max-h-96 border border-slate-700 bg-slate-900 p-2 object-contain hover:scale-105 transition-transform" /></div>')
            i += 1
            continue
            
        # 5. Blockquote
        if line.startswith(">"):
            quote_lines = []
            while i < n and (lines[i].strip().startswith(">") or lines[i].strip() == ""):
                q_l = lines[i].strip()
                if q_l.startswith(">"):
                    q_l = q_l[1:].strip()
                if q_l:
                    quote_lines.append(q_l)
                i += 1
            q_text = "<br/>".join(quote_lines)
            q_formatted = re.sub(r"\\*\\*(.*?)\\*\\*", r'<strong class="text-white font-semibold">\\1</strong>', q_text)
            q_formatted = re.sub(r"\\*(.*?)\\*", r'<em class="text-sky-300 not-italic font-medium">\\1</em>', q_formatted)
            html_parts.append(f'<blockquote class="border-l-4 border-sky-400 pl-4 py-2 my-3 bg-sky-950/20 rounded-r-lg text-slate-300 italic text-sm lg:text-base">{q_formatted}</blockquote>')
            continue
            
        # 6. Table
        if line.startswith("|") and "|" in line[1:]:
            table_lines = []
            while i < n and lines[i].strip().startswith("|") and "|" in lines[i].strip()[1:]:
                table_lines.append(lines[i].strip())
                i += 1
            table_html = ['<div class="overflow-x-auto my-4 rounded-xl border border-slate-700"><table class="w-full text-left text-sm border-collapse">']
            in_tbody = False
            for t_line in table_lines:
                cells = [c.strip() for c in t_line.split("|")[1:-1]]
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
            html_parts.append("\\n".join(table_html))
            continue
            
        # 7. Unordered / Ordered List
        is_ul = line.startswith(("* ", "- "))
        is_ol = bool(re.match(r"^\\d+\\.\\s+", line))
        if is_ul or is_ol:
            list_tag = "ol" if is_ol else "ul"
            list_class = "list-decimal ml-5 space-y-2 my-3 text-sm lg:text-base text-slate-300" if is_ol else "list-disc ml-5 space-y-2 my-3 text-sm lg:text-base text-slate-300"
            items = []
            while i < n:
                cur = lines[i].strip()
                if not cur:
                    i += 1
                    continue
                if is_ul and cur.startswith(("* ", "- ")):
                    cleaned = re.sub(r"^(\\*|-)\\s+", "", cur)
                elif is_ol and re.match(r"^\\d+\\.\\s+", cur):
                    cleaned = re.sub(r"^\\d+\\.\\s+", "", cur)
                elif cur.startswith(" ") or cur.startswith("\\t"):
                    if items:
                        items[-1] += " " + cur.strip()
                    i += 1
                    continue
                else:
                    break
                cleaned = re.sub(r"\\*\\*(.*?)\\*\\*", r'<strong class="text-white font-semibold">\\1</strong>', cleaned)
                cleaned = re.sub(r"\\*(.*?)\\*", r'<em class="text-sky-300 not-italic font-medium">\\1</em>', cleaned)
                items.append(f'<li class="pl-1 leading-relaxed text-slate-300">{cleaned}</li>')
                i += 1
            html_parts.append(f'<{list_tag} class="{list_class}">{"".join(items)}</{list_tag}>')
            continue
            
        # 8. Paragraph
        para_lines = []
        while i < n:
            cur = lines[i].strip()
            if not cur:
                i += 1
                break
            if cur.startswith(("# ", "## ", "### ", "> ", "* ", "- ")) or re.match(r"^\\d+\\.\\s+", cur) or (cur.startswith("|") and "|" in cur[1:]) or re.search(r"!\\[(.*?)\\]\\((.*?)\\)", cur):
                break
            para_lines.append(cur)
            i += 1
        p_text = " ".join(para_lines)
        p_text = re.sub(r"\\*\\*(.*?)\\*\\*", r'<strong class="text-white font-semibold">\\1</strong>', p_text)
        p_text = re.sub(r"\\*(.*?)\\*", r'<em class="text-sky-300 not-italic font-medium">\\1</em>', p_text)
        html_parts.append(f'<p class="leading-relaxed text-slate-300 text-sm lg:text-base my-2">{p_text}</p>')
        
    return "\\n".join(html_parts)'''

builders_dir = "subnote/builders"
for fname in sorted(os.listdir(builders_dir)):
    if fname.startswith("build_ch") and fname.endswith("_bilingual.py"):
        fpath = os.path.join(builders_dir, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Replace md_to_html_snippet function
        pattern = r"def md_to_html_snippet\(text\):.*?(?=\ndef build_|\Z)"
        if re.search(pattern, content, re.DOTALL):
            new_content = re.sub(pattern, lambda m: NEW_MD_TO_HTML_SNIPPET + "\n", content, count=1, flags=re.DOTALL)
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Updated parser in {fname}")
        else:
            print(f"Could not find md_to_html_snippet in {fname}")
