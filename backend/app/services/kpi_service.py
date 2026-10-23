import datetime
from typing import List, Dict, Any, Optional
from backend.app.models.schemas import KPIMetric, KPISummary, KPIValueUpdate
from backend.app.data.seed_data import DEFAULT_KPI_METRICS
from backend.app.core.db import get_database, mongo_db

# 전역 메모리 저장소 (MongoDB 미연결 시 폴백 및 캐시)
_KPI_STORE: List[KPIMetric] = [KPIMetric(**k) for k in DEFAULT_KPI_METRICS]

async def _sync_from_mongo_if_needed():
    global _KPI_STORE
    if mongo_db.is_connected:
        try:
            db = get_database()
            count = await db.kpi_metrics.count_documents({})
            if count == 0:
                # 초기 시드 데이터 삽입
                await db.kpi_metrics.insert_many([k.dict() for k in _KPI_STORE])
            else:
                cursor = db.kpi_metrics.find({})
                docs = await cursor.to_list(length=200)
                _KPI_STORE = [KPIMetric(**{k: v for k, v in doc.items() if k != "_id"}) for doc in docs]
        except Exception:
            pass

def _calculate_summary() -> KPISummary:
    stage_breakdown = {"planning": 0, "prevention": 0, "preparedness": 0, "response": 0, "recovery": 0}
    stage_sums = {"planning": 0.0, "prevention": 0.0, "preparedness": 0.0, "response": 0.0, "recovery": 0.0}
    stage_counts = {"planning": 0, "prevention": 0, "preparedness": 0, "response": 0, "recovery": 0}
    
    inherent_cnt = 0
    collab_cnt = 0
    inherent_sum = 0.0
    collab_sum = 0.0
    
    dept_map: Dict[str, List[KPIMetric]] = {}

    for kpi in _KPI_STORE:
        stage = kpi.lifecycle_stage
        p_rate = float(kpi.progress_rate or 0.0)
        
        if stage in stage_breakdown:
            stage_breakdown[stage] += 1
            stage_sums[stage] += p_rate
            stage_counts[stage] += 1
        
        if kpi.type == "inherent":
            inherent_cnt += 1
            inherent_sum += p_rate
        else:
            collab_cnt += 1
            collab_sum += p_rate

        dept = kpi.department
        if dept not in dept_map:
            dept_map[dept] = []
        dept_map[dept].append(kpi)

    inherent_avg = round(inherent_sum / inherent_cnt, 1) if inherent_cnt > 0 else 0.0
    collab_avg = round(collab_sum / collab_cnt, 1) if collab_cnt > 0 else 0.0
    
    # 7:3 가중치 반영 종합 달성률
    if inherent_cnt > 0 and collab_cnt > 0:
        overall_progress = round((inherent_avg * 0.7) + (collab_avg * 0.3), 1)
    elif len(_KPI_STORE) > 0:
        total_p = sum(float(k.progress_rate or 0.0) for k in _KPI_STORE)
        overall_progress = round(total_p / len(_KPI_STORE), 1)
    else:
        overall_progress = 0.0

    stage_progress = {
        st: round(stage_sums[st] / stage_counts[st], 1) if stage_counts[st] > 0 else 0.0
        for st in stage_breakdown
    }

    return KPISummary(
        total_metrics=len(_KPI_STORE),
        inherent_count=inherent_cnt,
        collaborative_count=collab_cnt,
        stage_breakdown=stage_breakdown,
        department_summary=dept_map,
        overall_progress=overall_progress,
        inherent_avg_progress=inherent_avg,
        collaborative_avg_progress=collab_avg,
        stage_progress=stage_progress
    )

def get_kpi_summary_sync() -> KPISummary:
    return _calculate_summary()

async def get_kpi_summary() -> KPISummary:
    await _sync_from_mongo_if_needed()
    return _calculate_summary()

async def add_or_update_kpi(metric: KPIMetric) -> KPIMetric:
    global _KPI_STORE
    metric.updated_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # 메모리 갱신
    found = False
    for idx, item in enumerate(_KPI_STORE):
        if item.id == metric.id:
            _KPI_STORE[idx] = metric
            found = True
            break
    if not found:
        _KPI_STORE.append(metric)

    # MongoDB 갱신
    if mongo_db.is_connected:
        try:
            db = get_database()
            await db.kpi_metrics.update_one(
                {"id": metric.id},
                {"$set": metric.dict()},
                upsert=True
            )
        except Exception:
            pass

    return metric

async def update_kpi_value(metric_id: str, update_data: KPIValueUpdate) -> KPIMetric:
    global _KPI_STORE
    target_metric: Optional[KPIMetric] = None
    target_idx = -1

    for idx, item in enumerate(_KPI_STORE):
        if item.id == metric_id:
            target_metric = item
            target_idx = idx
            break

    if not target_metric:
        raise ValueError(f"KPI 지표(ID: {metric_id})를 찾을 수 없습니다.")

    target_metric.current_value = float(update_data.current_value)
    if update_data.progress_rate is not None:
        target_metric.progress_rate = float(update_data.progress_rate)
    if update_data.target_value is not None:
        target_metric.target_value = update_data.target_value
    if update_data.note is not None:
        target_metric.note = update_data.note

    target_metric.updated_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    _KPI_STORE[target_idx] = target_metric

    if mongo_db.is_connected:
        try:
            db = get_database()
            await db.kpi_metrics.update_one(
                {"id": metric_id},
                {"$set": target_metric.dict()}
            )
        except Exception:
            pass

    return target_metric

async def delete_kpi(metric_id: str) -> bool:
    global _KPI_STORE
    orig_len = len(_KPI_STORE)
    _KPI_STORE = [k for k in _KPI_STORE if k.id != metric_id]

    if mongo_db.is_connected:
        try:
            db = get_database()
            await db.kpi_metrics.delete_one({"id": metric_id})
        except Exception:
            pass

    return len(_KPI_STORE) < orig_len

async def reset_kpis() -> KPISummary:
    global _KPI_STORE
    _KPI_STORE = [KPIMetric(**k) for k in DEFAULT_KPI_METRICS]

    if mongo_db.is_connected:
        try:
            db = get_database()
            await db.kpi_metrics.delete_many({})
            await db.kpi_metrics.insert_many([k.dict() for k in _KPI_STORE])
        except Exception:
            pass

    return _calculate_summary()
