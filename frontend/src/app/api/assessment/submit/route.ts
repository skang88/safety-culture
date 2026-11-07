// frontend/src/app/api/assessment/submit/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { AssessmentSubmission } from "@/lib/types/assessment";

export async function POST(request: Request) {
  try {
    const body: AssessmentSubmission = await request.json();
    const db = await getDb();
    await db.collection("assessment_submissions").insertOne({
      ...body,
      created_at: new Date(),
    });

    return NextResponse.json({
      message: "진단 응답이 성공적으로 제출되었습니다.",
      submission_id: body.respondent_id,
    });
  } catch (err: any) {
    console.error("Submit assessment error:", err);
    return NextResponse.json({ detail: "진단 제출 중 오류가 발생했습니다." }, { status: 500 });
  }
}
