// frontend/src/app/api/checklists/groups/route.ts
import { NextResponse } from "next/server";
import { getChecklistGroups } from "@/lib/services/checklistService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const targetRole = searchParams.get("target_role");

    const groups = await getChecklistGroups(category, targetRole);
    return NextResponse.json(groups);
  } catch (err: any) {
    console.error("Checklist groups error:", err);
    return NextResponse.json({ detail: "체크리스트 그룹 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
