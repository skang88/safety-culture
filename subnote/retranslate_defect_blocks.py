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

SYSTEM_PROMPT = """You are an expert academic translator specializing in industrial safety culture, resilience engineering, human factors engineering, risk perception, and safety management systems.
Translate the following English block from the book "Safety Culture" into professional, highly rigorous, academic Korean.

MANDATORY RULES:
1. Complete fidelity: Translate EVERY SINGLE sentence, clause, bullet point, quotation, and parenthetical remark. NEVER summarize, compress, hallucinate fictional anecdotes, or omit anything.
2. Structure & Headings:
   - ONLY include a heading (#, ##, ###) IF the original English text begins with a heading. If the original text is a regular paragraph without a heading, DO NOT invent or add any heading.
   - Preserve bold (**...**), italics (*...*), blockquotes (>), lists (*, -, 1., 2.), and markdown tables.
   - For images like ![alt](src), preserve the image markdown tag intact.
3. Citations & References:
   - Retain all citations in parentheses exactly as in original.
4. Academic Terminology:
   - Include key English terms in parentheses where appropriate.
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
    audit_file = os.path.join(base_dir, "full_audit_ch1_ch14.json")
    with open(audit_file, "r", encoding="utf-8") as f:
        full_audit = json.load(f)

    # Collect target blocks to retranslate (Ch 1 to 12)
    targets = []
    for ch in range(1, 13):
        ch_str = str(ch)
        if ch_str in full_audit and full_audit[ch_str]["issues"]:
            for issue in full_audit[ch_str]["issues"]:
                targets.append({
                    "chapter": ch,
                    "id": issue["id"],
                    "index": issue.get("index"),
                    "en": issue["en"],
                    "old_ko": issue["ko"]
                })

    print(f"Total target blocks across Ch 1-12 to retranslate: {len(targets)}")

    results = {}
    print("Starting translation using Solar-pro4 with 4 workers...")
    start_time = time.time()

    with ThreadPoolExecutor(max_workers=4) as executor:
        future_to_target = {
            executor.submit(call_solar_translate, t["en"], f"Ch{t['chapter']}_{t['id']}"): t
            for t in targets
        }

        completed = 0
        for future in as_completed(future_to_target):
            t = future_to_target[future]
            ch = t["chapter"]
            bid = t["id"]
            try:
                translated_text = future.result()
                
                # Check fake header
                en_heads = [l for l in t["en"].split("\n") if l.strip().startswith("#")]
                lines = translated_text.split("\n")
                if not en_heads and lines and lines[0].strip().startswith("#"):
                    lines.pop(0)
                    while lines and not lines[0].strip():
                        lines.pop(0)
                    translated_text = "\n".join(lines).strip()

                results[(ch, bid)] = translated_text
                completed += 1
                if completed % 10 == 0 or completed == len(targets):
                    print(f"[{completed}/{len(targets)}] Completed... Elapsed: {time.time()-start_time:.1f}s")
            except Exception as e:
                print(f"[Ch{ch}_{bid}] Failed: {e}")

    # Now update bilingual json files and rebuild each chapter
    print("\nUpdating bilingual JSON files and rebuilding chapters...")
    for ch in range(1, 13):
        ch_targets = [t for t in targets if t["chapter"] == ch]
        if not ch_targets:
            continue
            
        bi_file = os.path.join(base_dir, f"chapter{ch}_bilingual.json")
        with open(bi_file, "r", encoding="utf-8") as f:
            bi_data = json.load(f)
            
        updated_count = 0
        for item in bi_data:
            item_id = item.get("id") or item.get("block_id")
            key = (ch, item_id)
            if key in results:
                item["ko"] = results[key]
                updated_count += 1
                
        with open(bi_file, "w", encoding="utf-8") as f:
            json.dump(bi_data, f, ensure_ascii=False, indent=2)
            
        print(f"Chapter {ch}: updated {updated_count} blocks in {bi_file}")
        
        # Also sync to chapter{N}-번역.md
        md_file = os.path.join(base_dir, f"chapter{ch}-번역.md")
        if os.path.exists(md_file):
            # rebuild markdown from updated bilingual data
            md_lines = []
            for item in bi_data:
                bid = item.get("id") or item.get("block_id") or "Block"
                ko_text = item.get("ko", "").strip()
                md_lines.append(f"<!-- Block {bid} -->\n{ko_text}\n")
            with open(md_file, "w", encoding="utf-8") as f:
                f.write("\n".join(md_lines))
            print(f"Chapter {ch}: synced markdown {md_file}")

    print("\nAll 57 defect blocks successfully retranslated and saved!")

if __name__ == "__main__":
    main()
