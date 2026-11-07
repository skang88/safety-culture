// frontend/src/lib/services/kpiService.ts
import { getDb } from "../mongodb";
import { KPIMetric, KPISummary } from "../types/models";
import seedData from "../data/seedData.json";

function calculateProgress(target: number, current: number): number {
  if (target <= 0) return 100.0;
  return Math.min(100.0, Math.round((current / target) * 1000) / 10);
}

export async function initKpisIfNeeded(): Promise<void> {
  try {
    const db = await getDb();
    const count = await db.collection("kpi_metrics").countDocuments();
    if (count === 0) {
      const initialMetrics = (seedData.kpiMetrics as any[]).map((k) => ({
        ...k,
        progress_rate: calculateProgress(k.target_value, k.current_value),
        created_at: new Date(),
        updated_at: new Date(),
      }));
      await db.collection("kpi_metrics").insertMany(initialMetrics);
    }
  } catch (err) {
    console.error("Failed to init KPIs in MongoDB:", err);
  }
}

export function computeKpiSummary(metrics: KPIMetric[]): KPISummary {
  const stageBreakdown: Record<string, number> = {
    planning: 0,
    prevention: 0,
    preparedness: 0,
    response: 0,
    recovery: 0,
  };
  const stageSums: Record<string, number> = {
    planning: 0.0,
    prevention: 0.0,
    preparedness: 0.0,
    response: 0.0,
    recovery: 0.0,
  };
  const stageCounts: Record<string, number> = {
    planning: 0,
    prevention: 0,
    preparedness: 0,
    response: 0,
    recovery: 0,
  };

  let inherentCnt = 0;
  let collabCnt = 0;
  let inherentSum = 0.0;
  let collabSum = 0.0;

  for (const kpi of metrics) {
    const stage = kpi.lifecycle_stage;
    const pRate = Number(kpi.progress_rate ?? calculateProgress(kpi.target_value, kpi.current_value));

    if (stage in stageBreakdown) {
      stageBreakdown[stage] += 1;
      stageSums[stage] += pRate;
      stageCounts[stage] += 1;
    }

    if (kpi.type === "inherent") {
      inherentCnt++;
      inherentSum += pRate;
    } else {
      collabCnt++;
      collabSum += pRate;
    }
  }

  const inherentAvg = inherentCnt > 0 ? Math.round((inherentSum / inherentCnt) * 10) / 10 : 0.0;
  const collabAvg = collabCnt > 0 ? Math.round((collabSum / collabCnt) * 10) / 10 : 0.0;

  let overallProgress = 0.0;
  if (inherentCnt > 0 && collabCnt > 0) {
    overallProgress = Math.round((inherentAvg * 0.7 + collabAvg * 0.3) * 10) / 10;
  } else if (metrics.length > 0) {
    const totalP = metrics.reduce(
      (acc, k) => acc + Number(k.progress_rate ?? calculateProgress(k.target_value, k.current_value)),
      0
    );
    overallProgress = Math.round((totalP / metrics.length) * 10) / 10;
  }

  const stageProgress: Record<string, number> = {};
  for (const st of Object.keys(stageSums)) {
    stageProgress[st] = stageCounts[st] > 0 ? Math.round((stageSums[st] / stageCounts[st]) * 10) / 10 : 0.0;
  }

  return {
    total_metrics: metrics.length,
    inherent_metrics_count: inherentCnt,
    collaborative_metrics_count: collabCnt,
    overall_progress: overallProgress,
    inherent_average_progress: inherentAvg,
    collaborative_average_progress: collabAvg,
    stage_distribution: stageBreakdown,
    stage_progress: stageProgress,
    metrics,
  };
}

export async function getKpiSummary(): Promise<KPISummary> {
  await initKpisIfNeeded();
  try {
    const db = await getDb();
    const docs = await db.collection("kpi_metrics").find({}).toArray();
    const metrics: KPIMetric[] = docs.map((d: any) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      lifecycle_stage: d.lifecycle_stage,
      department: d.department,
      partner_organization: d.partner_organization,
      target_value: d.target_value,
      current_value: d.current_value,
      unit: d.unit,
      weight: d.weight,
      progress_rate: d.progress_rate ?? calculateProgress(d.target_value, d.current_value),
      statutory_basis: d.statutory_basis,
      chapter_reference: d.chapter_reference,
      description: d.description,
    }));
    return computeKpiSummary(metrics);
  } catch (err) {
    console.warn("MongoDB unavailable, falling back to seed data:", err);
    const seed = seedData.kpiMetrics as any[];
    const metrics: KPIMetric[] = seed.map((k) => ({
      ...k,
      progress_rate: calculateProgress(k.target_value, k.current_value),
    }));
    return computeKpiSummary(metrics);
  }
}

export async function saveOrUpdateKpi(metric: KPIMetric): Promise<KPIMetric> {
  metric.progress_rate = calculateProgress(metric.target_value, metric.current_value);
  try {
    const db = await getDb();
    await db.collection("kpi_metrics").updateOne(
      { id: metric.id },
      { $set: { ...metric, updated_at: new Date() } },
      { upsert: true }
    );
  } catch (err) {
    console.error("Failed to save KPI in MongoDB:", err);
  }
  return metric;
}

export async function updateKpiValue(metricId: string, currentValue: number): Promise<KPIMetric | null> {
  try {
    const db = await getDb();
    const existing = await db.collection("kpi_metrics").findOne({ id: metricId });
    if (!existing) return null;

    const progressRate = calculateProgress(existing.target_value, currentValue);
    await db.collection("kpi_metrics").updateOne(
      { id: metricId },
      { $set: { current_value: currentValue, progress_rate: progressRate, updated_at: new Date() } }
    );

    const updated = await db.collection("kpi_metrics").findOne({ id: metricId });
    return {
      id: updated!.id,
      name: updated!.name,
      type: updated!.type,
      lifecycle_stage: updated!.lifecycle_stage,
      department: updated!.department,
      partner_organization: updated!.partner_organization,
      target_value: updated!.target_value,
      current_value: updated!.current_value,
      unit: updated!.unit,
      weight: updated!.weight,
      progress_rate: updated!.progress_rate,
      statutory_basis: updated!.statutory_basis,
      chapter_reference: updated!.chapter_reference,
      description: updated!.description,
    };
  } catch (err) {
    console.error("Failed to update KPI value:", err);
    return null;
  }
}

export async function deleteKpi(metricId: string): Promise<boolean> {
  try {
    const db = await getDb();
    const res = await db.collection("kpi_metrics").deleteOne({ id: metricId });
    return res.deletedCount > 0;
  } catch (err) {
    console.error("Failed to delete KPI:", err);
    return false;
  }
}

export async function resetKpis(): Promise<KPISummary> {
  try {
    const db = await getDb();
    await db.collection("kpi_metrics").deleteMany({});
    const initialMetrics = (seedData.kpiMetrics as any[]).map((k) => ({
      ...k,
      progress_rate: calculateProgress(k.target_value, k.current_value),
      created_at: new Date(),
      updated_at: new Date(),
    }));
    await db.collection("kpi_metrics").insertMany(initialMetrics);
  } catch (err) {
    console.error("Failed to reset KPIs:", err);
  }
  return getKpiSummary();
}
