import type { SourceSignal } from "@/types/radar";

export function calcVelocityScore(signals: SourceSignal[]): number {
  if (signals.length < 2) return 0;
  const sorted = [...signals].sort((a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime());
  const first = new Date(sorted[0].observedAt).getTime();
  const last = new Date(sorted[sorted.length - 1].observedAt).getTime();
  const hoursDiff = Math.max((last - first) / 3600000, 1);
  const avgScore = sorted.reduce((s, x) => s + x.normalizedScore, 0) / sorted.length;
  return Math.min(Math.round((avgScore / hoursDiff) * 10), 100);
}

export function calcCrossSourceScore(signals: SourceSignal[]): number {
  const sources = new Set(signals.map((s) => s.source));
  return Math.min(sources.size * 25, 100);
}

export function calcNoveltyScore(firstSeenAt: string): number {
  const hoursAgo = (Date.now() - new Date(firstSeenAt).getTime()) / 3600000;
  if (hoursAgo < 6) return 100;
  if (hoursAgo < 24) return 80;
  if (hoursAgo < 72) return 50;
  if (hoursAgo < 168) return 25;
  return 10;
}

export function calcDecayScore(lastSeenAt: string): number {
  const hoursAgo = (Date.now() - new Date(lastSeenAt).getTime()) / 3600000;
  if (hoursAgo < 2) return 0;
  if (hoursAgo < 12) return 20;
  if (hoursAgo < 24) return 40;
  if (hoursAgo < 72) return 70;
  return 100;
}

export function calcRiskScore(category: string, label: string): number {
  const riskyCategories = ["politica", "pessoa"];
  const riskyTerms = ["polêmica", "escândalo", "fraude", "golpe"];
  let score = 0;
  if (riskyCategories.includes(category)) score += 40;
  if (riskyTerms.some((t) => label.toLowerCase().includes(t))) score += 40;
  return Math.min(score, 100);
}

export function calcViralPotentialScore(velocity: number, crossSource: number, novelty: number): number {
  return Math.round(velocity * 0.4 + crossSource * 0.3 + novelty * 0.3);
}

export function calcCommercePotentialScore(category: string, niches: string[]): number {
  const commerceCategories = ["produto", "empresa", "lifestyle"];
  const commerceNiches = ["e-commerce", "renda-extra", "marketing", "negocios"];
  let score = 30;
  if (commerceCategories.includes(category)) score += 30;
  if (niches.some((n) => commerceNiches.includes(n))) score += 30;
  return Math.min(score, 100);
}

export function calcOverallScore(params: {
  velocity: number;
  crossSource: number;
  novelty: number;
  risk: number;
  viralPotential: number;
  commercePotential: number;
}): number {
  const { velocity, crossSource, novelty, risk, viralPotential, commercePotential } = params;
  const raw = velocity * 0.2 + crossSource * 0.15 + novelty * 0.15 + viralPotential * 0.25 + commercePotential * 0.15 + (100 - risk) * 0.1;
  return Math.round(Math.min(raw, 100));
}
