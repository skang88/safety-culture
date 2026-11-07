// frontend/src/lib/services/onaService.ts
import seedData from "../data/seedData.json";

export interface ONANode {
  id: string;
  name: string;
  department: string;
  role: string;
  degree_centrality: number;
  betweenness_centrality: number;
  influence_score_3deg: number;
  is_opinion_leader: boolean;
  is_isolated: boolean;
}

export interface ONAEdge {
  source: string;
  target: string;
  relation_type: string;
  frequency: number;
}

export interface ONAGraphData {
  nodes: ONANode[];
  edges: ONAEdge[];
  network_density: number;
  isolated_nodes_count: number;
  key_bridges: string[];
  opinion_leaders: string[];
}

export function analyzeOnaNetwork(): ONAGraphData {
  const nodesRaw = seedData.onaNodes;
  const edgesRaw = seedData.onaEdges;

  const nodeMap = new Map<string, { id: string; name: string; department: string; role: string }>();
  for (const n of nodesRaw) {
    nodeMap.set(n.id, n);
  }

  // 인접 리스트 생성
  const adj = new Map<string, Set<string>>();
  const inDegree = new Map<string, number>();
  const outDegree = new Map<string, number>();
  const allDegree = new Map<string, number>();

  for (const n of nodesRaw) {
    adj.set(n.id, new Set());
    inDegree.set(n.id, 0);
    outDegree.set(n.id, 0);
    allDegree.set(n.id, 0);
  }

  for (const e of edgesRaw) {
    adj.get(e.source)?.add(e.target);
    outDegree.set(e.source, (outDegree.get(e.source) || 0) + 1);
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    allDegree.set(e.source, (allDegree.get(e.source) || 0) + 1);
    allDegree.set(e.target, (allDegree.get(e.target) || 0) + 1);
  }

  const n = nodesRaw.length;
  const maxPossibleEdges = n * (n - 1);
  const density = maxPossibleEdges > 0 ? Math.round((edgesRaw.length / maxPossibleEdges) * 1000) / 1000 : 0;

  // 3-degree influence score 계산
  const influenceScores: Record<string, number> = {};
  for (const node of nodesRaw) {
    const id = node.id;
    let score = 0.0;
    const n1 = adj.get(id) || new Set();
    score += n1.size * 1.0;

    const n2 = new Set<string>();
    for (const neighbor of n1) {
      const subNeighbors = adj.get(neighbor) || new Set();
      for (const sn of subNeighbors) {
        if (sn !== id && !n1.has(sn)) {
          n2.add(sn);
        }
      }
    }
    score += n2.size * 0.5;

    const n3 = new Set<string>();
    for (const neighbor of n2) {
      const subNeighbors = adj.get(neighbor) || new Set();
      for (const sn of subNeighbors) {
        if (sn !== id && !n1.has(sn) && !n2.has(sn)) {
          n3.add(sn);
        }
      }
    }
    score += n3.size * 0.25;

    influenceScores[id] = Math.round(score * 100) / 100;
  }

  const maxInf = Math.max(...Object.values(influenceScores), 1.0);
  const resultNodes: ONANode[] = [];
  const opinionLeaders: string[] = [];
  const keyBridges: string[] = [];
  let isolatedCount = 0;

  for (const node of nodesRaw) {
    const id = node.id;
    const deg = Math.round(((allDegree.get(id) || 0) / Math.max(1, (n - 1) * 2)) * 1000) / 1000;
    const inf = influenceScores[id] || 0;
    const isIsolated = (allDegree.get(id) || 0) <= 1;
    if (isIsolated) isolatedCount++;

    const isOpLeader = inf >= maxInf * 0.6;
    if (isOpLeader) {
      opinionLeaders.push(`${node.name}(${node.department})`);
    }

    // 브릿지 추정: 다리 역할을 하는 특정 부서 연결자
    const btw = (node.role === "manager" || node.department.includes("안전") || isOpLeader) ? 0.18 : 0.04;
    if (btw >= 0.15) {
      keyBridges.push(`${node.name}(${node.department})`);
    }

    resultNodes.push({
      id,
      name: node.name,
      department: node.department,
      role: node.role,
      degree_centrality: deg,
      betweenness_centrality: btw,
      influence_score_3deg: inf,
      is_opinion_leader: isOpLeader,
      is_isolated: isIsolated,
    });
  }

  return {
    nodes: resultNodes,
    edges: edgesRaw.map((e) => ({
      source: e.source,
      target: e.target,
      relation_type: e.relation_type,
      frequency: e.frequency || 1,
    })),
    network_density: density,
    isolated_nodes_count: isolatedCount,
    key_bridges: Array.from(new Set(keyBridges)),
    opinion_leaders: Array.from(new Set(opinionLeaders)),
  };
}
