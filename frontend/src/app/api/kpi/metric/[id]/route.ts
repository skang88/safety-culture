// frontend/src/app/api/kpi/metric/[id]/route.ts
import { NextResponse } from "next/server";
import { saveOrUpdateKpi, deleteKpi } from "@/lib/services/kpiService";
import { KPIMetric } from "@/lib/types/models";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body: KPIMetric = await request.json();
    body.id = id;
    const updated = await saveOrUpdateKpi(body);
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Update KPI error:", err);
    return NextResponse.json({ detail: "KPI 지표 수정 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const success = await deleteKpi(id);
    if (!success) {
      return NextResponse.json({ detail: "해당 KPI 지표를 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ message: "KPI 지표가 성공적으로 삭제되었습니다.", id });
  } catch (err: any) {
    console.error("Delete KPI error:", err);
    return NextResponse.json({ detail: "KPI 지표 삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
}
