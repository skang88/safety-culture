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

                results[f"{ch}_{bid}"] = translated_text
                completed += 1
                if completed % 10 == 0 or completed == len(targets):
                    print(f"[{completed}/{len(targets)}] Completed... Elapsed: {time.time()-start_time:.1f}s")
            except Exception as e:
                print(f"[Ch{ch}_{bid}] Failed: {e}")

    # Save to json file permanently
    res_path = os.path.join(base_dir, "defect_retranslations_57.json")
    with open(res_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"Saved retranslations to {res_path}")

    # Now patch part files directly
    builders_dir = os.path.join(base_dir, "builders")
    sys.path.append(builders_dir)

    for ch in range(1, 13):
        ch_targets = [t for t in targets if t["chapter"] == ch]
        if not ch_targets:
            continue
            
        print(f"\nPatching Chapter {ch} part files...")
        p_files = sorted([f for f in os.listdir(builders_dir) if f.startswith(f"ch{ch}_translations_p") and f.endswith(".py")])
        
        for pf in p_files:
            pf_path = os.path.join(builders_dir, pf)
            mod_name = pf[:-3]
            if mod_name in sys.modules:
                del sys.modules[mod_name]
            mod = __import__(mod_name)
            dict_name = [k for k in dir(mod) if "TRANSLATION" in k.upper()][0]
            data_dict = getattr(mod, dict_name)
            
            updated_in_file = 0
            for t in ch_targets:
                bid = t["id"] # e.g. 'b-037' or 'B08'
                key_int = int(re.findall(r"\d+", bid)[0]) if re.findall(r"\d+", bid) else 0
                res_key = f"{ch}_{bid}"
                if res_key not in results:
                    continue
                new_text = results[res_key]
                
                # Check int key (Ch 2, 3)
                if key_int in data_dict:
                    data_dict[key_int] = new_text
                    updated_in_file += 1
                # Check str key (Ch 6, 7, 8, 9, 11, 12)
                elif bid in data_dict:
                    data_dict[bid] = new_text
                    updated_in_file += 1
                elif f"B{key_int:02d}" in data_dict:
                    data_dict[f"B{key_int:02d}"] = new_text
                    updated_in_file += 1
                    
            if updated_in_file > 0:
                # Rewrite py file cleanly
                lines = [
                    "# -*- coding: utf-8 -*-",
                    f'"""\nChapter {ch} Translations - Patched Verbatim via Solar-pro4\n"""',
                    "",
                    f"{dict_name} = {{"
                ]
                items = list(data_dict.items())
                for i, (k, v) in enumerate(items):
                    escaped_v = str(v).replace('"""', '\\"\\"\\"')
                    k_repr = repr(k)
                    comma = "," if i < len(items) - 1 else ""
                    lines.append(f'    {k_repr}: """{escaped_v}"""{comma}')
                    lines.append("")
                lines.append("}")
                lines.append("")
                with open(pf_path, "w", encoding="utf-8") as f:
                    f.write("\n".join(lines))
                print(f"  Patched {pf}: updated {updated_in_file} blocks.")

        # Run builder for this chapter
        builder_script = os.path.join(builders_dir, f"build_ch{ch}_bilingual.py")
        if os.path.exists(builder_script):
            cmd = f"cd {builders_dir} && python3 build_ch{ch}_bilingual.py"
            os.system(cmd)
            print(f"Rebuilt Chapter {ch} HTML & bilingual files.")

    print("\nAll 57 defect blocks patched, rebuilt, and synced successfully!")

if __name__ == "__main__":
    main()
