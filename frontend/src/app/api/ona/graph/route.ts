// frontend/src/app/api/ona/graph/route.ts
import { NextResponse } from "next/server";
import { analyzeOnaNetwork } from "@/lib/services/onaService";

export async function GET() {
  try {
    const data = analyzeOnaNetwork();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("ONA graph error:", err);
    return NextResponse.json({ detail: "ONA 네트워크 분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
