import networkx as nx
from typing import List, Dict, Any
from backend.app.models.schemas import ONANode, ONAEdge, ONAGraphData
from backend.app.data.seed_data import DEFAULT_ONA_NODES, DEFAULT_ONA_EDGES

def analyze_ona_network(nodes_data: List[Dict[str, Any]] = None, edges_data: List[Dict[str, Any]] = None) -> ONAGraphData:
    nodes_raw = nodes_data or DEFAULT_ONA_NODES
    edges_raw = edges_data or DEFAULT_ONA_EDGES

    # 방향성 있는 그래프(DiGraph) 생성
    G = nx.DiGraph()

    # 노드 추가
    for n in nodes_raw:
        G.add_node(n["id"], name=n["name"], department=n["department"], role=n["role"])

    # 엣지 추가 (frequency를 가중치로 활용)
    for e in edges_raw:
        G.add_edge(e["source"], e["target"], relation=e["relation_type"], weight=e.get("frequency", 1))

    # 1. 중심성 지표 계산
    degree_centrality = nx.degree_centrality(G)
    # 무방향 환산 후 매개 중심성(Betweenness) 계산 (정보 매개 브릿지)
    G_undirected = G.to_undirected()
    betweenness_centrality = nx.betweenness_centrality(G_undirected)

    # 2. Ch 3: 3단계 영향력 법칙 (Three Degrees of Influence) 점수 산출
    # 1단계(1.0), 2단계(0.5), 3단계(0.25) 가중 감쇄 적용
    influence_scores: Dict[str, float] = {}
    for node in G.nodes():
        score = 0.0
        # 1-hop
        neighbors_1 = set(G.neighbors(node))
        score += len(neighbors_1) * 1.0

        # 2-hop
        neighbors_2 = set()
        for n1 in neighbors_1:
            neighbors_2.update(G.neighbors(n1))
        neighbors_2 = neighbors_2 - neighbors_1 - {node}
        score += len(neighbors_2) * 0.5

        # 3-hop
        neighbors_3 = set()
        for n2 in neighbors_2:
            neighbors_3.update(G.neighbors(n2))
        neighbors_3 = neighbors_3 - neighbors_2 - neighbors_1 - {node}
        score += len(neighbors_3) * 0.25

        influence_scores[node] = round(score, 2)

    # 3. 네트워크 밀도 (Density)
    total_nodes = len(nodes_raw)
    density = round(nx.density(G), 3)

    # 4. 노드 모델 리스트 변환 및 역할 분류
    result_nodes: List[ONANode] = []
    opinion_leaders: List[str] = []
    key_bridges: List[str] = []
    isolated_nodes_count = 0

    # 임계치 설정
    max_influence = max(influence_scores.values()) if influence_scores else 1.0
    for n in nodes_raw:
        nid = n["id"]
        deg = round(degree_centrality.get(nid, 0.0), 3)
        btw = round(betweenness_centrality.get(nid, 0.0), 3)
        inf = influence_scores.get(nid, 0.0)

        # 고립 노드 판정 (연결 차수가 1 이하이거나 0인 경우)
        is_isolated = G.degree(nid) <= 1
        if is_isolated:
            isolated_nodes_count += 1

        # 오피니언 리더 (3단계 영향력 상위 25% 이상)
        is_opinion_leader = inf >= (max_influence * 0.6)
        if is_opinion_leader:
            opinion_leaders.append(f"{n['name']}({n['department']})")

        # 소통 브릿지 (Betweenness 상위권)
        if btw >= 0.15:
            key_bridges.append(f"{n['name']}({n['department']})")

        result_nodes.append(ONANode(
            id=nid,
            name=n["name"],
            department=n["department"],
            role=n["role"],
            degree_centrality=deg,
            betweenness_centrality=btw,
            influence_score_3deg=inf,
            is_opinion_leader=is_opinion_leader,
            is_isolated=is_isolated
        ))

    result_edges = [
        ONAEdge(
            source=e["source"],
            target=e["target"],
            relation_type=e["relation_type"],
            frequency=e.get("frequency", 1)
        ) for e in edges_raw
    ]

    return ONAGraphData(
        nodes=result_nodes,
        edges=result_edges,
        network_density=density,
        isolated_nodes_count=isolated_nodes_count,
        key_bridges=list(set(key_bridges)),
        opinion_leaders=list(set(opinion_leaders))
    )
