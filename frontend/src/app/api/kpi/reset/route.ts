// frontend/src/app/api/kpi/reset/route.ts
import { NextResponse } from "next/server";
import { resetKpis } from "@/lib/services/kpiService";

export async function POST() {
  try {
    const summary = await resetKpis();
    return NextResponse.json(summary);
  } catch (err: any) {
    console.error("Reset KPIs error:", err);
    return NextResponse.json({ detail: "KPI 초기화 중 오류가 발생했습니다." }, { status: 500 });
  }
}
