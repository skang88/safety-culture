// frontend/src/app/api/session/list/route.ts
import { NextResponse } from "next/server";
import { listSessions } from "@/lib/services/sessionService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessions = await listSessions(30);
    return NextResponse.json(sessions);
  } catch (err: any) {
    console.error("List sessions error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
