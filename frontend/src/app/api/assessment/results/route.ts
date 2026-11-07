// frontend/src/app/api/assessment/results/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { calculateAssessmentResult } from "@/lib/services/raaService";
import { AssessmentSubmission } from "@/lib/types/assessment";

export async function GET() {
  try {
    const db = await getDb();
    const docs = await db.collection("assessment_submissions").find({}).toArray();

    const submissions: AssessmentSubmission[] = docs.map((d: any) => ({
      respondent_id: d.respondent_id,
      respondent_name: d.respondent_name,
      department: d.department,
      role: d.role,
      answers: d.answers,
    }));

    const result = calculateAssessmentResult(submissions);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Assessment results error:", err);
    const fallback = calculateAssessmentResult([]);
    return NextResponse.json(fallback);
  }
}
