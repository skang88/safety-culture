// frontend/src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { verifyJwtToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ detail: "인증 토큰이 필요합니다." }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyJwtToken(token);
    if (!payload) {
      return NextResponse.json({ detail: "유효하지 않거나 만료된 토큰입니다." }, { status: 401 });
    }

    const db = await getDb();
    const user = await db.collection("users").findOne({ user_id: payload.sub });
    if (!user) {
      return NextResponse.json({ detail: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({
      id: user.user_id,
      email: user.email,
      name: user.name,
      company_name: user.company_name,
      has_completed_assessment: user.has_completed_assessment || false,
      active_session_id: user.active_session_id || null,
    });
  } catch (err: any) {
    console.error("Auth me Error:", err);
    return NextResponse.json({ detail: "인증 확인 중 오류가 발생했습니다." }, { status: 500 });
  }
}
