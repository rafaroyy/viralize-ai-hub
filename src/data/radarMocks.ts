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
  morta: "Morta",
};

export const categoryLabels: Record<TrendCategory, string> = {
  pessoa: "Pessoa",
  empresa: "Empresa",
  assunto: "Assunto",
  produto: "Produto",
  meme: "Meme",
  musica: "Música",
  politica: "Política",
  esporte: "Esporte",
  economia: "Economia",
  lifestyle: "Lifestyle",
};

export const nicheLabels: Record<NicheType, string> = {
  marketing: "Marketing Digital",
  negocios: "Negócios",
  "renda-extra": "Renda Extra",
  financas: "Finanças",
  lifestyle: "Lifestyle",
  "creator-economy": "Creator Economy",
  tecnologia: "Tecnologia",
  "e-commerce": "E-commerce",
};
