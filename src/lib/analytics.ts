import { prisma } from './prisma';

export async function computeQualityTrend(wardId: string, days: number) {
  const since = new Date(Date.now() - days * 86400000);

  const handoffs = await prisma.handoff.findMany({
    where: { wardId, createdAt: { gte: since } },
    orderBy: { createdAt: 'asc' },
  });

  const dailyMap = new Map<string, number[]>();
  handoffs.forEach((h) => {
    const date = h.createdAt.toISOString().slice(0, 10);
    if (!dailyMap.has(date)) dailyMap.set(date, []);
    dailyMap.get(date)!.push(h.qualityScore);
  });

  return Array.from(dailyMap.entries()).map(([date, scores]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    count: scores.length,
  }));
}

export async function computeFlagDistribution(wardId: string) {
  const handoffs = await prisma.handoff.findMany({
    where: { wardId },
    select: { id: true },
  });

  const handoffIds = handoffs.map((h) => h.id);

  const flags = await prisma.flag.findMany({
    where: { handoffId: { in: handoffIds } },
  });

  const distribution: Record<string, number> = {
    'Medication Discrepancy': 0,
    'Lab Result Pending': 0,
    'Code Status Missing': 0,
    'Escalation Threshold Not Set': 0,
    'Allergy Not Documented': 0,
  };

  flags.forEach((f) => {
    const title = f.title.toLowerCase();
    if (title.includes('medication')) distribution['Medication Discrepancy']++;
    else if (title.includes('lab') || title.includes('result')) distribution['Lab Result Pending']++;
    else if (title.includes('code status')) distribution['Code Status Missing']++;
    else if (title.includes('escalation') || title.includes('threshold'))
      distribution['Escalation Threshold Not Set']++;
    else if (title.includes('allergy')) distribution['Allergy Not Documented']++;
  });

  return Object.entries(distribution).map(([type, count]) => ({ type, count }));
}

export async function computeClinicianPerformance(wardId: string) {
  const users = await prisma.user.findMany({
    select: { id: true, name: true },
  });

  const results = await Promise.all(
    users.map(async (user) => {
      const handoffs = await prisma.handoff.findMany({
        where: { clinicianId: user.id, wardId },
        include: { flags: true },
      });

      if (handoffs.length === 0) {
        return {
          name: user.name,
          handoffs: 0,
          avgQuality: 0,
          flagsGenerated: 0,
          completionRate: 0,
        };
      }

      const flagsCount = handoffs.reduce((sum, h) => sum + h.flags.length, 0);
      const avgQuality = Math.round(
        handoffs.reduce((sum, h) => sum + h.qualityScore, 0) / handoffs.length
      );
      const completed = handoffs.filter((h) => h.fhirWriteStatus === 'success').length;

      return {
        name: user.name,
        handoffs: handoffs.length,
        avgQuality,
        flagsGenerated: flagsCount,
        completionRate: Math.round((completed / handoffs.length) * 100),
      };
    })
  );

  return results.filter((r) => r.handoffs > 0);
}
