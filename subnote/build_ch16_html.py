#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Subnote HTML Generator for Chapter 16
"""

import os
import sys

# Import helper functions from existing builder
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from build_ch12_ch13_html import generate_chapter_html

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.abspath(__file__))

    ch16_prompts = [
        {
            "title": "🚒 119구조대 콘텐츠 제작 전략 5단계 KPI 도출",
            "desc": "Input-Process-Output 모델 및 5단계 생애주기 기반 고유/협업 KPI와 산안법 제29조·제164조 매핑",
            "query": "제16장의 투입-처리-산출(Input-Process-Output) 모델과 5단계 생애주기에 맞춰 119구조대 및 안전관리부서에 적용할 수 있는 고유/협업 KPI를 도출하고, 산업안전보건법 제29조·제164조 및 중대재해처벌법 시행령 제4조·제13조와의 연계 근거를 설명해줘."
        },
        {
            "title": "🛡️ Tribal Knowledge(부족 지식)의 공식화 및 SME 10,000시간 검증",
            "desc": "현장 암묵지의 문서화와 공인안전전문가(CSP) 10,000시간·4대 큐레이션 역할 연계 분석",
            "query": "제16장에서 제시한 부족 지식(Tribal knowledge)을 어떻게 큐레이션된 추천(Curated referrals)과 해설자(Commentator) 역할로 공식화할 수 있는지, 그리고 Gladwell의 10,000시간 법칙(ASP+CSP) 및 Crossfield의 출처 검증 원칙과의 관계를 설명해줘."
        },
        {
            "title": "🔄 FIG. 16.1 협업 인용 순서도 & FIG. 16.2 Feedly IPO 모델 구현",
            "desc": "클라우드·JabRef/Docear 인용 검증 루프(FIG. 16.1)와 RSS·Feedly(FIG. 16.2)의 플랫폼 설계",
            "query": "제16장의 그림 16.1(문헌 수집·인용 협업 순서도)의 Proper Reference 검증 분기와 그림 16.2(Feedly 투입-처리-산출 모델) 및 표 16.3의 안전 RSS 피드를 안전관리 플랫폼의 지식 수집·검증 워크플로우로 어떻게 구현할 수 있는지 설명해줘."
        }
    ]

    generate_chapter_html(
        ch_num=16,
        title_en="Developing a Content Creation Strategy",
        title_ko="콘텐츠 제작 전략 개발",
        part_info="PART V Curation Resources",
        epigraph_text="데이터가 없다면, 당신은 그저 의견을 가진 또 한 사람일 뿐이다.",
        epigraph_author="W. 에드워즈 데밍 (W. Edwards Deming)",
        overview_img="image-190.png",
        md_file=os.path.join(base_dir, "chapter16-subnote.md"),
        out_file=os.path.join(base_dir, "chapter16_subnote.html"),
        prompts=ch16_prompts
    )
    print("Chapter 16 HTML build completed.")
