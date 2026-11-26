#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Unified Subnote HTML Generator for All Chapters (Chapters 1 - 16)
Unifies header navigation (Home/Portal index.html, Prev/Next Chapter, 1:1 Bilingual Reader),
responsive sidebar, dark/light theme persistence, Mermaid, MathJax, and AI Tutor panel.
"""

import html as html_lib
import json
import os
import re


def parse_markdown_to_html(md_text):
    lines = md_text.split('\n')
    output = []
    in_table = False
    table_header = []
    table_rows = []
    in_mermaid = False
    mermaid_lines = []
    in_carousel = False
    carousel_imgs = []
    in_ul = False
    in_ol = False
    in_blockquote = False
    blockquote_lines = []
    in_case = False

    def inline_format(text):
        text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
        text = re.sub(r'\*(.+?)\*', r'<em>\1</em>', text)
        text = re.sub(r'\\\((.+?)\\\)', r'<span class="math-inline">\(\1\)</span>', text)
        text = re.sub(r'\$(.+?)\$', r'<span class="math-inline">\(\1\)</span>', text)
        text = re.sub(
            r'!\[(.*?)\]\((.*?)\)',
            r'<div class="img-wrapper"><img src="\2" alt="\1"><p class="img-caption">\1</p></div>',
            text,
        )
        text = re.sub(r'\[(.*?)\]\((.*?)\)', r'<a href="\2" target="_blank">\1</a>', text)
        text = re.sub(r'`(.+?)`', r'<code>\1</code>', text)
        return text

    def close_table():
        nonlocal in_table, table_header, table_rows
        if not in_table:
            return ""
        html = ['<div class="table-wrapper"><table>']
        if table_header:
            html.append('<thead><tr>')
            for th in table_header:
                html.append(f'<th>{inline_format(th)}</th>')
            html.append('</tr></thead>')
        if table_rows:
            html.append('<tbody>')
            for row in table_rows:
                html.append('<tr>')
                for td in row:
                    html.append(f'<td>{inline_format(td)}</td>')
                html.append('</tr>')
            html.append('</tbody>')
        html.append('</table></div>')
        in_table = False
        table_header = []
        table_rows = []
        return '\n'.join(html)

    def close_mermaid():
        nonlocal in_mermaid, mermaid_lines
        if not in_mermaid:
            return ""
        code = '\n'.join(mermaid_lines)
        html = f'<div class="mermaid-box"><pre class="mermaid">\n{code}\n</pre></div>'
        in_mermaid = False
        mermaid_lines = []
        return html

    def close_carousel():
        nonlocal in_carousel, carousel_imgs
        if not in_carousel:
            return ""
        items = []
        for alt, src in carousel_imgs:
            cap = html_lib.escape(alt)
            items.append(f'<div class="carousel-item"><img src="{src}" alt="{cap}"><p class="img-caption">{cap}</p></div>')
        html = f'<div class="carousel-grid">\n{os.linesep.join(items)}\n</div>'
        in_carousel = False
        carousel_imgs = []
        return html

    def close_list():
        nonlocal in_ul, in_ol
        html = ""
        if in_ul:
            html += '</ul>\n'
            in_ul = False
        if in_ol:
            html += '</ol>\n'
            in_ol = False
        return html

    def close_blockquote():
        nonlocal in_blockquote, blockquote_lines
        if not in_blockquote:
            return ""
        text = '<br>'.join([inline_format(l) for l in blockquote_lines if l.strip()])
        alert_type = "note"
        title = ""
        if "[!IMPORTANT]" in text:
            alert_type = "important"
            text = text.replace("[!IMPORTANT]", "").strip()
            title = '<div class="callout-title">🚨 중요 핵심 원칙</div>'
        elif "[!TIP]" in text:
            alert_type = "tip"
            text = text.replace("[!TIP]", "").strip()
            title = '<div class="callout-title">💡 핵심 팁</div>'
        elif "[!WARNING]" in text:
            alert_type = "important"
            text = text.replace("[!WARNING]", "").strip()
            title = '<div class="callout-title">⚠️ 경고</div>'
        elif "[!NOTE]" in text:
            alert_type = "note"
            text = text.replace("[!NOTE]", "").strip()
            title = '<div class="callout-title">📌 참고</div>'

        html = f'<div class="callout callout-{alert_type}">\n{title}\n{text}\n</div>'
        in_blockquote = False
        blockquote_lines = []
        return html

    def close_case():
        nonlocal in_case
        if in_case:
            in_case = False
            return '</div>\n'
        return ""

    i = 0
    while i < len(lines):
        if lines[i].strip().startswith('## '):
            break
        i += 1

    first_sec = True
    sec_counter = 0
    while i < len(lines):
        line = lines[i]
        trimmed = line.strip()

        if trimmed.startswith('````carousel'):
            output.append(close_list())
            output.append(close_table())
            output.append(close_blockquote())
            in_carousel = True
            carousel_imgs = []
            i += 1
            continue

        if in_carousel:
            if trimmed.startswith('````'):
                output.append(close_carousel())
            else:
                for m_alt, m_src in re.findall(r'!\[(.*?)\]\((.*?)\)', trimmed):
                    carousel_imgs.append((m_alt, m_src))
            i += 1
            continue

        if trimmed.startswith('```mermaid'):
            output.append(close_list())
            output.append(close_table())
            output.append(close_blockquote())
            in_mermaid = True
            mermaid_lines = []
            i += 1
            continue

        if in_mermaid:
            if trimmed.startswith('```'):
                output.append(close_mermaid())
            else:
                mermaid_lines.append(line)
            i += 1
            continue

        if trimmed.startswith('```'):
            output.append(close_list())
            output.append(close_table())
            output.append(close_blockquote())
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith('```'):
                code_lines.append(lines[i])
                i += 1
            output.append(f'<pre><code>{html_lib.escape(os.linesep.join(code_lines))}</code></pre>')
            i += 1
            continue

        if trimmed.startswith('>'):
            output.append(close_list())
            output.append(close_table())
            in_blockquote = True
            clean_b = trimmed.lstrip('>').strip()
            blockquote_lines.append(clean_b)
            i += 1
            continue
        elif in_blockquote:
            output.append(close_blockquote())

        if trimmed.startswith('|') and trimmed.endswith('|'):
            output.append(close_list())
            cells = [c.strip() for c in trimmed[1:-1].split('|')]
            if all(set(c).issubset({'-', ':', ' '}) for c in cells):
                pass
            elif not in_table:
                in_table = True
                table_header = cells
            else:
                table_rows.append(cells)
            i += 1
            continue
        elif in_table:
            output.append(close_table())

        if trimmed.startswith('## '):
            output.append(close_list())
            output.append(close_case())
            sec_counter += 1
            h2_text = trimmed[3:].strip()
            badge_m = re.match(r'^(\d+)\.\s*(.*)', h2_text)
            sec_tag = '</section>\n' if not first_sec else ''
            first_sec = False
            if badge_m:
                sec_num = badge_m.group(1)
                sec_title = badge_m.group(2)
                sec_id = f"sec-{sec_num}"
                output.append(f'{sec_tag}<section class="subnote-section" id="{sec_id}">\n<h2><span class="sec-badge">{sec_num}</span> {inline_format(sec_title)}</h2>')
            else:
                slug = re.sub(r'[^a-zA-Z0-9]+', '-', h2_text).strip('-').lower()
                sec_id = f"sec-{slug}" if slug else f"sec-auto-{sec_counter}"
                output.append(f'{sec_tag}<section class="subnote-section" id="{sec_id}">\n<h2>{inline_format(h2_text)}</h2>')
            i += 1
            continue

        if trimmed.startswith('### '):
            output.append(close_list())
            output.append(close_case())
            h3_text = trimmed[4:].strip()
            if "LESSON LEARNED" in h3_text or "CASE STUDY" in h3_text or "OBSERVATION" in h3_text:
                in_case = True
                output.append(f'<div class="case-box"><span class="case-badge">실전 사례 &amp; 관찰</span><h4>{inline_format(h3_text)}</h4>')
            else:
                output.append(f'<h3>{inline_format(h3_text)}</h3>')
            i += 1
            continue

        if trimmed.startswith('#### '):
            output.append(close_list())
            h4_text = trimmed[5:].strip()
            output.append(f'<h4>{inline_format(h4_text)}</h4>')
            i += 1
            continue

        if trimmed.startswith('##### '):
            output.append(close_list())
            h5_text = trimmed[6:].strip()
            output.append(f'<h5>{inline_format(h5_text)}</h5>')
            i += 1
            continue

        if re.match(r'^[*\-]\s+', trimmed):
            if not in_ul:
                output.append(close_list())
                output.append('<ul>')
                in_ul = True
            item_text = re.sub(r'^[*\-]\s+', '', trimmed)
            output.append(f'<li>{inline_format(item_text)}</li>')
            i += 1
            continue

        if re.match(r'^\d+\.\s+', trimmed):
            if not in_ol:
                output.append(close_list())
                output.append('<ol>')
                in_ol = True
            item_text = re.sub(r'^\d+\.\s+', '', trimmed)
            output.append(f'<li>{inline_format(item_text)}</li>')
            i += 1
            continue

        if trimmed == '':
            output.append(close_list())
            i += 1
            continue

        output.append(close_list())
        if re.match(r'^!\[(.*?)\]\((.*?)\)\s*(--\s*)?$', trimmed):
            clean_img = re.sub(r'\s*--\s*$', '', trimmed)
            output.append(inline_format(clean_img))
        elif trimmed == '---':
            output.append('<hr class="divider">')
        else:
            output.append(f'<p>{inline_format(trimmed)}</p>')
        i += 1

    output.append(close_list())
    output.append(close_table())
    output.append(close_blockquote())
    output.append(close_case())
    output.append(close_mermaid())
    output.append(close_carousel())
    if not first_sec:
        output.append('</section>')

    return '\n'.join(output)


def build_nav_links(md_text):
    nav_links = []
    sec_counter = 0
    for line in md_text.split('\n'):
        trimmed = line.strip()
        if trimmed.startswith('## '):
            sec_counter += 1
            h2_text = trimmed[3:].strip()
            badge_m = re.match(r'^(\d+)\.\s*(.*)', h2_text)
            if badge_m:
                sec_num = badge_m.group(1)
                sec_title = badge_m.group(2)
                sec_id = f"sec-{sec_num}"
                short_title = sec_title.split('(')[0].strip() or sec_title
                if len(short_title) > 30:
                    short_title = short_title[:28] + "..."
                nav_links.append((sec_id, f"{sec_num}. {short_title}"))
            else:
                slug = re.sub(r'[^a-zA-Z0-9]+', '-', h2_text).strip('-').lower()
                sec_id = f"sec-{slug}" if slug else f"sec-auto-{sec_counter}"
                short_title = h2_text.split('(')[0].strip() or h2_text
                if len(short_title) > 32:
                    short_title = short_title[:30] + "..."
                nav_links.append((sec_id, short_title))
    return nav_links


HTML_TEMPLATE = """<!doctype html>
<html lang="ko" data-theme="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Chapter {ch_num}: {title_en} — 서브노트 &amp; AI 학습 플랫폼</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <script>
        mermaid.initialize({{
            startOnLoad: true,
            theme: 'dark',
            securityLevel: 'loose',
            fontFamily: 'IBM Plex Sans KR, sans-serif',
            flowchart: {{
                useMaxWidth: false,
                htmlLabels: true
            }},
            sequence: {{
                useMaxWidth: false
            }},
            themeVariables: {{
                fontSize: '14.5px',
                fontFamily: 'IBM Plex Sans KR, sans-serif'
            }}
        }});
    </script>
    <script>
    window.MathJax = {{
      tex: {{
        inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
        displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
      }},
      svg: {{ fontCache: 'global' }}
    }};
    </script>
    <script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <style>
:root {{
  --bg-main: #0b1120;
  --bg-card: #151f32;
  --bg-card-sub: #1e293b;
  --bg-input: #26334d;
  --text-main: #f8fafc;
  --text-sub: #cbd5e1;
  --text-muted: #94a3b8;
  --accent-blue: #38bdf8;
  --accent-red: #ef4444;
  --accent-gold: #f59e0b;
  --accent-green: #10b981;
  --accent-purple: #a855f7;
  --border-color: #334155;
  --sidebar-w: 300px;
  --ai-panel-w: 390px;
  --header-h: 68px;
  --shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}}

[data-theme="light"] {{
  --bg-main: #f1f5f9;
  --bg-card: #ffffff;
  --bg-card-sub: #f8fafc;
  --bg-input: #e2e8f0;
  --text-main: #0f172a;
  --text-sub: #334155;
  --text-muted: #64748b;
  --accent-blue: #0284c7;
  --accent-red: #dc2626;
  --accent-gold: #d97706;
  --accent-green: #059669;
  --accent-purple: #9333ea;
  --border-color: #cbd5e1;
  --shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}}

* {{ box-sizing: border-box; margin: 0; padding: 0; }}

body {{
  font-family: 'IBM Plex Sans KR', sans-serif;
  background-color: var(--bg-main);
  color: var(--text-main);
  line-height: 1.75;
  font-size: 15.5px;
  overflow-x: hidden;
}}

/* Header */
.app-header {{
  position: fixed;
  top: 0; left: 0; right: 0;
  height: var(--header-h);
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1000;
  gap: 12px;
  transition: all 0.3s ease;
}}

[data-theme="light"] .app-header {{
  background: rgba(255, 255, 255, 0.92);
}}

.header-left {{
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}}

.header-logo-badge {{
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 0.4px;
  white-space: nowrap;
}}

.header-title-box {{
  min-width: 0;
}}

.header-title-box h1 {{
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}}

.header-title-box p {{
  font-size: 11.5px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}}

.header-actions {{
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}}

.btn-icon, .btn-home, .btn-bilingual {{
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-sub);
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 12.5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  font-family: inherit;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}}

.btn-icon:hover {{
  background: var(--bg-card-sub);
  color: var(--accent-blue);
  border-color: var(--accent-blue);
}}

.btn-home {{
  background: rgba(56, 189, 248, 0.14);
  border-color: rgba(56, 189, 248, 0.4);
  color: var(--accent-blue);
}}

.btn-home:hover {{
  background: rgba(56, 189, 248, 0.24);
  border-color: var(--accent-blue);
}}

.btn-bilingual {{
  background: rgba(16, 185, 129, 0.14);
  border-color: rgba(16, 185, 129, 0.4);
  color: var(--accent-green);
}}

.btn-bilingual:hover {{
  background: rgba(16, 185, 129, 0.24);
  border-color: var(--accent-green);
}}

.chapter-pager {{
  display: inline-flex;
  align-items: center;
  gap: 4px;
}}

/* Layout Wrapper */
.app-wrapper {{
  display: flex;
  margin-top: var(--header-h);
  min-height: calc(100vh - var(--header-h));
}}

/* Left Sidebar */
.left-sidebar {{
  width: var(--sidebar-w);
  background: var(--bg-card);
  border-right: 1px solid var(--border-color);
  padding: 20px 16px;
  position: fixed;
  top: var(--header-h);
  bottom: 0;
  overflow-y: auto;
  transition: transform 0.3s ease;
  z-index: 900;
  display: flex;
  flex-direction: column;
}}

.sidebar-portal-link {{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: var(--bg-card-sub);
  border: 1px solid var(--border-color);
  color: var(--accent-blue);
  text-decoration: none;
  font-size: 12.5px;
  font-weight: 600;
  transition: all 0.2s;
}}

.sidebar-portal-link:hover {{
  border-color: var(--accent-blue);
  background: rgba(56, 189, 248, 0.1);
}}

.sidebar-title {{
  font-size: 12px;
  font-weight: 700;
  color: var(--accent-blue);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
  padding-left: 8px;
}}

.nav-search {{
  width: 100%;
  padding: 8px 12px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-main);
  font-size: 13px;
  margin-bottom: 16px;
  font-family: inherit;
}}

.nav-menu {{
  list-style: none;
}}

.nav-menu li {{
  margin-bottom: 3px;
}}

.nav-link {{
  display: block;
  padding: 8px 12px;
  color: var(--text-sub);
  text-decoration: none;
  font-size: 13px;
  border-radius: 6px;
  transition: all 0.2s;
  line-height: 1.4;
}}

.nav-link:hover {{
  background: var(--bg-card-sub);
  color: var(--accent-blue);
  transform: translateX(3px);
}}

.nav-link.active {{
  background: rgba(56, 189, 248, 0.15);
  color: var(--accent-blue);
  font-weight: 600;
  border-left: 3px solid var(--accent-blue);
}}

/* Main Content */
.main-content {{
  margin-left: var(--sidebar-w);
  margin-right: var(--ai-panel-w);
  flex: 1;
  padding: 40px 48px;
  max-width: 1100px;
  transition: margin 0.3s ease;
}}

body.ai-closed .main-content {{
  margin-right: 0 !important;
}}

/* Intro Hero */
.intro-hero {{
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9));
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 36px 40px;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow);
}}

[data-theme="light"] .intro-hero {{
  background: linear-gradient(135deg, #ffffff, #f8fafc);
}}

.hero-tag {{
  display: inline-block;
  background: rgba(56, 189, 248, 0.15);
  color: var(--accent-blue);
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 16px;
  border: 1px solid rgba(56, 189, 248, 0.3);
}}

.intro-hero h1 {{
  font-size: 28px;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 12px;
  line-height: 1.3;
}}

.intro-hero p.lead {{
  font-size: 16.5px;
  color: var(--text-sub);
  margin-bottom: 24px;
}}

.hero-overview-img {{
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  background: var(--bg-card-sub);
  border-radius: 12px;
  margin: 16px 0 24px 0;
  border: 1px solid var(--border-color);
  padding: 8px;
}}

.epigraph-box {{
  background: var(--bg-card-sub);
  border-left: 4px solid var(--accent-purple);
  padding: 16px 20px;
  border-radius: 0 8px 8px 0;
  margin-top: 14px;
  font-style: italic;
  color: var(--text-sub);
  font-size: 14.5px;
}}

.epigraph-author {{
  display: block;
  margin-top: 8px;
  font-style: normal;
  font-weight: 600;
  color: var(--accent-gold);
  font-size: 13.5px;
}}

/* Section Cards */
.subnote-section {{
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 32px 36px;
  margin-bottom: 36px;
  box-shadow: var(--shadow-sm);
  scroll-margin-top: calc(var(--header-h) + 20px);
}}

.subnote-section h2 {{
  font-size: 21px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 10px;
}}

.subnote-section h2 .sec-badge {{
  background: var(--accent-blue);
  color: #0b1120;
  font-size: 13px;
  font-weight: 800;
  padding: 2px 9px;
  border-radius: 6px;
}}

.subnote-section h3 {{
  font-size: 17px;
  font-weight: 600;
  color: var(--accent-blue);
  margin: 24px 0 14px 0;
}}

.subnote-section h4 {{
  font-size: 15px;
  font-weight: 600;
  color: var(--accent-gold);
  margin: 18px 0 10px 0;
}}

.subnote-section h5 {{
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-purple);
  margin: 14px 0 8px 0;
}}

.subnote-section p {{
  margin-bottom: 14px;
  color: var(--text-sub);
}}

.subnote-section ul, .subnote-section ol {{
  margin-bottom: 18px;
  padding-left: 24px;
  color: var(--text-sub);
}}

.subnote-section li {{
  margin-bottom: 8px;
}}

.subnote-section code {{
  background: var(--bg-input);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--accent-blue);
}}

/* Callout Box */
.callout {{
  padding: 18px 22px;
  border-radius: 8px;
  margin: 20px 0;
  border-left: 4px solid;
  font-size: 14.5px;
  line-height: 1.65;
}}

.callout-note {{
  background: rgba(56, 189, 248, 0.08);
  border-color: var(--accent-blue);
  color: var(--text-sub);
}}

.callout-important {{
  background: rgba(239, 68, 68, 0.08);
  border-color: var(--accent-red);
  color: var(--text-sub);
}}

.callout-tip {{
  background: rgba(16, 185, 129, 0.08);
  border-color: var(--accent-green);
  color: var(--text-sub);
}}

.callout-title {{
  font-weight: 700;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}}

/* Case Study / Observation Box */
.case-box {{
  background: var(--bg-card-sub);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 22px 26px;
  margin: 22px 0;
  position: relative;
}}

.case-badge {{
  position: absolute;
  top: -12px;
  left: 20px;
  background: var(--accent-gold);
  color: #0b1120;
  font-weight: 800;
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 20px;
  text-transform: uppercase;
}}

.case-box h4 {{
  color: var(--text-main);
  margin-top: 4px;
  margin-bottom: 10px;
}}

/* Tables */
.table-wrapper {{
  width: 100%;
  overflow-x: auto;
  margin: 24px 0;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}}

table {{
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  text-align: left;
}}

thead {{
  background: var(--bg-card-sub);
  border-bottom: 2px solid var(--border-color);
}}

th {{
  padding: 12px 16px;
  font-weight: 600;
  color: var(--accent-blue);
  white-space: nowrap;
}}

td {{
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-sub);
  vertical-align: top;
}}

tr:hover {{
  background: rgba(255, 255, 255, 0.02);
}}

/* Images & Carousels */
.img-wrapper {{
  margin: 24px 0;
  text-align: center;
}}

.img-wrapper img, .carousel-item img {{
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}}

.carousel-grid {{
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin: 24px 0;
}}

.carousel-item {{
  background: var(--bg-card-sub);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 12px;
  text-align: center;
}}

.img-caption {{
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 8px;
  font-style: italic;
}}

hr.divider {{
  border: 0;
  height: 1px;
  background: var(--border-color);
  margin: 28px 0;
}}

/* Mermaid Wrapper */
.mermaid-box {{
  background: var(--bg-card-sub);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 24px 20px;
  margin: 24px 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  text-align: center;
}}

.mermaid-box .mermaid {{
  display: inline-block;
  text-align: left;
  min-width: min-content;
}}

.mermaid-box svg {{
  display: inline-block;
  height: auto !important;
  max-width: none !important;
}}

.mermaid-box .nodeLabel, 
.mermaid-box .label,
.mermaid-box .cluster-label {{
  font-family: 'IBM Plex Sans KR', sans-serif !important;
  font-size: 14.5px !important;
  line-height: 1.5 !important;
}}

/* Bottom Chapter Footer Navigation */
.chapter-footer-nav {{
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  padding: 20px 24px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
}}

/* Right AI Panel */
.right-ai-panel {{
  width: var(--ai-panel-w);
  background: var(--bg-card);
  border-left: 1px solid var(--border-color);
  position: fixed;
  top: var(--header-h);
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  z-index: 900;
  transition: transform 0.3s ease;
  transform: translateX(0);
}}

.right-ai-panel.closed {{
  transform: translateX(100%) !important;
}}

.ai-header {{
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-card-sub);
  display: flex;
  align-items: center;
  justify-content: space-between;
}}

.ai-header-title h3 {{
  font-size: 15px;
  font-weight: 700;
  color: var(--accent-purple);
  display: flex;
  align-items: center;
  gap: 8px;
}}

.ai-header-title p {{
  font-size: 11.5px;
  color: var(--text-muted);
  margin-top: 2px;
}}

.ai-close-btn {{
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 15px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  line-height: 1;
  transition: all 0.2s;
}}

.ai-close-btn:hover {{
  color: var(--accent-red);
  border-color: var(--accent-red);
  background: rgba(239, 68, 68, 0.1);
}}

.ai-body {{
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}}

.prompt-card {{
  background: var(--bg-card-sub);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s;
}}

.prompt-card:hover {{
  border-color: var(--accent-purple);
  transform: translateY(-2px);
}}

.prompt-card h5 {{
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 4px;
}}

.prompt-card p {{
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}}

.ai-chat-output {{
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 14px;
  font-size: 13px;
  color: var(--text-sub);
  min-height: 160px;
  white-space: pre-wrap;
  line-height: 1.6;
}}

.ai-footer {{
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-card-sub);
  display: flex;
  gap: 8px;
}}

.ai-input {{
  flex: 1;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-main);
  padding: 8px 12px;
  font-size: 13px;
  font-family: inherit;
}}

.btn-send {{
  background: var(--accent-purple);
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}}

.btn-send:hover {{
  opacity: 0.9;
}}

@media (max-width: 1200px) {{
  .right-ai-panel {{
    transform: translateX(100%);
    box-shadow: -5px 0 25px rgba(0, 0, 0, 0.5);
  }}
  .right-ai-panel.open {{
    transform: translateX(0) !important;
  }}
  .main-content {{
    margin-right: 0;
  }}
}}

@media (max-width: 900px) {{
  .left-sidebar {{
    transform: translateX(-100%);
  }}
  .left-sidebar.open {{
    transform: translateX(0);
  }}
  .main-content {{
    margin-left: 0;
    padding: 24px 20px;
  }}
  .header-logo-badge, .chapter-pager, .btn-bilingual .label-text {{
    display: none;
  }}
}}
    </style>
</head>
<body>

<header class="app-header">
  <div class="header-left">
    <a href="index.html" class="btn-home" title="포털 메인으로 돌아가기">🏠 포털 메인</a>
    <button class="btn-icon" id="toggle-sidebar-btn" title="목차 토글">☰ 목차</button>
    <span class="header-logo-badge">Chapter {ch_num}</span>
    <div class="header-title-box">
      <h1>{title_ko}</h1>
      <p>{title_en}</p>
    </div>
  </div>
  <div class="header-actions">
    <div class="chapter-pager">
      {prev_btn}
      {next_btn}
    </div>
    <a href="chapter{ch_num}_bilingual.html" class="btn-bilingual" title="1:1 영·한 대조 리더 열기">🌐 <span class="label-text">대조 리더</span></a>
    <button class="btn-icon" id="toggle-theme-btn" title="테마 전환">🌓 테마</button>
    <button class="btn-icon" id="toggle-ai-btn" title="AI 튜터 패널 열기/닫기">🤖 AI 튜터</button>
  </div>
</header>

<div class="app-wrapper">

  <!-- Left Sidebar Navigation -->
  <aside class="left-sidebar" id="left-sidebar">
    <a href="index.html" class="sidebar-portal-link">
      <span>← 전체 챕터 포털</span>
      <span>index.html</span>
    </a>
    <div class="sidebar-title">Chapter {ch_num} 목차 네비게이션</div>
    <input type="text" class="nav-search" id="nav-search-input" placeholder="섹션 빠른 검색...">
    <ul class="nav-menu" id="nav-menu-list">
      {nav_menu_items}
    </ul>
  </aside>

  <!-- Main Content -->
  <main class="main-content">
    
    <!-- Intro Hero -->
    <div class="intro-hero">
      <span class="hero-tag">{part_info}</span>
      <h1>Chapter {ch_num}. {title_ko}</h1>
      <p class="lead">{title_en}</p>
      
      {overview_img_tag}

      <div class="epigraph-box">
        "{epigraph_text}"
        <span class="epigraph-author">— {epigraph_author}</span>
      </div>
    </div>

    <!-- Subnote Sections -->
    {sections_html}

    <!-- Bottom Navigation -->
    <div class="chapter-footer-nav">
      <a href="index.html" class="btn-home">🏠 포털 메인으로 돌아가기</a>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        {prev_btn}
        <a href="chapter{ch_num}_bilingual.html" class="btn-bilingual">🌐 1:1 영·한 대조 리더</a>
        {next_btn}
      </div>
    </div>

  </main>

  <!-- Right AI Panel -->
  <aside class="right-ai-panel" id="right-ai-panel">
    <div class="ai-header">
      <div class="ai-header-title">
        <h3>🤖 AI 안전문화 튜터 &amp; KPI 검증기</h3>
        <p>교수님 심화 지도 원칙 실시간 질의기</p>
      </div>
      <button class="ai-close-btn" id="close-ai-panel-btn" title="AI 패널 닫기">✕</button>
    </div>
    
    <div class="ai-body">
      <div class="sidebar-title">추천 프롬프트 템플릿</div>
      {prompt_cards}
      <div class="ai-chat-output" id="ai-chat-output">💡 프롬프트 카드를 클릭하거나 아래 입력창에 질문을 입력하여 AI 튜터와 학습을 진행하세요. (브라우저 로컬 환경에서 시뮬레이션 프롬프트가 설정됩니다.)</div>
    </div>

    <div class="ai-footer">
      <input type="text" class="ai-input" id="ai-user-input" placeholder="안전문화 및 KPI 질문 입력...">
      <button class="btn-send" id="ai-send-btn">전송</button>
    </div>
  </aside>

</div>

<script>
// Restore saved theme
(function() {{
  try {{
    const saved = localStorage.getItem('subnote-theme');
    if (saved === 'light' || saved === 'dark') {{
      document.documentElement.setAttribute('data-theme', saved);
    }}
  }} catch (e) {{}}
}})();

// Sidebar Toggle
const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
const leftSidebar = document.getElementById('left-sidebar');
if (toggleSidebarBtn && leftSidebar) {{
  toggleSidebarBtn.addEventListener('click', () => {{
    leftSidebar.classList.toggle('open');
  }});
}}

// AI Panel Toggle (Desktop & Mobile)
const toggleAiBtn = document.getElementById('toggle-ai-btn');
const rightAiPanel = document.getElementById('right-ai-panel');
const closeAiPanelBtn = document.getElementById('close-ai-panel-btn');

function toggleAiPanel() {{
  const isMobile = window.innerWidth <= 1200;
  if (isMobile) {{
    rightAiPanel.classList.toggle('open');
  }} else {{
    const isClosed = rightAiPanel.classList.toggle('closed');
    document.body.classList.toggle('ai-closed', isClosed);
  }}
}}

if (toggleAiBtn) toggleAiBtn.addEventListener('click', toggleAiPanel);
if (closeAiPanelBtn) closeAiPanelBtn.addEventListener('click', toggleAiPanel);

// Theme Toggle
const toggleThemeBtn = document.getElementById('toggle-theme-btn');
if (toggleThemeBtn) {{
  toggleThemeBtn.addEventListener('click', () => {{
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    try {{ localStorage.setItem('subnote-theme', newTheme); }} catch (e) {{}}
  }});
}}

// Nav Search Filter
const navSearchInput = document.getElementById('nav-search-input');
const navMenuList = document.getElementById('nav-menu-list');
if (navSearchInput && navMenuList) {{
  navSearchInput.addEventListener('input', (e) => {{
    const query = e.target.value.toLowerCase();
    const links = navMenuList.querySelectorAll('li');
    links.forEach(li => {{
      const text = li.textContent.toLowerCase();
      li.style.display = text.includes(query) ? '' : 'none';
    }});
  }});
}}

// Quick Prompt Set
function setPrompt(text) {{
  document.getElementById('ai-user-input').value = text;
  document.getElementById('ai-chat-output').textContent =
    "질문 입력됨: " + text + "\\n\\n[AI 튜터 시뮬레이션 응답]\\n교수님 심화 지도 원칙에 따라 법령 조문, 5단계 생애주기, 고유/협업 가중치(7:3/5:5) 및 서브노트 판단 근거가 매핑되었습니다.";
}}

const aiSendBtn = document.getElementById('ai-send-btn');
if (aiSendBtn) {{
  aiSendBtn.addEventListener('click', () => {{
    const input = document.getElementById('ai-user-input');
    if (input.value.trim()) {{
      setPrompt(input.value.trim());
      input.value = '';
    }}
  }});
}}
</script>

</body>
</html>
"""


CHAPTERS = [
    {
        "ch_num": 1,
        "title_en": "Defining the Perception of Safety",
        "title_ko": "안전에 대한 지각의 정의",
        "part_info": "PART I Laying the Foundation",
        "epigraph_text": "조직문화는 대단히 중요하다. 경영진이 구성원을 대우하기로 선택하는 방식은—좋든 나쁘든—모든 것에 직접적인 영향을 미친다.",
        "epigraph_author": "사이먼 시넥 (Simon Sinek)",
        "overview_img": "",
        "prompts": [
            {"title": "🧭 안전의 지각(Perception)과 브랜드 재정립", "desc": "안전 전문가가 '변화의 반대자'에서 '조력자'로 지각을 전환하는 전략", "query": "제1장의 안전 브랜드 개념과 동적 조직 vs 정적 안전 프로세스의 충돌을 바탕으로, 안전에 대한 지각을 개선하는 KPI를 도출해줘."},
            {"title": "⏱️ Covey 4사분면과 시간 관리", "desc": "제2사분면(중요하지만 긴급하지 않은 예방 활동) 투자 전략", "query": "제1장의 시간 관리 매트릭스를 119구조대 일상 예방·점검 업무에 적용하는 방안을 설명해줘."},
            {"title": "🧩 창발적 특성(Emergent Property) 분석", "desc": "안전이 다학제적 통제 요소 간 상호작용에서 발현되는 메커니즘", "query": "안전이 조직 시스템의 창발적 특성이라는 관점이 기존 사후 처방 중심 안전관리와 어떻게 다른지 설명해줘."}
        ]
    },
    {
        "ch_num": 2,
        "title_en": "Analyzing the Organizational Culture",
        "title_ko": "조직문화 분석",
        "part_info": "PART I Laying the Foundation",
        "epigraph_text": "문화적 유산은 대단히 강력한 힘이다. 그것은 깊은 뿌리와 긴 수명을 가지고 있으며, 세대를 거듭하며 거의 온전하게 지속된다.",
        "epigraph_author": "맬컴 글래드웰 (Malcolm Gladwell, 2008)",
        "overview_img": "",
        "prompts": [
            {"title": "🏛️ 에드가 샤인 문화 3층위 진단", "desc": "인공물(Artifacts) · 표방 가치 · 기본 가정의 괴리 분석", "query": "제2장의 에드가 샤인 문화 3층위 모델을 활용해 현장 안전문화의 표방 가치와 실제 행동 간 갭을 진단하는 지표를 설계해줘."},
            {"title": "🔄 의미구성(Sensemaking)과 안전문화", "desc": "구성원이 위험 신호와 조직 규범을 해석하는 과정", "query": "조직문화 분석에서 의미구성(Sensemaking)과 하위문화(Subculture)가 안전 성과에 미치는 영향을 설명해줘."},
            {"title": "🚒 119구조대 조직문화 진단 KPI", "desc": "현장 대원의 안전문화 지각 측정 지표 도출", "query": "제2장 내용을 기반으로 119구조대 현장 안전문화 진단 KPI와 관련 법령 조문을 매핑해줘."}
        ]
    },
    {
        "ch_num": 3,
        "title_en": "Analyzing and Using Your Network",
        "title_ko": "네트워크 분석 및 활용",
        "part_info": "PART I Laying the Foundation",
        "epigraph_text": "우리는 외딴 섬이 아니다. 사람과 사람 사이에 맺어진 사회적 연결망은 개인의 지각과 행동을 지배하며, 우리의 안전 신념은 3단계 영향력 법칙을 통해 조직 전체로 번져나간다.",
        "epigraph_author": "니콜라스 크리스타키스 & 제임스 파울러 (2009)",
        "overview_img": "",
        "prompts": [
            {"title": "🕸️ 사회적 연결망과 3단계 영향력 법칙", "desc": "안전 밈(Meme) 전파와 네트워크 중심성(Centrality) 활용", "query": "제3장의 네트워크 분석과 3단계 영향력 법칙을 바탕으로 조직 내 안전 정보 확산 네트워크 성과를 측정하는 방법을 설명해줘."},
            {"title": "📡 비공식 소통 네트워크와 사일로 타파", "desc": "부서 간 경계를 넘는 연결 허브(Broker) 역할 설계", "query": "안전 전문가가 비공식 네트워크 허브를 식별하고 협업 지표(협업 30%/50%)로 연계하는 방안을 제시해줘."},
            {"title": "💬 안전 밈(Meme)과 정신 모델", "desc": "긍정적 안전 규범의 바이럴 확산 메커니즘", "query": "안전 밈(Meme)이 현장의 위험 지각과 안전문화 정착에 미치는 긍정적·부정적 경로를 분석해줘."}
        ]
    },
    {
        "ch_num": 4,
        "title_en": "Establishing the Direction for the Safety Culture",
        "title_ko": "안전문화를 위한 방향 설정",
        "part_info": "PART II Safety Management Systems Defined",
        "epigraph_text": "계획 없는 목표는 단지 바람에 불과하다 (A goal without a plan is just a wish).",
        "epigraph_author": "앙투안 드 생텍쥐페리 (Antoine de Saint-Exupéry)",
        "overview_img": "",
        "prompts": [
            {"title": "🎯 SMART 목표 및 비전·미션 정렬", "desc": "안전보건 정책과 측정 가능한 SMART 목표의 연계", "query": "제4장의 비전·미션·SMART 목표 설정 원리를 119구조대 안전관리 계획 KPI로 구체화해줘."},
            {"title": "📉 범위 표류(Scope Drift) 통제 전략", "desc": "시간 경과에 따른 기준 이완과 규범적 표류 예방", "query": "제4장에서 경고하는 범위 표류(Scope Drift)를 조기에 감지하기 위한 선행지표를 제안해줘."},
            {"title": "⚖️ 안전 목표의 다차원적 성과 평가", "desc": "후행 재해율 중심 목표에서 과정·예방 중심으로의 전환", "query": "산안법 제14조 및 중처법 시행령 제4조와 연계하여 제4장의 안전문화 방향 설정 KPI를 검증해줘."}
        ]
    },
    {
        "ch_num": 5,
        "title_en": "Overview of Basic Safety Management Systems",
        "title_ko": "기본 안전경영시스템의 개요",
        "part_info": "PART II Safety Management Systems Defined",
        "epigraph_text": "경영(Management)이란 일을 올바르게 하는 것이고, 리더십(Leadership)이란 올바른 일을 하는 것이다.",
        "epigraph_author": "피터 드러커 (Peter Drucker)",
        "overview_img": "",
        "prompts": [
            {"title": "🏗️ SMS 6대 핵심 원칙 기능 구조", "desc": "경영 리더십·근로자 참여·위험식별·통제·교육·효과성 평가", "query": "제5장의 SMS 6대 핵심 원칙을 안전관리 플랫폼의 대시보드 모듈로 어떻게 매핑할 수 있는지 설명해줘."},
            {"title": "🔄 PDCA 사이클과 ANSI Z10 통합", "desc": "표준 경영시스템의 지속적 개선 루프 구축", "query": "ANSI Z10과 OSHA SMS 지침이 제5장에서 어떻게 통합되어 현장 실행 체계를 이루는지 분석해줘."},
            {"title": "🚒 소방 현장 SMS 적용 KPI", "desc": "SMS 6대 요소별 119구조대 고유/협업 지표 설계", "query": "제5장의 6대 핵심 원칙을 근거로 119구조대 안전경영시스템 성숙도 KPI를 도출해줘."}
        ]
    },
    {
        "ch_num": 6,
        "title_en": "Creating the Safety Process",
        "title_ko": "안전 프로세스 구축",
        "part_info": "PART II Safety Management Systems Defined",
        "epigraph_text": "시스템을 관리하려면 시스템 내부의 모든 구성 요소 간의 상호관계와 그 안에서 일하는 모든 사람에 대한 깊은 이해가 필요하다.",
        "epigraph_author": "W. 에드워즈 데밍 (W. Edwards Deming)",
        "overview_img": "",
        "prompts": [
            {"title": "⚙️ 프로세스 관점 vs 프로그램 관점", "desc": "단발성 안전 캠페인과 상시 작동 안전 프로세스의 차이", "query": "제6장의 '프로그램이 아닌 프로세스' 철학을 안전관리 플랫폼 워크플로우에 반영하는 방법을 설명해줘."},
            {"title": "📊 식스시그마 DMAIC & 칸반 도구", "desc": "부록 6.5의 프로세스 도구를 활용한 위험 통제 개선", "query": "제6장의 DMAIC 및 프로세스 맵핑 도구를 활용해 현장 아차사고 처리 프로세스를 개선하는 방안을 제시해줘."},
            {"title": "⚖️ 데밍의 시스템 사고와 법령 연계", "desc": "프로세스 변동성 축소와 산안법·중처법 안전보건관리체계", "query": "제6장 프로세스 구축 원리를 중대재해처벌법 시행령 제4조 요구사항과 매핑해줘."}
        ]
    },
    {
        "ch_num": 7,
        "title_en": "Evaluating Leadership and the Safety Culture",
        "title_ko": "리더십과 안전문화 평가",
        "part_info": "PART II Safety Management Systems Defined",
        "epigraph_text": "문화와 리더십은 동전의 양면이다. 리더가 그룹과 조직을 만들 때 먼저 문화를 창조하고, 일단 문화가 존재하게 되면 그 문화가 리더십의 기준을 규정한다.",
        "epigraph_author": "에드가 샤인 (Edgar Schein, 2016)",
        "overview_img": "image.png",
        "prompts": [
            {"title": "🔺 RAA 삼원조(책임·권한·책무성) 균형", "desc": "하향 위임(권한)과 상향 해명(책무성), 최종 책임의 불전가 원칙", "query": "제7장의 RAA(Responsibility-Authority-Accountability) 삼원조 구조가 무너질 때 발생하는 안전 책무성 붕괴 메커니즘을 설명해줘."},
            {"title": "🚒 119구조대 안전책무성 KPI (7:3)", "desc": "산안법 제14~16조·중처법 연계 현장 밀착형 성과지표", "query": "제7장의 RAA 삼원조를 근거로 119구조대장·팀장·대원별 고유(70%)/협업(30%) KPI를 도출해줘."},
            {"title": "⚖️ 관리자 vs 리더 역할 전환", "desc": "환원주의적 관리와 전체론적(Holistic) 안전 리더십의 조화", "query": "제7장에서 제시한 관리자와 리더의 역할 차이가 현장 안전문화 평가에 미치는 시사점을 분석해줘."}
        ]
    },
    {
        "ch_num": 8,
        "title_en": "Getting Employee Involvement in the Safety Management System",
        "title_ko": "안전경영시스템에서 직원 참여 유도",
        "part_info": "PART III How to Handle the Perception of Risk",
        "epigraph_text": "훌륭한 인재로 시작하라. 규칙을 명확히 제시하라. 직원들과 소통하라. 그들에게 동기를 부여하고 보상하라. 이 모든 것을 효과적으로 수행한다면 결코 실패하지 않을 것이다.",
        "epigraph_author": "리 아이아코카 (Lee Iacocca)",
        "overview_img": "",
        "prompts": [
            {"title": "🤝 현장 직원 참여 장애 요인 해소", "desc": "경영진-현장 작업 방식 괴리와 참여 회피 원인 분석", "query": "제8장에서 분석한 근로자가 안전 프로세스 참여를 꺼리는 원인과 이를 극복하는 KPI를 설계해줘."},
            {"title": "🏛️ 안전위원회 & Ad Hoc 분과 운영", "desc": "상설 분과위원회와 특별 임무팀(Ad Hoc)의 역할 분담", "query": "산안법 제24조(산업안전보건위원회)와 제8장의 상설/특별 분과위원회 운영 원리를 연계해 설명해줘."},
            {"title": "🗣️ 현장 통찰 수집 및 3방향 피드백", "desc": "현장 작업자의 잠재 위험 보고 활성화를 위한 제도적 장치", "query": "제8장을 기반으로 현장 직원의 위험 보고율을 높이는 비처벌적 참여 메커니즘을 제안해줘."}
        ]
    },
    {
        "ch_num": 9,
        "title_en": "Defining Risk Perception",
        "title_ko": "위험 지각의 정의",
        "part_info": "PART III How to Handle the Perception of Risk",
        "epigraph_text": "당신은 아는 것만을 본다 (You only see what you know).",
        "epigraph_author": "알베르트 아인슈타인 (Albert Einstein)",
        "overview_img": "",
        "prompts": [
            {"title": "👁️ 위험 지각(Risk Perception) 편향 극복", "desc": "위험 항상성(Risk Homeostasis), 정규화된 일탈, 인지적 맹점 분석", "query": "제9장의 위험 지각 이론과 '아는 것만 보인다'는 명제가 현장 대원의 위험 간과에 미치는 영향을 설명해줘."},
            {"title": "🃏 위험 지침 카드(Risk Guidance Cards)", "desc": "직무 현장 즉시 활용 가능한 시각적 위험 소통 도구", "query": "제9장의 위험 지침 카드를 119구조대 출동 전/현장 TBM 플랫폼 기능으로 구현하는 방안을 제시해줘."},
            {"title": "📊 주관적 위험 지각 vs 객관적 리스크", "desc": "계층별 위험 지각 격차 측정 및 Q방법론 연계", "query": "제9장 위험 지각 개념을 활용해 관리자-현장 대원 간 위험 인식 격차를 측정하는 연구 설계를 제안해줘."}
        ]
    },
    {
        "ch_num": 10,
        "title_en": "Understanding Basic Risk Management Principles",
        "title_ko": "기본 위험관리 원칙의 이해",
        "part_info": "PART III How to Handle the Perception of Risk",
        "epigraph_text": "위험관리의 본질은 우리가 결과에 대해 어느 정도 통제력을 가진 영역을 극대화하는 동시에, 결과에 대해 통제력이 없고 원인과 결과의 연계가 은폐되어 있는 영역을 최소화하는 데 있다.",
        "epigraph_author": "피터 번스타인 (Peter L. Bernstein, 1996)",
        "overview_img": "",
        "prompts": [
            {"title": "🛡️ 통제 위계(Hierarchy of Controls)", "desc": "제거-대체-공학적 통제-관리적 통제-PPE 우선순위", "query": "제10장의 통제 위계 원리를 산안법 제36조 위험성평가 감소대책 수립 프로세스와 매핑해줘."},
            {"title": "📉 ALARP 및 리스크 매트릭스 적용", "desc": "발생 빈도와 심각도 기반 합리적 실행 가능 수준 관리", "query": "제10장의 위험관리 8단계 순서도를 안전관리 플랫폼의 위험성평가 워크플로우로 구현하는 방안을 설명해줘."},
            {"title": "🔍 백미러 편향과 선제적 리스크 통제", "desc": "사후 원인 찾기(Hindsight)를 넘어선 사전 위험 통제", "query": "워런 버핏의 '백미러' 인용이 제10장의 예방적 위험관리 KPI 설계에 주는 시사점을 분석해줘."}
        ]
    },
    {
        "ch_num": 11,
        "title_en": "Developing an Activity-Based Safety System",
        "title_ko": "활동 기반 안전시스템 구축",
        "part_info": "PART IV Tools to Enhance Your Safety Management System",
        "epigraph_text": "변화 없이는 진보가 불가능하며, 자신의 생각을 바꾸지 못하는 사람은 그 어떤 것도 바꿀 수 없다.",
        "epigraph_author": "조지 버나드 쇼 (George Bernard Shaw)",
        "overview_img": "",
        "prompts": [
            {"title": "🚒 현장 소방/구조대 맞춤형 ABSS KPI 도출", "desc": "119구조대 조직 특성 반영 및 고유/협업 7:3 가중치 배분 검증", "query": "ABSS 5단계 생애주기에 맞춰 의령소방서 119구조대에 적용할 수 있는 현장 밀착형 KPI 3가지를 도출하고, 산업안전보건법 조문과 7:3 가중치 배분 논리를 설명해줘."},
            {"title": "🏥 Can Do 서식과 산재 조기복귀 효과", "desc": "포괄적 휴업 배제 및 Transitional Duty의 의학적·경영학적 의의", "query": "Chapter 11의 인체공학적 위험도 평가 공식(난이도×빈도)과 Grab N Go Kit의 Can Do 서식이 실제 근골격계 질환 산재 예방에 어떻게 기여하는지 학술적으로 분석해줘."},
            {"title": "🧠 인지과학 시각 학습과 반복 상호작용", "desc": "Medina의 시각 우위 법칙과 일일 TBM의 뇌인지적 결합", "query": "식스시그마 실험계획법(DOE)과 블루스 클루스(Blue's Clues) 원리가 안전 교육의 기억 잔존율을 높인 인지과학적 메커니즘을 설명해줘."}
        ]
    },
    {
        "ch_num": 12,
        "title_en": "Using the Job Hazard Analysis",
        "title_ko": "직무 위험성 평가의 활용",
        "part_info": "PART IV Tools to Enhance Your Safety Management System",
        "epigraph_text": "우리는 생산과 별개의 안전 프로그램을 원하거나, 생산과 안전, 혹은 안전을 동반한 생산을 원하는 것이 아닙니다. 우리가 진정으로 원하는 것은 '안전한 생산(Safe Production)' 그 자체입니다.",
        "epigraph_author": "댄 피터슨 (Dan Petersen)",
        "overview_img": "image-129.png",
        "prompts": [
            {"title": "🚒 119구조대 및 화학플랜트 맞춤형 JHA KPI 도출", "desc": "JHA 5단계 생애주기 기반 소방/플랜트 고유/협업 7:3 가중치 및 산안법 제36조 매핑", "query": "JHA 5단계 생애주기에 맞춰 의령소방서 119구조대 및 화학 플랜트에 적용할 수 있는 현장 밀착형 KPI 3가지를 도출하고, 산업안전보건법 제36조 및 중처법 시행령 제4조 연계 논리를 설명해줘."},
            {"title": "🔪 칼날 안전 식스시그마와 전면 금지의 실패", "desc": "일방적 하향식 규제의 역효과와 JHA 근로자 참여 성과 분석", "query": "제12장 실전 사례인 칼날 안전 식스시그마 프로젝트에서 일방적 전면 금지 규제가 실패하고, JHA에 근로자를 참여시켜 도구 포트폴리오를 제공했을 때 사고가 근절된 조직문화적 원인을 분석해줘."},
            {"title": "🧠 라스무센 SRK 모델과 HPI 4대 오류 전조 요건", "desc": "숙련·규칙·지식 기반 수행과 과업/개인/환경/본성 오류 전조 요건의 JHA 통합", "query": "라스무센(Rasmussen)의 SRK 모델과 DOE HPI의 4대 오류 전조 요건이 JHA 프로세스에서 어떻게 잠재적 위험을 선제 통제하는지 학술적으로 논증해줘."}
        ]
    },
    {
        "ch_num": 13,
        "title_en": "Developing Safety Training Needs",
        "title_ko": "안전 교육훈련 니즈 개발",
        "part_info": "PART IV Tools to Enhance Your Safety Management System",
        "epigraph_text": "자신이 가르쳐야만 하는 상황에 직면한 사람만큼 어떤 주제에 대해 깊이 배우는 사람은 없다.",
        "epigraph_author": "피터 드러커 (Peter F. Drucker)",
        "overview_img": "image-162.png",
        "prompts": [
            {"title": "🚒 119구조대 및 화학운전반 교육훈련 KPI 도출", "desc": "교육훈련 5단계 생애주기 기반 산안법 제29조 및 실습(Hands-on) 지표 매핑", "query": "교육훈련 5단계 생애주기에 맞춰 119구조대 및 화학운전반에 적용할 수 있는 현장 밀착형 KPI 3가지를 도출하고, 산업안전보건법 제29조 및 중처법 시행령 제4조제5호 연계 논리를 설명해줘."},
            {"title": "🚫 Mager 의사결정 트리와 '재교육 남발' 차단", "desc": "숙련 기반 무의식 실수에 대한 재교육의 무용성과 비훈련 대안", "query": "로버트 메이거(Robert Mager)의 수행 결함 의사결정 트리와 DOE HPI 핸드북을 근거로, 사고 조사 시 '작업자 재교육'을 남발하는 행태가 왜 조직문화를 저해하는지 학술적으로 분석해줘."},
            {"title": "🗣️ LOTO 참사 방지를 위한 3방향 소통 훈련", "desc": "구두 지시 오해 참사와 패러프레이징 복명복창 프로토콜 구축", "query": "제13장의 LOTO 미실시 및 구두 소통 오해 중대재해 사례를 바탕으로, 3방향 소통(Three-way Communication) 프로토콜을 현장 TBM에 체질화하는 구체적 방안을 설명해줘."}
        ]
    },
    {
        "ch_num": 14,
        "title_en": "Assessing Your Safety Management System",
        "title_ko": "안전경영시스템 평가",
        "part_info": "PART IV Tools to Enhance Your Safety Management System",
        "epigraph_text": "목표에 도달하고 싶다면, 그곳에 도달하기 전에 마음속에서 먼저 '도달하는 모습'을 그려보아야 한다.",
        "epigraph_author": "지그 지글러 (Zig Ziglar)",
        "overview_img": "image-173.png",
        "prompts": [
            {"title": "🚒 119구조대 및 화학플랜트 SMS 평가 KPI 도출", "desc": "SMS 평가 5단계 생애주기 기반 고유/협업 지표 및 산안법 제14조·제36조 매핑", "query": "SMS 평가 5단계 생애주기에 맞춰 의령소방서 119구조대 및 화학 플랜트에 적용할 수 있는 현장 밀착형 KPI 3가지를 도출하고, 산업안전보건법 제14조, 제36조 및 중처법 시행령 제4조 연계 논리를 설명해줘."},
            {"title": "🪞 거울 비유와 '시스템 탓하기' 극복", "desc": "성과 미흡 시 시스템을 갈아엎는 악순환 타파와 결함 수리 메커니즘", "query": "제14장의 핵심 은유인 '거울 비유'와 '시스템 탓하기(Blaming the System)' 심리를 극복하기 위해, 식스시그마의 결함(Defect) 개념과 월별 1개 요소 점검 방식이 어떻게 조직문화를 혁신하는지 분석해줘."},
            {"title": "🔍 내부 자체 평가와 외부 제3자 평가의 융합", "desc": "현장 잠재 취약점 발굴과 조직적 맹점 교정의 상호보완적 감사 설계", "query": "DOE HPI 핸드북에 근거하여, 현장 작업자 중심의 내부 자체 평가와 외부 전문가의 제3자 독립 평가가 어떻게 상호보완하여 조직의 맹점과 규범적 표류를 교정하는지 논증해줘."}
        ]
    },
    {
        "ch_num": 15,
        "title_en": "Curating for the Safety Management System",
        "title_ko": "안전경영시스템을 위한 정보 큐레이션",
        "part_info": "PART V Curation Resources",
        "epigraph_text": "데이터는 소중한 자산이며, 시스템 그 자체보다 더 오래 지속된다.",
        "epigraph_author": "팀 버너스리 (Tim Berners-Lee, 2018)",
        "overview_img": "image-185.png",
        "prompts": [
            {"title": "🚒 119구조대 SMS 정보 큐레이션 5단계 KPI 도출", "desc": "큐레이션 생애주기 5단계 기반 고유/협업 지표 및 산안법 제164조·중처법 시행령 제13조 매핑", "query": "제15장의 정보 큐레이션 생애주기 5단계(수요진단-수집선별-분류저장-검증최신화-공유환류)에 맞춰 119구조대 및 현장 안전부서에 적용할 수 있는 고유/협업 KPI를 도출하고, 산업안전보건법 제164조 및 중대재해처벌법 시행령 제13조 연계 근거를 설명해줘."},
            {"title": "📚 Curry & O'Riáin 7대 품질 차원과 5S 보존", "desc": "정보 홍수 속 가짜 정보 필터링과 부서 간 안전 문서 사일로 해소", "query": "제15장에 제시된 Curry & O'Riáin(2010)의 7대 데이터 품질 차원과 5S 정리정돈 원칙이 관찰 사례 1·2의 문제를 어떻게 해결하여 조직의 기억을 보존하는지 설명해줘."},
            {"title": "🧭 FIG. 15.4 문헌 연구 순서도와 RDM 워크플로우", "desc": "교재 순서도와 에든버러 RDM 2단계 체크리스트의 플랫폼 구현", "query": "제15장의 그림 15.4(문헌 연구 계획 순서도)의 분기 구조와 에든버러 대학교 연구 데이터 관리(RDM) 2단계 체크리스트를 안전관리 플랫폼의 문서·지식 큐레이션 워크플로우로 어떻게 매핑할 수 있는지 설명해줘."}
        ]
    },
    {
        "ch_num": 16,
        "title_en": "Developing a Content Creation Strategy",
        "title_ko": "콘텐츠 제작 전략 개발",
        "part_info": "PART V Curation Resources",
        "epigraph_text": "데이터가 없다면, 당신은 그저 의견을 가진 또 한 사람일 뿐이다.",
        "epigraph_author": "W. 에드워즈 데밍 (W. Edwards Deming)",
        "overview_img": "image-190.png",
        "prompts": [
            {"title": "🚒 119구조대 콘텐츠 제작 전략 5단계 KPI 도출", "desc": "Input-Process-Output 모델 및 5단계 생애주기 기반 산안법 제29조·제164조 매핑", "query": "제16장의 투입-처리-산출(Input-Process-Output) 모델과 5단계 생애주기에 맞춰 119구조대 및 안전관리부서에 적용할 수 있는 고유/협업 KPI를 도출하고, 산업안전보건법 제29조·제164조 연계 근거를 설명해줘."},
            {"title": "🛡️ Tribal Knowledge의 공식화 및 SME 10,000시간", "desc": "현장 암묵지의 문서화와 공인안전전문가(CSP) 10,000시간·4대 역할 연계", "query": "제16장에서 제시한 부족 지식(Tribal knowledge)을 어떻게 큐레이션된 추천과 해설자 역할로 공식화할 수 있는지, 그리고 Gladwell의 10,000시간 법칙 및 Crossfield의 출처 검증 원칙과의 관계를 설명해줘."},
            {"title": "🔄 FIG. 16.1 협업 인용 순서도 & FIG. 16.2 Feedly IPO", "desc": "클라우드·JabRef/Docear 인용 검증 루프와 RSS·Feedly 플랫폼 설계", "query": "제16장의 그림 16.1(문헌 수집·인용 협업 순서도)의 Proper Reference 검증 분기와 그림 16.2(Feedly IPO 모델) 및 표 16.3의 안전 RSS 피드를 안전관리 플랫폼의 지식 수집·검증 워크플로우로 어떻게 구현할 수 있는지 설명해줘."}
        ]
    },
]


def build_chapter(cfg, base_dir):
    ch_num = cfg["ch_num"]
    md_file = os.path.join(base_dir, f"chapter{ch_num}-subnote.md")
    out_file = os.path.join(base_dir, f"chapter{ch_num}_subnote.html")

    with open(md_file, 'r', encoding='utf-8') as f:
        md_text = f.read()

    sections_html = parse_markdown_to_html(md_text)
    nav_links = build_nav_links(md_text)
    nav_menu_items = '\n'.join([f'<li><a href="#{link_id}" class="nav-link">{html_lib.escape(title)}</a></li>' for link_id, title in nav_links])

    prompt_cards = []
    for p in cfg["prompts"]:
        q_js = json.dumps(p["query"], ensure_ascii=False)
        q_attr = html_lib.escape(f"setPrompt({q_js})", quote=True)
        card = f'''<div class="prompt-card" onclick="{q_attr}">
  <h5>{html_lib.escape(p["title"])}</h5>
  <p>{html_lib.escape(p["desc"])}</p>
</div>'''
        prompt_cards.append(card)
    prompt_cards_html = '\n'.join(prompt_cards)

    overview_img = cfg["overview_img"]
    overview_img_tag = (
        f'<img src="{overview_img}" alt="Chapter {ch_num} Overview" class="hero-overview-img">'
        if overview_img
        else ''
    )

    prev_btn = (
        f'<a href="chapter{ch_num - 1}_subnote.html" class="btn-icon" title="이전 장 서브노트">◀ Ch{ch_num - 1}</a>'
        if ch_num > 1
        else ''
    )
    next_btn = (
        f'<a href="chapter{ch_num + 1}_subnote.html" class="btn-icon" title="다음 장 서브노트">Ch{ch_num + 1} ▶</a>'
        if ch_num < 16
        else ''
    )

    full_html = HTML_TEMPLATE.format(
        ch_num=ch_num,
        title_en=html_lib.escape(cfg["title_en"]),
        title_ko=html_lib.escape(cfg["title_ko"]),
        part_info=html_lib.escape(cfg["part_info"]),
        epigraph_text=html_lib.escape(cfg["epigraph_text"]),
        epigraph_author=html_lib.escape(cfg["epigraph_author"]),
        overview_img_tag=overview_img_tag,
        nav_menu_items=nav_menu_items,
        sections_html=sections_html,
        prompt_cards=prompt_cards_html,
        prev_btn=prev_btn,
        next_btn=next_btn,
    )

    with open(out_file, 'w', encoding='utf-8') as f:
        f.write(full_html)
    return out_file, len(full_html)


if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.abspath(__file__))
    for cfg in CHAPTERS:
        out_path, size = build_chapter(cfg, base_dir)
        print(f"[OK] Ch{cfg['ch_num']:02d}: {os.path.basename(out_path)} ({size:,} bytes)")
