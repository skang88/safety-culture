// frontend/src/app/api/session/start/route.ts
import { NextResponse } from "next/server";
import { createSession } from "@/lib/services/sessionService";
import { verifyJwtToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const payload = await verifyJwtToken(authHeader.split(" ")[1]);
      if (payload) {
        userId = payload.sub;
      }
    }

    const { company } = await request.json();
    const sessionRes = await createSession(company, userId);
    return NextResponse.json(sessionRes);
  } catch (err: any) {
    console.error("Session start error:", err);
    return NextResponse.json({ detail: "세션 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
