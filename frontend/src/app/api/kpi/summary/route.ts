// frontend/src/app/api/kpi/summary/route.ts
import { NextResponse } from "next/server";
import { getKpiSummary } from "@/lib/services/kpiService";

export async function GET() {
  try {
    const summary = await getKpiSummary();
    return NextResponse.json(summary);
  } catch (err: any) {
    console.error("KPI summary error:", err);
    return NextResponse.json({ detail: "KPI 요약 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
