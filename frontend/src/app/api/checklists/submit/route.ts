// frontend/src/app/api/checklists/submit/route.ts
import { NextResponse } from "next/server";
import { updateChecklistStatus } from "@/lib/services/checklistService";

export async function POST(request: Request) {
  try {
    const { group_id, item_statuses, notes } = await request.json();
    const updated = await updateChecklistStatus(group_id, item_statuses, notes);
    if (!updated) {
      return NextResponse.json({ detail: `해당 체크리스트 그룹(${group_id})을 찾을 수 없습니다.` }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Checklist submit error:", err);
    return NextResponse.json({ detail: "체크리스트 상태 저장 중 오류가 발생했습니다." }, { status: 500 });
  }
}
