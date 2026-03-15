export type TrendStatus = "nova" | "subindo" | "pico" | "caindo" | "morta";
export type RiskLevel = "baixo" | "medio" | "alto";
export type SourceType = "google" | "tiktok" | "youtube" | "noticias";
export type TrendCategory =
  | "pessoa"
  | "empresa"
  | "assunto"
  | "produto"
  | "meme"
  | "musica"
  | "politica"
  | "esporte"
  | "economia"
  | "lifestyle";
export type NicheType =
  | "marketing"
  | "negocios"
  | "renda-extra"
  | "financas"
  | "lifestyle"
  | "creator-economy"
  | "tecnologia"
  | "e-commerce";
export type TimeWindow = "24h" | "72h" | "7d";

export interface SourceSignal {
  id: string;
  source: SourceType;
  sourceType: string;
  signalLabel: string;
  observedAt: string;
  region: string;
  rawScore: number;
  normalizedScore: number;
  url: string;
}

export interface Trend {
  id: string;
  label: string;
  aliases: string[];
  category: TrendCategory;
  country: string;
  region: string;
  sourceSignals: SourceSignal[];
  firstSeenAt: string;
  lastSeenAt: string;
  status: TrendStatus;
  velocityScore: number;
  crossSourceScore: number;
  noveltyScore: number;
  saturationScore: number;
  riskScore: number;
  viralPotentialScore: number;
  commercePotentialScore: number;
  overallScore: number;
  relatedTerms: string[];
  recommendedAngles: string[];
  suggestedHooks: string[];
  suggestedFormats: string[];
  suggestedCtas: string[];
  niches: NicheType[];
  summary?: string;
  timeline?: { date: string; score: number }[];
}

export interface Opportunity {
  id: string;
  trendId: string;
  trendLabel: string;
  niche: NicheType;
  whyNow: string;
  hooks: string[];
  videoIdeas: string[];
  narrative: string;
  cta: string;
  suggestedProductKeywords: string[];
  opportunityScore: number;
}

export interface RadarFiltersState {
  timeWindow: TimeWindow;
  sources: SourceType[];
  categories: TrendCategory[];
  statuses: TrendStatus[];
  risks: RiskLevel[];
  niches: NicheType[];
  search: string;
}

export interface RadarSettings {
  activeSources: SourceType[];
  updateFrequency: "15min" | "30min" | "1h" | "6h" | "12h" | "24h";
  priorityNiches: NicheType[];
  blockedTerms: string[];
  blockedCategories: TrendCategory[];
  scoreSensitivity: number;
  alertThreshold: number;
  ingestionMode: "manual" | "automatico";
  n8nWebhookUrl: string;
}
