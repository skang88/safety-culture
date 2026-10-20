from typing import List, Dict, Any, Optional
from backend.app.models.schemas import ChecklistGroup, ChecklistItem, ChecklistSubmission
from backend.app.data.checklists_data import CHECKLIST_GROUPS_SEED

# 인메모리 체크리스트 저장소
_CHECKLIST_STORE: List[Dict[str, Any]] = [dict(g) for g in CHECKLIST_GROUPS_SEED]

def get_checklist_groups(category: Optional[str] = None, target_role: Optional[str] = None) -> List[ChecklistGroup]:
    results: List[ChecklistGroup] = []

    for g in _CHECKLIST_STORE:
        if category and category != "all" and g["category"] != category:
            continue
        if target_role and target_role != "all" and g["target_role"] != target_role and g["target_role"] != "all":
            continue

        items = [ChecklistItem(**it) for it in g["items"]]
        # 준수율 계산 (compliant: 1.0, partial: 0.5, non_compliant: 0.0)
        total_points = len(items) * 1.0
        earned_points = 0.0
        for it in items:
            if it.status == "compliant":
                earned_points += 1.0
            elif it.status == "partial":
                earned_points += 0.5

        compliance_rate = round((earned_points / total_points * 100.0), 1) if total_points > 0 else 0.0

        results.append(ChecklistGroup(
            group_id=g["group_id"],
            title=g["title"],
            source_reference=g["source_reference"],
            category=g["category"],
            target_role=g["target_role"],
            items=items,
            compliance_rate=compliance_rate
        ))

    return results

def update_checklist_status(submission: ChecklistSubmission) -> ChecklistGroup:
    global _CHECKLIST_STORE
    for g in _CHECKLIST_STORE:
        if g["group_id"] == submission.group_id:
            for it in g["items"]:
                if it["id"] in submission.item_statuses:
                    it["status"] = submission.item_statuses[it["id"]]
                if submission.notes and it["id"] in submission.notes:
                    it["note"] = submission.notes[it["id"]]

            # 재계산 후 반환
            groups = get_checklist_groups()
            for updated in groups:
                if updated.group_id == submission.group_id:
                    return updated

    raise ValueError(f"Group ID {submission.group_id} not found")

def get_checklist_overview_stats() -> Dict[str, Any]:
    groups = get_checklist_groups()
    total_groups = len(groups)
    total_items = sum(len(g.items) for g in groups)

    avg_compliance = sum(g.compliance_rate for g in groups) / total_groups if total_groups > 0 else 0.0

    compliant_count = 0
    partial_count = 0
    non_compliant_count = 0

    for g in groups:
        for it in g.items:
            if it.status == "compliant":
                compliant_count += 1
            elif it.status == "partial":
                partial_count += 1
            else:
                non_compliant_count += 1

    return {
        "total_groups": total_groups,
        "total_items": total_items,
        "overall_compliance_rate": round(avg_compliance, 1),
        "compliant_count": compliant_count,
        "partial_count": partial_count,
        "non_compliant_count": non_compliant_count,
    }
