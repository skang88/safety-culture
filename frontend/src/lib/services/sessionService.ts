// frontend/src/lib/services/sessionService.ts
import { getDb } from "../mongodb";
import { CompanyProfile, AssessmentSessionResponse, AssessmentSubmission } from "../types/assessment";
import { INDUSTRY_METADATA } from "../data/industryMetadata";
import { calculateAssessmentResult } from "./raaService";
import seedData from "../data/seedData.json";
import crypto from "crypto";

const TOTAL_STEPS = 6;

function buildSessionResponse(doc: any): AssessmentSessionResponse {
  const industry = doc.company?.industry || "manufacturing";
  const benchmark = INDUSTRY_METADATA[industry] || INDUSTRY_METADATA.manufacturing;

  const currentStep = doc.current_step || 0;
  const progressPercent = Math.min(100, Math.round(((currentStep + 1) / TOTAL_STEPS) * 100));

  let assessmentResult = null;
  const answersObj: Record<string, number> = doc.answers || {};

  if (doc.is_completed || Object.keys(answersObj).length >= 10) {
    const answersList = Object.entries(answersObj).map(([itemId, score]) => ({
      item_id: itemId,
      score: Number(score),
    }));

    const submission: AssessmentSubmission = {
      respondent_id: doc.session_id,
      respondent_name: doc.company?.evaluator_name || "평가자",
      department: "안전보건팀",
      role: doc.company?.evaluator_role || "manager",
      answers: answersList,
    };

    assessmentResult = calculateAssessmentResult([submission]);
  }

  return {
    session_id: doc.session_id,
    user_id: doc.user_id || null,
    company: doc.company,
    current_step: currentStep,
    total_steps: TOTAL_STEPS,
    answers: answersObj,
    progress_percent: progressPercent,
    is_completed: doc.is_completed || false,
    industry_benchmark: benchmark,
    created_at: doc.created_at ? new Date(doc.created_at).toISOString() : new Date().toISOString(),
    updated_at: doc.updated_at ? new Date(doc.updated_at).toISOString() : new Date().toISOString(),
    assessment_result: assessmentResult,
  };
}

export async function createSession(
  company: CompanyProfile,
  userId?: string | null
): Promise<AssessmentSessionResponse> {
  const sessionId = `sess_${crypto.randomBytes(6).toString("hex")}`;
  const now = new Date();

  const sessionData = {
    session_id: sessionId,
    user_id: userId || null,
    company,
    current_step: 0,
    answers: {},
    is_completed: false,
    created_at: now,
    updated_at: now,
  };

  try {
    const db = await getDb();
    await db.collection("sessions").insertOne(sessionData);
    if (userId) {
      await db.collection("users").updateOne(
        { user_id: userId },
        { $set: { active_session_id: sessionId, updated_at: now } }
      );
    }
  } catch (err) {
    console.error("Failed to insert session into MongoDB:", err);
  }

  return buildSessionResponse(sessionData);
}

export async function getSession(sessionId: string): Promise<AssessmentSessionResponse | null> {
  try {
    const db = await getDb();
    const doc = await db.collection("sessions").findOne({ session_id: sessionId });
    if (!doc) return null;
    return buildSessionResponse(doc);
  } catch (err) {
    console.error("Failed to get session from MongoDB:", err);
    return null;
  }
}

export async function saveSessionProgress(
  sessionId: string,
  currentStep: number,
  answers: Record<string, number>,
  isCompleted: boolean = false
): Promise<AssessmentSessionResponse | null> {
  try {
    const db = await getDb();
    const doc = await db.collection("sessions").findOne({ session_id: sessionId });
    if (!doc) return null;

    const mergedAnswers = { ...(doc.answers || {}), ...answers };
    const now = new Date();

    await db.collection("sessions").updateOne(
      { session_id: sessionId },
      {
        $set: {
          current_step: currentStep,
          answers: mergedAnswers,
          is_completed: isCompleted,
          updated_at: now,
        },
      }
    );

    if (isCompleted && doc.user_id) {
      await db.collection("users").updateOne(
        { user_id: doc.user_id },
        { $set: { has_completed_assessment: true, updated_at: now } }
      );
    }

    const updated = await db.collection("sessions").findOne({ session_id: sessionId });
    return buildSessionResponse(updated);
  } catch (err) {
    console.error("Failed to save session progress in MongoDB:", err);
    return null;
  }
}

export async function getLatestSessionForUser(userId: string): Promise<AssessmentSessionResponse | null> {
  try {
    const db = await getDb();
    const user = await db.collection("users").findOne({ user_id: userId });
    if (user?.active_session_id) {
      const sess = await getSession(user.active_session_id);
      if (sess) return sess;
    }

    const doc = await db.collection("sessions").find({ user_id: userId }).sort({ updated_at: -1 }).limit(1).toArray();
    if (doc.length > 0) {
      return buildSessionResponse(doc[0]);
    }
    return null;
  } catch (err) {
    console.error("Failed to get latest session for user:", err);
    return null;
  }
}
