"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Network, Users, UserCheck, AlertTriangle, Info } from "lucide-react";
import { fetchONAGraph } from "@/lib/api";

export default function ONAView() {
  const [data, setData] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    async function load() {
      const graphData = await fetchONAGraph();
      setData(graphData);
      if (graphData.nodes?.length > 0) {
        setSelectedNode(graphData.nodes[1]); // 기본 박안전 선택
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const width = 680;
    const height = 480;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // 초기화

    const g = svg.append("g");

    // Zoom 기능
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.5, 3]).on("zoom", (event) => {
      g.attr("transform", event.transform);
    });
    svg.call(zoom);

    // 복사본 생성 (D3 mutation 방지)
    const nodes = data.nodes.map((d: any) => ({ ...d }));
    const links = data.edges.map((d: any) => ({ ...d }));

    // Force Simulation 설정
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(90)
      )
      .force("charge", d3.forceManyBody().strength(-240))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(35));

    // 링크 그리기
    const link = g
      .append("g")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-opacity", 0.7)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d: any) => Math.max(1.5, d.frequency * 1.5))
      .attr("stroke", (d: any) => {
        if (d.relation_type === "hazard_report") return "#f43f5e"; // 위험 제보는 붉은색
        if (d.relation_type === "advice") return "#3b82f6"; // 안전 조언은 파란색
        return "#94a3b8"; // 협업
      });

    // 노드 그룹
    const node = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer")
      .on("click", (event, d: any) => {
        setSelectedNode(d);
      })
      .call(
        d3
          .drag<any, any>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // 노드 원 그리기 (영향력 크기 비례)
    node
      .append("circle")
      .attr("r", (d: any) => Math.max(16, 12 + d.influence_score_3deg * 2))
      .attr("fill", (d: any) => {
        if (d.is_opinion_leader) return "#8b5cf6"; // 보라색: 오피니언 리더
        if (d.role === "executive") return "#1e293b"; // 경영진: 짙은 슬레이트
        if (d.role === "manager") return "#2563eb"; // 관리자: 파랑
        return "#10b981"; // 현장작업자: 에메랄드
      })
      .attr("stroke", (d: any) => (d.is_isolated ? "#f43f5e" : "#ffffff"))
      .attr("stroke-width", (d: any) => (d.is_isolated ? 3 : 2))
      .attr("stroke-dasharray", (d: any) => (d.is_isolated ? "4,2" : "none"));

    // 노드 라벨 텍스트
    node
      .append("text")
      .text((d: any) => d.name)
      .attr("x", 0)
      .attr("y", 4)
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .attr("font-size", "11px")
      .attr("font-weight", "bold")
      .attr("pointer-events", "none");

    // 시뮬레이션 틱 업데이트
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <div className="space-y-8 pb-12">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Chapter 3 조직 네트워크 분석 (ONA) & 3단계 영향력 지도
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          크리스타키스 & 파울러(2009)의 **3단계 영향력 법칙(Three Degrees of Influence)**에 기반하여
          공식 조직도 이면에 존재하는 비공식 안전 조언망, 오피니언 리더 및 고립 노드를 탐색합니다.
        </p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">네트워크 소통 밀도</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {data ? (data.network_density * 100).toFixed(1) : 0}%
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">전체 가능한 연결 대비 실제 소통선</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">핵심 오피니언 리더</span>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {data?.opinion_leaders?.length || 0}인
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">3단계 전파 영향력 상위 25%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">부서 간 소통 브릿지</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {data?.key_bridges?.length || 0}인
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">높은 매개 중심성(Betweenness)</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">고립 취약 노드</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">
            {data?.isolated_nodes_count || 0}인
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">협력사·신임 등 연결 결여</p>
        </div>
      </div>

      {/* 메인 네트워크 그래프 & 우측 상세 패널 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* D3 그래프 캔버스 */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                인터랙티브 안전 소통 네트워크 토폴로지
              </h2>
              <p className="text-xs text-slate-500">
                노드를 드래그하거나 클릭하여 3단계 영향력 및 중심성 지표를 확인하세요.
              </p>
            </div>
            {/* 범례 */}
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span> 오피니언 리더
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span> 관리자
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> 현장
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full border border-rose-500 border-dashed inline-block"></span> 고립주의
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex justify-center items-center">
            <svg ref={svgRef} width="680" height="480" className="w-full h-[480px]"></svg>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>🔵 실선(파랑): 안전 조언(Advice)</span>
            <span>🔴 실선(빨강): 위험 제보(Hazard Report)</span>
            <span>⚪ 회색: 일반 협업</span>
            <span>마우스 휠로 줌 인/아웃 가능</span>
          </div>
        </div>

        {/* 선택된 구성원 상세 정보 & 컨설팅 팁 */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" /> 구성원 네트워크 지표
            </h2>

            {selectedNode ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{selectedNode.name}</h3>
                      <p className="text-xs text-slate-500">{selectedNode.department} · {selectedNode.role}</p>
                    </div>
                    {selectedNode.is_opinion_leader && (
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[11px] font-bold">
                        오피니언 리더
                      </span>
                    )}
                    {selectedNode.is_isolated && (
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[11px] font-bold">
                        고립 노드
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">3단계 영향력</span>
                      <strong className="text-sm text-purple-600">{selectedNode.influence_score_3deg}</strong>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">연결 중심성</span>
                      <strong className="text-sm text-blue-600">{selectedNode.degree_centrality}</strong>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">매개 중심성</span>
                      <strong className="text-sm text-indigo-600">{selectedNode.betweenness_centrality}</strong>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 leading-relaxed bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
                  <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-600" /> Ch 3 네트워크 활용 제언:
                  </h4>
                  {selectedNode.is_opinion_leader ? (
                    <p>
                      <strong>{selectedNode.name}</strong> 님은 비공식 소통망에서 3단계 영향력이 탁월한 핵심 인물입니다.
                      새로운 안전 절차나 SMS 정책을 도입할 때 이 구성원을 '안전 챔피언'으로 사전 인게이지하면 전파 속도가 3배 이상 빨라집니다.
                    </p>
                  ) : selectedNode.is_isolated ? (
                    <p className="text-rose-700">
                      <strong>{selectedNode.name}</strong> 님은 안전 소통망에서 단절된 고립 노드입니다.
                      사내 협력사 또는 신임 직원 멘토링 매핑을 통해 안전 정보 누락을 방지해야 합니다.
                    </p>
                  ) : (
                    <p>
                      부서 내 일상적 안전 실천과 동료 상호 피드백을 유지하며, 인근 노드들과의 정보 교류 빈도를 높이도록 지원하세요.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">노드를 클릭하여 세부 지표를 확인하세요.</p>
            )}
          </div>

          {/* 3단계 영향력 이론 안내 카드 */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Ch 3 3단계 영향력의 법칙 (Christakis & Fowler)
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              "우리가 실천하는 안전 태도는 단순한 개인의 행동이 아닙니다. 나의 안전 실천은 1단계(직접 동료),
              2단계(동료의 친구), 3단계(그 친구의 동료)까지 파급되어 조직 전체의 안전 규범을 형성합니다."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
