// frontend/src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { verifyPassword, createJwtToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ detail: "이메일과 비밀번호를 입력해주세요." }, { status: 400 });
    }

    const emailClean = email.trim().toLowerCase();
    const db = await getDb();

    const user = await db.collection("users").findOne({ email: emailClean });
    if (!user) {
      return NextResponse.json({ detail: "이메일 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ detail: "이메일 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    const token = await createJwtToken(user.user_id, user.email);

    return NextResponse.json({
      access_token: token,
      token_type: "bearer",
      user: {
        id: user.user_id,
        email: user.email,
        name: user.name,
        company_name: user.company_name,
        has_completed_assessment: user.has_completed_assessment || false,
        active_session_id: user.active_session_id || null,
      },
    });
  } catch (err: any) {
    console.error("Login Error:", err);
    return NextResponse.json({ detail: err.message || "로그인 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
