// frontend/src/app/api/kpi/metric/[id]/value/route.ts
import { NextResponse } from "next/server";
import { updateKpiValue } from "@/lib/services/kpiService";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { current_value } = await request.json();
    const updated = await updateKpiValue(id, Number(current_value));
    if (!updated) {
      return NextResponse.json({ detail: "해당 KPI 지표를 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Patch KPI value error:", err);
    return NextResponse.json({ detail: "KPI 실적 업데이트 중 오류가 발생했습니다." }, { status: 500 });
  }
}
