from backend.app.services.raa_service import calculate_assessment_result
from backend.app.services.ona_service import analyze_ona_network
from backend.app.services.kpi_service import get_kpi_summary
from backend.app.services.consulting_service import generate_consulting_report

def test_raa_service_benchmark():
    result = calculate_assessment_result([])
    assert result.raa_scores.balance_index > 0
    assert result.raa_scores.responsibility >= 0
    assert result.raa_scores.authority >= 0
    assert result.raa_scores.accountability >= 0
    assert len(result.key_findings) > 0

def test_ona_network_analysis():
    graph_data = analyze_ona_network()
    assert len(graph_data.nodes) == 12
    assert len(graph_data.edges) > 0
    assert graph_data.network_density > 0
    assert len(graph_data.opinion_leaders) > 0

def test_kpi_summary():
    kpi_summary = get_kpi_summary()
    assert kpi_summary.total_metrics == 6
    assert kpi_summary.inherent_count == 4
    assert kpi_summary.collaborative_count == 2
    assert "prevention" in kpi_summary.stage_breakdown

def test_consulting_report():
    report = generate_consulting_report("테스트조직")
    assert report.organization_name == "테스트조직"
    assert report.overall_safety_index > 0
    assert len(report.roadmap) == 3

def test_checklist_service():
    from backend.app.services.checklist_service import get_checklist_groups, get_checklist_overview_stats
    groups = get_checklist_groups()
    assert len(groups) >= 8
    stats = get_checklist_overview_stats()
    assert stats["total_items"] > 50
    assert stats["overall_compliance_rate"] > 0

