#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Full Subnote HTML Generator with Fixed AI Panel Toggle (Chapters 11, 12, 13, 14)
"""

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
    in_ul = False
    in_ol = False
    in_blockquote = False
    blockquote_lines = []
    in_case = False

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

    def inline_format(text):
        text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
        text = re.sub(r'\*(.+?)\*', r'<em>\1</em>', text)
        text = re.sub(r'\\\((.+?)\\\)', r'<span class="math-inline">\(\1\)</span>', text)
        text = re.sub(r'\$(.+?)\$', r'<span class="math-inline">\(\1\)</span>', text)
        text = re.sub(r'!\[(.*?)\]\((.*?)\)', r'<div class="img-wrapper"><img src="\2" alt="\1"><p class="img-caption">\1</p></div>', text)
        text = re.sub(r'\[(.*?)\]\((.*?)\)', r'<a href="\2" target="_blank">\1</a>', text)
        text = re.sub(r'`(.+?)`', r'<code>\1</code>', text)
        return text

    i = 0
    while i < len(lines):
        line = lines[i]
        trimmed = line.strip()
        if trimmed.startswith('## '):
            break
        i += 1

    first_sec = True
    while i < len(lines):
        line = lines[i]
        trimmed = line.strip()

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
            output.append(f'<pre><code>{os.linesep.join(code_lines)}</code></pre>')
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
                sec_id = f"sec-{re.sub(r'[^a-zA-Z0-9]+', '-', h2_text).strip('-').lower()}"
                output.append(f'{sec_tag}<section class="subnote-section" id="{sec_id}">\n<h2>{inline_format(h2_text)}</h2>')
            i += 1
            continue

        if trimmed.startswith('### '):
            output.append(close_list())
            output.append(close_case())
            h3_text = trimmed[4:].strip()
            if "LESSON LEARNED" in h3_text or "CASE STUDY" in h3_text:
                in_case = True
                output.append(f'<div class="case-box"><span class="case-badge">실전 사례 &amp; 교훈</span><h4>{inline_format(h3_text)}</h4>')
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
        if trimmed.startswith('![') and trimmed.endswith(')'):
            output.append(inline_format(trimmed))
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
    output.append('</section>')

    return '\n'.join(output)

def build_nav_links(md_text):
    nav_links = []
    lines = md_text.split('\n')
    for line in lines:
        trimmed = line.strip()
        if trimmed.startswith('## '):
            h2_text = trimmed[3:].strip()
            badge_m = re.match(r'^(\d+)\.\s*(.*)', h2_text)
            if badge_m:
                sec_num = badge_m.group(1)
                sec_title = badge_m.group(2)
                sec_id = f"sec-{sec_num}"
                short_title = sec_title.split('(')[0].strip()
                if len(short_title) > 30:
                    short_title = short_title[:28] + "..."
                nav_links.append((sec_id, f"{sec_num}. {short_title}"))
            else:
                sec_id = f"sec-{re.sub(r'[^a-zA-Z0-9]+', '-', h2_text).strip('-').lower()}"
                short_title = h2_text.split('(')[0].strip()
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
    <link href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=IBM+Plex+Sans+KR:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <script>
        mermaid.initialize({{
            startOnLoad: true,
            theme: 'dark',
            securityLevel: 'loose',
            fontFamily: 'IBM Plex Sans KR, sans-serif'
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
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 1000;
  transition: all 0.3s ease;
}}

[data-theme="light"] .app-header {{
  background: rgba(255, 255, 255, 0.9);
}}

.header-left {{
  display: flex;
  align-items: center;
  gap: 16px;
}}

.header-logo-badge {{
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}}

.header-title-box h1 {{
  font-size: 17px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.2;
}}

.header-title-box p {{
  font-size: 12px;
  color: var(--text-muted);
}}

.header-actions {{
  display: flex;
  align-items: center;
  gap: 10px;
}}

.btn-icon {{
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-sub);
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  font-family: inherit;
  font-weight: 500;
}}

.btn-icon:hover {{
  background: var(--bg-card-sub);
  color: var(--accent-blue);
  border-color: var(--accent-blue);
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
  padding: 24px 16px;
  position: fixed;
  top: var(--header-h);
  bottom: 0;
  overflow-y: auto;
  transition: transform 0.3s ease;
  z-index: 900;
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

/* AI 패널 닫혔을 때 본문 너비 확장 */
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
  max-height: 380px;
  object-fit: cover;
  border-radius: 12px;
  margin: 16px 0 24px 0;
  border: 1px solid var(--border-color);
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

.callout-gold {{
  background: rgba(245, 158, 11, 0.08);
  border-color: var(--accent-gold);
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

/* Images */
.img-wrapper {{
  margin: 24px 0;
  text-align: center;
}}

.img-wrapper img {{
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
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
  padding: 24px;
  margin: 24px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-x: auto;
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

/* AI 패널 닫힘 클래스 */
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
}}
    </style>
</head>
<body>

<header class="app-header">
  <div class="header-left">
    <button class="btn-icon" id="toggle-sidebar-btn" title="목차 토글">☰ 목차</button>
    <span class="header-logo-badge">안전문화 서브노트</span>
    <div class="header-title-box">
      <h1>Chapter {ch_num}: {title_ko}</h1>
      <p>{title_en}</p>
    </div>
  </div>
  <div class="header-actions">
    <button class="btn-icon" id="toggle-theme-btn" title="테마 전환">🌓 테마</button>
    <button class="btn-icon" id="toggle-ai-btn" title="AI 튜터 패널 열기/닫기">🤖 AI 튜터</button>
  </div>
</header>

<div class="app-wrapper">

  <!-- Left Sidebar Navigation -->
  <aside class="left-sidebar" id="left-sidebar">
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
// Sidebar Toggle
const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
const leftSidebar = document.getElementById('left-sidebar');
toggleSidebarBtn.addEventListener('click', () => {{
  leftSidebar.classList.toggle('open');
}});

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

if (toggleAiBtn) {{
  toggleAiBtn.addEventListener('click', toggleAiPanel);
}}
if (closeAiPanelBtn) {{
  closeAiPanelBtn.addEventListener('click', toggleAiPanel);
}}

// Theme Toggle
const toggleThemeBtn = document.getElementById('toggle-theme-btn');
toggleThemeBtn.addEventListener('click', () => {{
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
}});

// Nav Search Filter
const navSearchInput = document.getElementById('nav-search-input');
const navMenuList = document.getElementById('nav-menu-list');
navSearchInput.addEventListener('input', (e) => {{
  const query = e.target.value.toLowerCase();
  const links = navMenuList.querySelectorAll('li');
  links.forEach(li => {{
    const text = li.textContent.toLowerCase();
    if (text.includes(query)) {{
      li.style.display = '';
    }} else {{
      li.style.display = 'none';
    }}
  }});
}});

// Quick Prompt Set
function setPrompt(text) {{
  document.getElementById('ai-user-input').value = text;
  document.getElementById('ai-chat-output').textContent = "질문 입력됨: " + text + "\\n\\n[AI 튜터 시뮬레이션 응답]\\n교수님 심화 지도 원칙에 따라 법령 조문, 5단계 생애주기, 고유/협업 가중치(7:3/5:5) 및 서브노트 판단 근거가 매핑되었습니다.";
}}

document.getElementById('ai-send-btn').addEventListener('click', () => {{
  const input = document.getElementById('ai-user-input');
  if (input.value.trim()) {{
    setPrompt(input.value.trim());
    input.value = '';
  }}
}});
</script>

</body>
</html>
"""

def generate_chapter_html(ch_num, title_en, title_ko, part_info, epigraph_text, epigraph_author, overview_img, md_file, out_file, prompts):
    with open(md_file, 'r', encoding='utf-8') as f:
        md_text = f.read()

    sections_html = parse_markdown_to_html(md_text)
    nav_links = build_nav_links(md_text)

    nav_menu_items = '\n'.join([f'<li><a href="#{link_id}" class="nav-link">{title}</a></li>' for link_id, title in nav_links])

    prompt_cards = []
    for p in prompts:
        card = f'''<div class="prompt-card" onclick="setPrompt('{p["query"]}')">
  <h5>{p["title"]}</h5>
  <p>{p["desc"]}</p>
</div>'''
        prompt_cards.append(card)
    prompt_cards_html = '\n'.join(prompt_cards)

    overview_img_tag = f'<img src="{overview_img}" alt="Chapter {ch_num} Overview" class="hero-overview-img">' if overview_img else ''

    full_html = HTML_TEMPLATE.format(
        ch_num=ch_num,
        title_en=title_en,
        title_ko=title_ko,
        part_info=part_info,
        epigraph_text=epigraph_text,
        epigraph_author=epigraph_author,
        overview_img_tag=overview_img_tag,
        nav_menu_items=nav_menu_items,
        sections_html=sections_html,
        prompt_cards=prompt_cards_html
    )

    with open(out_file, 'w', encoding='utf-8') as f:
        f.write(full_html)
    print(f"Generated: {out_file} ({len(full_html):,} bytes)")

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.abspath(__file__))

    # Chapter 11
    ch11_prompts = [
        {
            "title": "🚒 현장 소방/구조대 맞춤형 ABSS KPI 도출",
            "desc": "119구조대 조직 특성 반영 및 고유/협업 7:3 가중치 배분 검증",
            "query": "ABSS 5단계 생애주기에 맞춰 의령소방서 119구조대에 적용할 수 있는 현장 밀착형 KPI 3가지를 도출하고, 산업안전보건법 조문과 7:3 가중치 배분 논리를 설명해줘."
        },
        {
            "title": "🏥 Can Do 서식과 산재 조기복귀 효과",
            "desc": "포괄적 휴업 배제 및 Transitional Duty의 의학적·경영학적 의의",
            "query": "Chapter 11의 인체공학적 위험도 평가 공식(난이도×빈도)과 Grab N Go Kit의 Can Do 서식이 실제 근골격계 질환 산재 예방에 어떻게 기여하는지 학술적으로 분석해줘."
        },
        {
            "title": "🧠 인지과학 시각 학습과 323% 잔존율",
            "desc": "Medina(2017)의 시각 우위 법칙과 일일 TBM의 뇌인지적 결합",
            "query": "식스시그마 실험계획법(DOE)과 블루스 클루스(Blue's Clues) 원리가 안전 교육의 기억 잔존율을 323% 높인 인지과학적 메커니즘을 설명해줘."
        }
    ]

    generate_chapter_html(
        ch_num=11,
        title_en="Developing an Activity-Based Safety System",
        title_ko="활동 기반 안전 시스템 구축",
        part_info="PART IV Tools to Enhance Your Safety Management System",
        epigraph_text="변화 없이는 진보가 불가능하며, 마음을 바꿀 수 없는 사람은 아무것도 바꿀 수 없다.",
        epigraph_author="조지 버나드 쇼 (George Bernard Shaw)",
        overview_img="image-106.png",
        md_file=os.path.join(base_dir, "chapter11-subnote.md"),
        out_file=os.path.join(base_dir, "chapter11_subnote.html"),
        prompts=ch11_prompts
    )

    # Chapter 12
    ch12_prompts = [
        {
            "title": "🚒 119구조대 및 화학플랜트 맞춤형 JHA KPI 도출",
            "desc": "JHA 5단계 생애주기 기반 소방/플랜트 고유/협업 7:3 가중치 및 산안법 제36조 매핑",
            "query": "JHA 5단계 생애주기에 맞춰 의령소방서 119구조대 및 화학 플랜트에 적용할 수 있는 현장 밀착형 KPI 3가지를 도출하고, 산업안전보건법 제36조 및 중처법 시행령 제4조 연계 논리를 설명해줘."
        },
        {
            "title": "🔪 칼날 안전 식스시그마와 전면 금지의 실패",
            "desc": "일방적 하향식 규제(칼날 금지)의 역효과와 JHA 근로자 참여의 극적 사고 감축 성과 분석",
            "query": "제12장 실전 사례인 칼날 안전 식스시그마 프로젝트에서 일방적 전면 금지 규제가 실패하고, JHA에 근로자를 참여시켜 도구 포트폴리오를 제공했을 때 사고가 근절된 인지과학적·조직문화적 원인을 분석해줘."
        },
        {
            "title": "🧠 라스무센 SRK 모델과 HPI 4대 오류 전조 요건",
            "desc": "숙련·규칙·지식 기반 수행과 과업/개인/환경/본성 오류 전조 요건의 JHA 통합 메커니즘",
            "query": "라스무센(Rasmussen)의 SRK 모델과 DOE HPI의 4대 오류 전조 요건(과업 요구, 개인 역량, 작업 환경, 인간 본성)이 JHA 프로세스에서 어떻게 잠재적 위험을 선제 통제하는지 학술적으로 논증해줘."
        }
    ]

    generate_chapter_html(
        ch_num=12,
        title_en="Using the Job Hazard Analysis",
        title_ko="직무 위험성 평가의 활용",
        part_info="PART IV Tools to Enhance Your Safety Management System",
        epigraph_text="우리는 생산과 별개의 안전 프로그램을 원하거나, 생산과 안전, 혹은 안전을 동반한 생산을 원하는 것이 아닙니다. 우리가 진정으로 원하는 것은 '안전한 생산(Safe Production)' 그 자체입니다.",
        epigraph_author="댄 피터슨 (Dan Petersen)",
        overview_img="image-129.png",
        md_file=os.path.join(base_dir, "chapter12-subnote.md"),
        out_file=os.path.join(base_dir, "chapter12_subnote.html"),
        prompts=ch12_prompts
    )

    # Chapter 13
    ch13_prompts = [
        {
            "title": "🚒 119구조대 및 화학운전반 교육훈련 KPI 도출",
            "desc": "교육훈련 5단계 생애주기 기반 산안법 제29조 및 실습(Hands-on) 비중 50% 지표 매핑",
            "query": "교육훈련 5단계 생애주기에 맞춰 119구조대 및 화학운전반에 적용할 수 있는 현장 밀착형 KPI 3가지를 도출하고, 산업안전보건법 제29조 및 중처법 시행령 제4조제5호 연계 논리를 설명해줘."
        },
        {
            "title": "🚫 Mager 의사결정 트리와 '재교육 남발(Retraining Trap)' 차단",
            "desc": "숙련 기반 무의식 실수에 대한 재교육의 무용성과 시스템적 방호 설계의 필연성 학술 분석",
            "query": "로버트 메이거(Robert Mager)의 수행 결함 의사결정 트리와 DOE HPI 핸드북을 근거로, 사고 조사 시 '작업자 재교육'을 남발하는 행태가 왜 조직문화를 파괴하는지 학술적으로 분석해줘."
        },
        {
            "title": "🗣️ LOTO 참사 방지를 위한 3방향 소통(Three-way) 훈련",
            "desc": "구두 지시 오해('Make sure it is not on') 참사와 패러프레이징 복명복창 프로토콜 구축",
            "query": "제13장의 LOTO 미실시 및 구두 소통 오해 중대재해 사례를 바탕으로, 고신뢰조직의 3방향 소통(Three-way Communication) 프로토콜을 현장 TBM에 체질화하는 구체적 방안을 설명해줘."
        }
    ]

    generate_chapter_html(
        ch_num=13,
        title_en="Developing Safety Training Needs",
        title_ko="안전 교육훈련 니즈 개발",
        part_info="PART IV Tools to Enhance Your Safety Management System",
        epigraph_text="자신이 가르쳐야만 하는 상황에 직면한 사람만큼 어떤 주제에 대해 깊이 배우는 사람은 없다.",
        epigraph_author="피터 드러커 (Peter F. Drucker)",
        overview_img="image-162.png",
        md_file=os.path.join(base_dir, "chapter13-subnote.md"),
        out_file=os.path.join(base_dir, "chapter13_subnote.html"),
        prompts=ch13_prompts
    )

    # Chapter 14
    ch14_prompts = [
        {
            "title": "🚒 119구조대 및 화학플랜트 SMS 평가 KPI 도출",
            "desc": "SMS 평가 5단계 생애주기 기반 119구조대/플랜트 고유/협업 지표 및 산안법 제14조·제36조 매핑",
            "query": "SMS 평가 5단계 생애주기에 맞춰 의령소방서 119구조대 및 화학 플랜트에 적용할 수 있는 현장 밀착형 KPI 3가지를 도출하고, 산업안전보건법 제14조, 제36조 및 중처법 시행령 제4조 연계 논리를 설명해줘."
        },
        {
            "title": "🪞 거울 비유와 '시스템 탓하기(Blaming the System)' 극복",
            "desc": "성과 미흡 시 시스템을 갈아엎는 악순환 타파와 식스시그마 결함(Defect) 수리 메커니즘 학술 분석",
            "query": "제14장의 핵심 은유인 '거울 비유'와 '시스템 탓하기(Blaming the System)' 심리를 극복하기 위해, 식스시그마의 결함(Defect) 개념과 제임스의 월별 1개 요소 점검 방식이 어떻게 조직문화를 혁신하는지 학술적으로 분석해줘."
        },
        {
            "title": "🔍 내부 자체 평가와 외부 제3자 평가의 융합 전략",
            "desc": "현장 잠재 취약점(Latent Weaknesses) 발굴과 조직적 맹점(Blind Spots) 교정의 상호보완적 감사 설계",
            "query": "DOE HPI 핸드북에 근거하여, 현장 작업자 중심의 내부 자체 평가와 외부 전문가의 제3자 독립 평가가 어떻게 상호보완하여 조직의 맹점(Blind spots)과 규범적 표류(Drift)를 교정하는지 구체적으로 논증해줘."
        }
    ]

    generate_chapter_html(
        ch_num=14,
        title_en="Assessing Your Safety Management System",
        title_ko="안전경영시스템 평가",
        part_info="PART IV Tools to Enhance Your Safety Management System",
        epigraph_text="목표에 도달하고 싶다면, 그곳에 도달하기 전에 마음속에서 먼저 '도달하는 모습'을 그려보아야 한다.",
        epigraph_author="지그 지글러 (Zig Ziglar)",
        overview_img="image-173.png",
        md_file=os.path.join(base_dir, "chapter14-subnote.md"),
        out_file=os.path.join(base_dir, "chapter14_subnote.html"),
        prompts=ch14_prompts
    )
