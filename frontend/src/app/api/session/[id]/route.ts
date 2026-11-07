// frontend/src/app/api/session/[id]/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/services/sessionService";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const sessionRes = await getSession(id);
    if (!sessionRes) {
      return NextResponse.json({ detail: "세션을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json(sessionRes);
  } catch (err: any) {
    console.error("Get session error:", err);
    return NextResponse.json({ detail: "세션 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
