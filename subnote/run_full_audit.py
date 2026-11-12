# -*- coding: utf-8 -*-
import json
import os
import re

chapters_audit = {}

for ch in range(1, 15):
    bf = f"subnote/chapter{ch}_bilingual.json"
    with open(bf, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    ch_info = {
        "chapter": ch,
        "total_blocks": len(data),
        "total_en_words": 0,
        "total_ko_chars": 0,
        "issues": []
    }
    
    for idx, b in enumerate(data):
        bid = b.get("id") or b.get("block_id") or f"B{idx+1:02d}"
        en = b.get("en", "").strip()
        ko = b.get("ko", "").strip()
        
        en_words = len(en.split())
        ko_chars = len(ko.replace(" ", "").replace("\n", ""))
        
        ch_info["total_en_words"] += en_words
        ch_info["total_ko_chars"] += ko_chars
        
        en_bullets = [l.strip() for l in en.split("\n") if l.strip().startswith(("* ", "- "))]
        ko_bullets = [l.strip() for l in ko.split("\n") if l.strip().startswith(("* ", "- "))]
        
        ratio = ko_chars / (en_words + 1e-5)
        
        reasons = []
        if len(en_bullets) > 0 and len(ko_bullets) == 0:
            reasons.append(f"Bullets missing entirely (EN {len(en_bullets)} vs KO 0)")
        elif len(en_bullets) > len(ko_bullets):
            reasons.append(f"Bullets missing partial (EN {len(en_bullets)} vs KO {len(ko_bullets)})")
            
        if en_words >= 30 and ratio < 1.7:
            reasons.append(f"Severe truncation (ratio {ratio:.2f}, EN {en_words}w, KO {ko_chars}c)")
        elif en_words >= 50 and ratio < 2.0:
            reasons.append(f"Noticeable compression (ratio {ratio:.2f}, EN {en_words}w, KO {ko_chars}c)")
            
        if reasons:
            ch_info["issues"].append({
                "id": bid,
                "index": idx,
                "en_words": en_words,
                "ko_chars": ko_chars,
                "ratio": round(ratio, 2),
                "en_bullets": len(en_bullets),
                "ko_bullets": len(ko_bullets),
                "reasons": reasons,
                "en": en,
                "ko": ko
            })
            
    ch_info["ratio"] = round(ch_info["total_ko_chars"] / (ch_info["total_en_words"] + 1e-5), 2)
    ch_info["issues_count"] = len(ch_info["issues"])
    chapters_audit[ch] = ch_info

with open("subnote/full_audit_ch1_ch14.json", "w", encoding="utf-8") as f:
    json.dump(chapters_audit, f, ensure_ascii=False, indent=2)

print("Saved full audit results to subnote/full_audit_ch1_ch14.json")
