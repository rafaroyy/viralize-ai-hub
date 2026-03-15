import type { SourceType, TrendStatus, TrendCategory, NicheType } from "@/types/radar";

export const sourceLabels: Record<SourceType, string> = {
  google: "Google Trends",
  tiktok: "TikTok",
  youtube: "YouTube",
  noticias: "Notícias",
};

export const availableSources: SourceType[] = ["youtube"];
export const comingSoonSources: SourceType[] = ["google", "tiktok", "noticias"];

export const statusLabels: Record<TrendStatus, string> = {
  nova: "Nova",
  subindo: "Subindo",
  pico: "Pico",
  caindo: "Caindo",
  estavel: "Estável",
};

export const categoryLabels: Record<TrendCategory, string> = {
  assunto: "Assunto",
  som: "Som/Áudio",
  formato: "Formato",
  hashtag: "Hashtag",
  desafio: "Desafio",
};

export const nicheLabels: Record<NicheType, string> = {
  "marketing": "Marketing Digital",
  "creator-economy": "Creator Economy",
  "e-commerce": "E-commerce",
  "saude": "Saúde & Bem-estar",
  "financas": "Finanças",
  "educacao": "Educação",
  "entretenimento": "Entretenimento",
  "tecnologia": "Tecnologia",
};
