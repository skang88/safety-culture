# -*- coding: utf-8 -*-
import os
import sys
import json
import time
import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

UPSTAGE_API_KEY = "up_95QxLBeBaJEI38YS43wlMOevb0q8b"
MODEL_NAME = "solar-pro4"

SYSTEM_PROMPT = """You are an expert academic translator specializing in industrial safety culture, safety management systems (SMS), human factors engineering, resilience engineering, and organizational assessment.
Translate the following English block from the textbook "Safety Culture" (Chapter 14: Assessing Your Safety Management System) into professional, highly rigorous, academic Korean.

MANDATORY RULES:
1. Complete fidelity: Translate EVERY SINGLE sentence, clause, bullet point, quotation, and parenthetical remark. NEVER summarize, omit, compress, or paraphrase away details.
2. Structure & Headings:
   - ONLY include a heading (#, ##, ###) IF the original English text begins with a heading. If the original text is a regular paragraph without a heading, DO NOT invent or add any heading.
   - Preserve bold (**...**), italics (*...*), blockquotes (>), lists (*, -, 1., 2.), and markdown tables.
   - For images like ![alt](src), preserve the image markdown tag intact.
3. Citations & References:
   - Retain all citations in parentheses exactly as in original.
4. Academic Terminology (English in parentheses):
   - Safety Management System -> 안전보건경영시스템(Safety Management System, SMS)
   - Self-assessment -> 자체 진단/평가(Self-assessment)
   - Third-party assessment -> 제3자 외부 평가(Third-Party Assessment)
   - Audit -> 감사(Audit)
   - Continuous improvement -> 지속적 개선(Continuous Improvement)
   - Leading / Lagging indicators -> 선행 / 후행 지표(Leading / Lagging Indicators)
5. Tone: Scholarly, authoritative, formal Korean (하십시오/합니다 체를 기본으로 하며, 명확하고 단호한 학술 서술형 어조 유지).
6. Output ONLY the translated Markdown. Do not include introductory notes, conversational remarks, or markdown code block fences (do not wrap in ```markdown ... ```)."""

def call_solar_translate(content, block_id, max_retries=3):
    stripped = content.strip()
    if stripped.startswith("![") and stripped.endswith(")") and "\n" not in stripped:
        return content

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Translate the following block ({block_id}) into academic Korean:\n\n{content}"}
        ],
        "temperature": 0.2
    }
    
    data = json.dumps(payload).encode("utf-8")
    
    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(
                "https://api.upstage.ai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {UPSTAGE_API_KEY}",
                    "Content-Type": "application/json"
                },
                data=data
            )
            with urllib.request.urlopen(req, timeout=90) as resp:
                res = json.loads(resp.read().decode("utf-8"))
                text = res["choices"][0]["message"]["content"].strip()
                if text.startswith("```markdown"):
                    text = text[11:]
                elif text.startswith("```"):
                    text = text[3:]
                if text.endswith("```"):
                    text = text[:-3]
                return text.strip()
        except Exception as e:
            time.sleep(2 * (attempt + 1))
            if attempt == max_retries - 1:
                print(f"[{block_id}] Error after {max_retries} attempts: {e}")
                raise e

def main():
    base_dir = os.path.abspath(os.path.dirname(__file__))
    raw_path = os.path.join(base_dir, "chapter14_raw_blocks.json")
    with open(raw_path, "r", encoding="utf-8") as f:
        raw_blocks = json.load(f)

    # Map actual raw headings
    raw_heads_map = {}
    for b in raw_blocks:
        heads = [l.strip() for l in b["content"].split("\n") if l.strip().startswith("#")]
        raw_heads_map[b["id"]] = heads

    # Load existing translations
    sys.path.append(os.path.join(base_dir, "builders"))
    import ch14_translations_p1 as p1
    import ch14_translations_p2 as p2
    import ch14_translations_p3 as p3
    import ch14_translations_p4 as p4

    old_translations = {}
    old_translations.update(p1.translations)
    old_translations.update(p2.translations)
    old_translations.update(p3.translations)
    old_translations.update(p4.translations)

    print(f"Loaded {len(raw_blocks)} raw blocks for Chapter 14.")
    print(f"Loaded {len(old_translations)} existing translations.")

    new_translations = {}
    audit_data = []

    print("Starting translation using Solar-pro4 with 4 workers...")
    start_time = time.time()

    with ThreadPoolExecutor(max_workers=4) as executor:
        future_to_block = {
            executor.submit(call_solar_translate, b["content"], b["id"]): b
            for b in raw_blocks
        }

        completed = 0
        for future in as_completed(future_to_block):
            block = future_to_block[future]
            bid = block["id"]
            en_content = block["content"]
            old_ko = old_translations.get(bid, "")
            
            try:
                translated_text = future.result()
                
                # Check for fake header and remove if original had none
                raw_heads = raw_heads_map.get(bid, [])
                lines = translated_text.split("\n")
                if not raw_heads and lines and lines[0].strip().startswith("#"):
                    lines.pop(0)
                    while lines and not lines[0].strip():
                        lines.pop(0)
                    translated_text = "\n".join(lines).strip()

                new_translations[bid] = translated_text
                completed += 1
                
                # Metrics
                en_w = len(en_content.split())
                old_c = len(old_ko.replace(" ", "").replace("\n", ""))
                new_c = len(translated_text.replace(" ", "").replace("\n", ""))
                
                old_bullets = len([l for l in old_ko.split("\n") if l.strip().startswith(("* ", "- "))])
                new_bullets = len([l for l in translated_text.split("\n") if l.strip().startswith(("* ", "- "))])
                en_bullets = len([l for l in en_content.split("\n") if l.strip().startswith(("* ", "- "))])
                
                audit_data.append({
                    "id": bid,
                    "en_words": en_w,
                    "old_chars": old_c,
                    "new_chars": new_c,
                    "en_bullets": en_bullets,
                    "old_bullets": old_bullets,
                    "new_bullets": new_bullets,
                    "diff_bullets": new_bullets - old_bullets,
                    "char_growth": new_c - old_c,
                    "en": en_content,
                    "old_ko": old_ko,
                    "new_ko": translated_text
                })
                
                if completed % 15 == 0 or completed == len(raw_blocks):
                    print(f"[{completed}/{len(raw_blocks)}] Completed... Elapsed: {time.time()-start_time:.1f}s")
                    
            except Exception as e:
                print(f"[{bid}] Failed translation: {e}")

    def block_key(b):
        num = re.findall(r"\d+", b["id"])
        return int(num[0]) if num else 0

    audit_data.sort(key=block_key)

    audit_report_path = os.path.join(base_dir, "ch14_audit_results.json")
    with open(audit_report_path, "w", encoding="utf-8") as f:
        json.dump(audit_data, f, ensure_ascii=False, indent=2)
    print(f"Saved audit results to {audit_report_path}")

    # Split into 4 parts (37 each)
    p1_dict = {b["id"]: new_translations[b["id"]] for b in raw_blocks if 1 <= block_key(b) <= 37}
    p2_dict = {b["id"]: new_translations[b["id"]] for b in raw_blocks if 38 <= block_key(b) <= 74}
    p3_dict = {b["id"]: new_translations[b["id"]] for b in raw_blocks if 75 <= block_key(b) <= 111}
    p4_dict = {b["id"]: new_translations[b["id"]] for b in raw_blocks if 112 <= block_key(b) <= 148}

    def write_py_file(filepath, part_num, start_b, end_b, data_dict):
        lines = [
            "# -*- coding: utf-8 -*-",
            f'"""\nChapter 14 Translations - Part {part_num} (Blocks {start_b} to {end_b})\n100% Complete, Academic Rigor, 1:1 Translation via Solar-pro4\n"""',
            "",
            "translations = {"
        ]
        items = sorted(data_dict.items(), key=lambda x: int(re.findall(r"\d+", x[0])[0]))
        for i, (k, v) in enumerate(items):
            escaped_v = v.replace('"""', '\\"\\"\\"')
            comma = "," if i < len(items) - 1 else ""
            lines.append(f'    "{k}": """{escaped_v}"""{comma}')
            lines.append("")
        lines.append("}")
        lines.append("")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))
        print(f"Wrote {filepath} ({len(data_dict)} blocks)")

    builders_dir = os.path.join(base_dir, "builders")
    write_py_file(os.path.join(builders_dir, "ch14_translations_p1.py"), 1, "B01", "B37", p1_dict)
    write_py_file(os.path.join(builders_dir, "ch14_translations_p2.py"), 2, "B38", "B74", p2_dict)
    write_py_file(os.path.join(builders_dir, "ch14_translations_p3.py"), 3, "B75", "B111", p3_dict)
    write_py_file(os.path.join(builders_dir, "ch14_translations_p4.py"), 4, "B112", "B148", p4_dict)

    print("All Chapter 14 python files successfully updated!")

if __name__ == "__main__":
    main()
