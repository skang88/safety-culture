// frontend/src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { hashPassword, createJwtToken } from "@/lib/auth";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email, password, name, company_name } = await request.json();

    if (!email || !password || !name || !company_name) {
      return NextResponse.json({ detail: "모든 필수 입력값을 작성해주세요." }, { status: 400 });
    }

    const emailClean = email.trim().toLowerCase();
    const db = await getDb();

    const existing = await db.collection("users").findOne({ email: emailClean });
    if (existing) {
      return NextResponse.json({ detail: "이미 등록된 이메일 주소입니다." }, { status: 400 });
    }

    const userId = `user_${crypto.randomBytes(6).toString("hex")}`;
    const hashedPassword = await hashPassword(password);
    const now = new Date();

    const userDoc = {
      user_id: userId,
      email: emailClean,
      password: hashedPassword,
      name: name.trim(),
      company_name: company_name.trim(),
      has_completed_assessment: false,
      active_session_id: null,
      created_at: now,
      updated_at: now,
    };

    await db.collection("users").insertOne(userDoc);

    const token = await createJwtToken(userId, emailClean);

    return NextResponse.json({
      access_token: token,
      token_type: "bearer",
      user: {
        id: userId,
        email: emailClean,
        name: userDoc.name,
        company_name: userDoc.company_name,
        has_completed_assessment: false,
        active_session_id: null,
      },
    });
  } catch (err: any) {
    console.error("Register Error:", err);
    return NextResponse.json({ detail: err.message || "회원가입 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
