#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Subnote HTML Generator for Chapter 15
"""

import os
import sys

# Import helper functions from existing builder
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from build_ch12_ch13_html import generate_chapter_html

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.abspath(__file__))

    ch15_prompts = [
        {
            "title": "🚒 119구조대 SMS 정보 큐레이션 5단계 KPI 도출",
            "desc": "큐레이션 생애주기 5단계 기반 119구조대 고유/협업 지표 및 산안법 제164조·중처법 시행령 제4조 매핑",
            "query": "제15장의 정보 큐레이션 생애주기 5단계(수요진단-수집선별-분류저장-검증최신화-공유환류)에 맞춰 119구조대 및 현장 안전부서에 적용할 수 있는 고유/협업 KPI를 도출하고, 산업안전보건법 제164조(서류의 보존) 및 중대재해처벌법 시행령 제4조와의 연계 근거를 설명해줘."
        },
        {
            "title": "📚 Curry & O'Riáin 7대 품질 차원과 5S 기반 조직 기억 보존",
            "desc": "정보 홍수 속 가짜 정보 필터링과 부서 간 안전 문서 사일로 해소 전략 분석",
            "query": "제15장에 제시된 Curry & O'Riáin(2010)의 7대 데이터 품질 차원과 5S 정리정돈 원칙이 관찰 사례 1·2(부서별 안전 기준 충돌, 2년간의 파일 캐비닛 정리)의 문제를 어떻게 해결하여 조직의 기억(Organizational memory)을 보존하는지 설명해줘."
        },
        {
            "title": "🧭 FIG. 15.4 문헌 연구 순서도와 에든버러 RDM 워크플로우 설계",
            "desc": "교재 순서도(FIG. 15.4)와 RDM 2단계 체크리스트를 안전관리 플랫폼 모듈로 구현하는 방법",
            "query": "제15장의 그림 15.4(문헌 연구 계획 기본 개요 순서도)의 각 분기 구조와 에든버러 대학교 연구 데이터 관리(RDM) 2단계 체크리스트를 안전관리 플랫폼의 문서·지식 큐레이션 워크플로우로 어떻게 매핑할 수 있는지 설명해줘."
        }
    ]

    generate_chapter_html(
        ch_num=15,
        title_en="Curating for the Safety Management System",
        title_ko="안전경영시스템을 위한 정보 큐레이션",
        part_info="PART V Curation Resources",
        epigraph_text="데이터는 소중한 자산이며, 시스템 그 자체보다 더 오래 지속된다.",
        epigraph_author="팀 버너스리 (Tim Berners-Lee, 2018)",
        overview_img="image-185.png",
        md_file=os.path.join(base_dir, "chapter15-subnote.md"),
        out_file=os.path.join(base_dir, "chapter15_subnote.html"),
        prompts=ch15_prompts
    )
    print("Chapter 15 HTML build completed.")
