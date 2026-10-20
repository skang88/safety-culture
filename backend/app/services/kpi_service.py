from typing import List, Dict, Any
from backend.app.models.schemas import KPIMetric, KPISummary
from backend.app.data.seed_data import DEFAULT_KPI_METRICS

# 전역 메모리 저장소 (향후 DB 저장 연동)
_KPI_STORE: List[KPIMetric] = [KPIMetric(**k) for k in DEFAULT_KPI_METRICS]

def get_kpi_summary() -> KPISummary:
    stage_breakdown = {"prevention": 0, "preparedness": 0, "response": 0, "recovery": 0}
    inherent_cnt = 0
    collab_cnt = 0
    dept_map: Dict[str, List[KPIMetric]] = {}

    for kpi in _KPI_STORE:
        stage = kpi.lifecycle_stage
        if stage in stage_breakdown:
            stage_breakdown[stage] += 1
        
        if kpi.type == "inherent":
            inherent_cnt += 1
        else:
            collab_cnt += 1

        dept = kpi.department
        if dept not in dept_map:
            dept_map[dept] = []
        dept_map[dept].append(kpi)

    return KPISummary(
        total_metrics=len(_KPI_STORE),
        inherent_count=inherent_cnt,
        collaborative_count=collab_cnt,
        stage_breakdown=stage_breakdown,
        department_summary=dept_map
    )

def add_or_update_kpi(metric: KPIMetric) -> KPIMetric:
    global _KPI_STORE
    for idx, item in enumerate(_KPI_STORE):
        if item.id == metric.id:
            _KPI_STORE[idx] = metric
            return metric
    _KPI_STORE.append(metric)
    return metric
