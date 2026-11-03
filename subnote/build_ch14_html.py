#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Subnote HTML Generator for Chapter 14
"""

import os
import sys

# Import helper functions from existing builder
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from build_ch12_ch13_html import generate_chapter_html

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.abspath(__file__))

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
    print("Chapter 14 HTML build completed.")
