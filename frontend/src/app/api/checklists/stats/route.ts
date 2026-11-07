// frontend/src/app/api/checklists/stats/route.ts
import { NextResponse } from "next/server";
import { getChecklistOverviewStats } from "@/lib/services/checklistService";

export async function GET() {
  try {
    const stats = await getChecklistOverviewStats();
    return NextResponse.json(stats);
  } catch (err: any) {
    console.error("Checklist stats error:", err);
    return NextResponse.json({ detail: "체크리스트 통계 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
