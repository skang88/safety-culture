// frontend/src/app/api/kpi/metric/route.ts
import { NextResponse } from "next/server";
import { saveOrUpdateKpi } from "@/lib/services/kpiService";
import { KPIMetric } from "@/lib/types/models";

export async function POST(request: Request) {
  try {
    const metric: KPIMetric = await request.json();
    const saved = await saveOrUpdateKpi(metric);
    return NextResponse.json(saved);
  } catch (err: any) {
    console.error("Save KPI metric error:", err);
    return NextResponse.json({ detail: "KPI 지표 저장 중 오류가 발생했습니다." }, { status: 500 });
  }
}
