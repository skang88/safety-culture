// frontend/src/app/api/assessment/items/route.ts
import { NextResponse } from "next/server";
import seedData from "@/lib/data/seedData.json";

export async function GET() {
  return NextResponse.json(seedData.assessmentItems);
}
