// frontend/src/app/api/session/user/latest/route.ts
import { NextResponse } from "next/server";
import { getLatestSessionForUser } from "@/lib/services/sessionService";
import { verifyJwtToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ detail: "인증 토큰이 필요합니다." }, { status: 401 });
    }

    const payload = await verifyJwtToken(authHeader.split(" ")[1]);
    if (!payload) {
      return NextResponse.json({ detail: "유효하지 않은 토큰입니다." }, { status: 401 });
    }

    const sessionRes = await getLatestSessionForUser(payload.sub);
    return NextResponse.json(sessionRes);
  } catch (err: any) {
    console.error("Get latest session error:", err);
    return NextResponse.json({ detail: "세션 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
