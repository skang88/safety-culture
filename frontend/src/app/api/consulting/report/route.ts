// frontend/src/app/api/consulting/report/route.ts
import { NextResponse } from "next/server";
import { generateConsultingReport } from "@/lib/services/consultingService";
import { getKpiSummary } from "@/lib/services/kpiService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgName = searchParams.get("org_name") || "안전문화 혁신 추진단";

    let kpiProgress = 88.0;
    try {
      const kpis = await getKpiSummary();
      kpiProgress = kpis.overall_progress || 88.0;
    } catch {}

    const report = generateConsultingReport(orgName, kpiProgress);
    return NextResponse.json(report);
  } catch (err: any) {
    console.error("Consulting report error:", err);
    return NextResponse.json({ detail: "컨설팅 리포트 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
