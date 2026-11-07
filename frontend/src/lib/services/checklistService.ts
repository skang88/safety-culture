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
    const count = await db.collection("checklists").countDocuments();
    if (count === 0) {
      const initialGroups = (checklistsData.checklistGroups as any[]).map((g) => ({
        ...g,
        compliance_rate: calculateGroupCompliance(g.items),
        created_at: new Date(),
        updated_at: new Date(),
      }));
      await db.collection("checklists").insertMany(initialGroups);
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
    return docs.map((d: any) => ({
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
