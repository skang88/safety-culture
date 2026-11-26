// frontend/src/lib/services/checklistService.ts
import { getDb } from "../mongodb";
import { ChecklistGroup, ChecklistItem } from "../types/models";
import checklistsData from "../data/checklistsData.json";

function calculateGroupCompliance(items: ChecklistItem[]): number {
  if (!items || items.length === 0) return 0.0;
  let earned = 0.0;
  for (const it of items) {
    if (it.status === "compliant") earned += 1.0;
    else if (it.status === "partial") earned += 0.5;
  }
  return Math.round((earned / items.length) * 1000) / 10;
}

export async function initChecklistsIfNeeded(): Promise<void> {
  try {
    const db = await getDb();
    const collection = db.collection("checklists");

    // 1. 기존 중복 group_id 문서 정리 (최신 updated_at 1건만 유지)
    const existingDocs = await collection
      .find({}, { projection: { _id: 1, group_id: 1, updated_at: 1 } })
      .sort({ updated_at: -1 })
      .toArray();

    const seenGroupIds = new Set<string>();
    const duplicateIds: any[] = [];
    for (const doc of existingDocs) {
      if (seenGroupIds.has(doc.group_id)) {
        duplicateIds.push(doc._id);
      } else {
        seenGroupIds.add(doc.group_id);
      }
    }
    if (duplicateIds.length > 0) {
      await collection.deleteMany({ _id: { $in: duplicateIds } });
    }

    // 2. group_id 기준 멱등적 upsert로 동시 초기화 경합(race condition) 방지
    const now = new Date();
    const ops = (checklistsData.checklistGroups as any[]).map((g) => ({
      updateOne: {
        filter: { group_id: g.group_id },
        update: {
          $setOnInsert: {
            ...g,
            compliance_rate: calculateGroupCompliance(g.items),
            created_at: now,
            updated_at: now,
          },
        },
        upsert: true,
      },
    }));

    if (ops.length > 0) {
      await collection.bulkWrite(ops);
    }
  } catch (err) {
    console.error("Failed to init Checklists in MongoDB:", err);
  }
}

export async function getChecklistGroups(category?: string | null, targetRole?: string | null): Promise<ChecklistGroup[]> {
  await initChecklistsIfNeeded();
  try {
    const db = await getDb();
    const query: Record<string, any> = {};
    if (category && category !== "all") query.category = category;
    if (targetRole && targetRole !== "all") {
      query.$or = [{ target_role: targetRole }, { target_role: "all" }];
    }

    const docs = await db.collection("checklists").find(query).toArray();
    const uniqueDocs = Array.from(new Map(docs.map((d: any) => [d.group_id, d])).values());
    return uniqueDocs.map((d: any) => ({
      group_id: d.group_id,
      title: d.title,
      source_reference: d.source_reference,
      category: d.category,
      target_role: d.target_role,
      items: d.items,
      compliance_rate: calculateGroupCompliance(d.items),
    }));
  } catch (err) {
    console.warn("MongoDB unavailable, falling back to JSON:", err);
    let groups = checklistsData.checklistGroups as any[];
    if (category && category !== "all") groups = groups.filter((g) => g.category === category);
    if (targetRole && targetRole !== "all") {
      groups = groups.filter((g) => g.target_role === targetRole || g.target_role === "all");
    }
    return groups.map((g) => ({
      ...g,
      compliance_rate: calculateGroupCompliance(g.items),
    }));
  }
}

export async function updateChecklistStatus(
  groupId: string,
  itemStatuses: Record<string, "compliant" | "partial" | "non_compliant">,
  notes?: Record<string, string>
): Promise<ChecklistGroup | null> {
  try {
    const db = await getDb();
    const doc = await db.collection("checklists").findOne({ group_id: groupId });
    if (!doc) return null;

    const updatedItems = (doc.items as ChecklistItem[]).map((it) => {
      const nextStatus = itemStatuses[it.id] ?? it.status;
      const nextNote = notes && notes[it.id] !== undefined ? notes[it.id] : it.note;
      return {
        ...it,
        status: nextStatus,
        note: nextNote,
      };
    });

    const complianceRate = calculateGroupCompliance(updatedItems);
    await db.collection("checklists").updateOne(
      { group_id: groupId },
      { $set: { items: updatedItems, compliance_rate: complianceRate, updated_at: new Date() } }
    );

    return {
      group_id: doc.group_id,
      title: doc.title,
      source_reference: doc.source_reference,
      category: doc.category,
      target_role: doc.target_role,
      items: updatedItems,
      compliance_rate: complianceRate,
    };
  } catch (err) {
    console.error("Failed to update checklist status:", err);
    return null;
  }
}

export async function getChecklistOverviewStats(): Promise<{
  total_groups: number;
  total_items: number;
  overall_compliance_rate: number;
  compliant_count: number;
  partial_count: number;
  non_compliant_count: number;
}> {
  const groups = await getChecklistGroups();
  const totalGroups = groups.length;
  let totalItems = 0;
  let compliantCount = 0;
  let partialCount = 0;
  let nonCompliantCount = 0;

  for (const g of groups) {
    for (const it of g.items) {
      totalItems++;
      if (it.status === "compliant") compliantCount++;
      else if (it.status === "partial") partialCount++;
      else nonCompliantCount++;
    }
  }

  const avgCompliance =
    totalGroups > 0 ? Math.round((groups.reduce((acc, g) => acc + g.compliance_rate, 0) / totalGroups) * 10) / 10 : 0.0;

  return {
    total_groups: totalGroups,
    total_items: totalItems,
    overall_compliance_rate: avgCompliance,
    compliant_count: compliantCount,
    partial_count: partialCount,
    non_compliant_count: nonCompliantCount,
  };
}
