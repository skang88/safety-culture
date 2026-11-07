// frontend/src/app/api/session/[id]/save/route.ts
import { NextResponse } from "next/server";
import { saveSessionProgress } from "@/lib/services/sessionService";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { current_step, answers, is_completed } = await request.json();

    const sessionRes = await saveSessionProgress(id, current_step, answers, is_completed);
    if (!sessionRes) {
      return NextResponse.json({ detail: "세션 저장에 실패했습니다." }, { status: 404 });
    }
    return NextResponse.json(sessionRes);
  } catch (err: any) {
    console.error("Save session error:", err);
    return NextResponse.json({ detail: "진단 세션 저장 중 오류가 발생했습니다." }, { status: 500 });
  }
}
