import jsPDF from 'jspdf';

// ── Color palette (corporate light mode) ──
const COLORS = {
  bg: '#FFFFFF',
  text: '#1A1A1A',
  textLight: '#555555',
  textMuted: '#888888',
  primary: '#7C3AED',    // violet-600
  primaryLight: '#EDE9FE',
  green: '#16A34A',
  red: '#DC2626',
  orange: '#EA580C',
  border: '#E5E7EB',
  headerBg: '#F9FAFB',
};

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_H = 12;

interface ViralAnalysis {
  overallScore: number;
  classification: string;
  summary: string;
  hookAnalysis: { score: number; feedback: string; tips: string[] };
  bodyAnalysis: { score: number; feedback: string; tips: string[] };
  ctaAnalysis: { score: number; feedback: string; tips: string[] };
  retentionKillers: string[];
  retentionImprovements: string[];
  strengths: string[];
  weaknesses: string[];
  scriptBlueprint?: {
    captions: string[];
    exactHook: string;
    bodyPacing: { timestamp: string; action: string }[];
    exactCta: string;
  };
  viralVideoIdeas?: { title: string; description: string; hookSuggestion: string }[];
}

// ── Helpers ──

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, '').replace(/\[\d{2}:\d{2}(?:\s*-\s*\d{2}:\d{2})?\]/g, (m) => m);
}

function cleanBullets(text: string): string[] {
  return text
    .split(/\n|(?:^|\s)•\s*/g)
    .map((l) => stripMarkdown(l.trim()))
    .filter(Boolean);
}

class PDFBuilder {
  doc: jsPDF;
  y: number;
  page: number;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.y = MARGIN;
    this.page = 1;
  }

  // ── Page management ──

  private maxY() {
    return PAGE_H - MARGIN - FOOTER_H;
  }

  ensureSpace(needed: number) {
    if (this.y + needed > this.maxY()) {
      this.newPage();
    }
  }

  newPage() {
    this.addFooter();
    this.doc.addPage();
    this.page++;
    this.y = MARGIN;
    this.addHeader();
  }

  addHeader() {
    // Thin top line
    this.doc.setDrawColor(COLORS.primary);
    this.doc.setLineWidth(0.8);
    this.doc.line(MARGIN, 8, PAGE_W - MARGIN, 8);

    this.doc.setFontSize(7);
    this.doc.setTextColor(COLORS.textMuted);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Viralize AI — Relatório de Auditoria Viral', MARGIN, 13);

    const dateStr = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    this.doc.text(dateStr, PAGE_W - MARGIN, 13, { align: 'right' });

    this.y = Math.max(this.y, 18);
  }

  addFooter() {
    const footerY = PAGE_H - 8;
    this.doc.setDrawColor(COLORS.border);
    this.doc.setLineWidth(0.3);
    this.doc.line(MARGIN, footerY - 3, PAGE_W - MARGIN, footerY - 3);
    this.doc.setFontSize(6.5);
    this.doc.setTextColor(COLORS.textMuted);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Gerado por Viralize AI • viralize-ai-hub.lovable.app', MARGIN, footerY);
    this.doc.text(`Página ${this.page}`, PAGE_W - MARGIN, footerY, { align: 'right' });
  }

  // ── Drawing primitives ──

  sectionTitle(title: string, color = COLORS.primary) {
    this.ensureSpace(14);
    this.doc.setFontSize(13);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(color);
    this.doc.text(title.toUpperCase(), MARGIN, this.y);
    this.y += 2;
    this.doc.setDrawColor(color);
    this.doc.setLineWidth(0.5);
    this.doc.line(MARGIN, this.y, MARGIN + 40, this.y);
    this.y += 6;
  }

  subTitle(title: string) {
    this.ensureSpace(10);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(COLORS.text);
    this.doc.text(title, MARGIN, this.y);
    this.y += 5;
  }

  paragraph(text: string, indent = 0) {
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.textLight);
    const lines = this.doc.splitTextToSize(stripMarkdown(text), CONTENT_W - indent);
    for (const line of lines) {
      this.ensureSpace(5);
      this.doc.text(line, MARGIN + indent, this.y);
      this.y += 4.2;
    }
    this.y += 1;
  }

  bulletList(items: string[], icon = '•', iconColor = COLORS.textLight) {
    for (const item of items) {
      const cleanItem = stripMarkdown(item);
      const lines = this.doc.splitTextToSize(cleanItem, CONTENT_W - 8);
      this.ensureSpace(lines.length * 4.2 + 2);
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(iconColor);
      this.doc.text(icon, MARGIN + 2, this.y);
      this.doc.setTextColor(COLORS.textLight);
      for (let i = 0; i < lines.length; i++) {
        this.doc.text(lines[i], MARGIN + 8, this.y);
        this.y += 4.2;
      }
      this.y += 1;
    }
  }

  scoreBox(label: string, score: number, x: number, w: number) {
    const h = 22;
    this.doc.setFillColor(COLORS.headerBg);
    this.doc.roundedRect(x, this.y, w, h, 2, 2, 'F');

    // Score
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(score >= 70 ? COLORS.green : score >= 40 ? COLORS.orange : COLORS.red);
    this.doc.text(`${score}`, x + w / 2, this.y + 10, { align: 'center' });

    // Label
    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.textMuted);
    this.doc.text(label, x + w / 2, this.y + 17, { align: 'center' });
  }

  gap(mm = 4) {
    this.y += mm;
  }
}

// ── Main export function ──

export function generateViralPDF(analysis: ViralAnalysis) {
  const b = new PDFBuilder();
  const { doc } = b;

  // ═══════════════════════════════════════════
  // COVER / HEADER
  // ═══════════════════════════════════════════
  b.addHeader();
  b.y = 28;

  // Title block
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.text);
  doc.text('Relatório de Auditoria Viral', MARGIN, b.y);
  b.y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.textMuted);
  const dateStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Gerado em ${dateStr}`, MARGIN, b.y);
  b.y += 4;

  // Divider
  doc.setDrawColor(COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, b.y, PAGE_W - MARGIN, b.y);
  b.y += 8;

  // ═══════════════════════════════════════════
  // 1. VISÃO GERAL
  // ═══════════════════════════════════════════
  b.sectionTitle('Visão Geral');

  // Big score + classification
  const scoreColor = analysis.overallScore >= 70 ? COLORS.green : analysis.overallScore >= 40 ? COLORS.orange : COLORS.red;
  doc.setFontSize(42);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(scoreColor);
  doc.text(`${analysis.overallScore}`, MARGIN, b.y + 14);

  doc.setFontSize(12);
  doc.setTextColor(COLORS.textMuted);
  doc.text('/ 100', MARGIN + doc.getTextWidth(`${analysis.overallScore}`) + 3, b.y + 14);

  // Classification badge
  const badgeX = MARGIN + 50;
  const badgeW = doc.getTextWidth(analysis.classification) + 10;
  doc.setFillColor(COLORS.primaryLight);
  doc.roundedRect(badgeX, b.y + 4, badgeW, 8, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.primary);
  doc.text(analysis.classification, badgeX + badgeW / 2, b.y + 10, { align: 'center' });

  b.y += 22;

  // Summary
  b.subTitle('Resumo');
  b.paragraph(analysis.summary);
  b.gap(4);

  // ═══════════════════════════════════════════
  // 2. ANÁLISE P-C-R
  // ═══════════════════════════════════════════
  b.sectionTitle('Análise P-C-R (Pergunta · Conflito · Resposta)');

  // Score boxes row
  b.ensureSpace(30);
  const boxW = (CONTENT_W - 8) / 3;
  b.scoreBox('HOOK (Abertura)', analysis.hookAnalysis.score, MARGIN, boxW);
  b.scoreBox('BODY (Conteúdo)', analysis.bodyAnalysis.score, MARGIN + boxW + 4, boxW);
  b.scoreBox('CTA (Encerramento)', analysis.ctaAnalysis.score, MARGIN + (boxW + 4) * 2, boxW);
  b.y += 28;

  // Detailed sections
  const pcrSections = [
    { label: 'Hook — Abertura', data: analysis.hookAnalysis },
    { label: 'Body — Conteúdo', data: analysis.bodyAnalysis },
    { label: 'CTA — Encerramento', data: analysis.ctaAnalysis },
  ];

  for (const section of pcrSections) {
    b.subTitle(`${section.label} (${section.data.score}/100)`);
    const feedbackLines = cleanBullets(section.data.feedback);
    if (feedbackLines.length > 1) {
      b.bulletList(feedbackLines, '•', COLORS.textLight);
    } else {
      b.paragraph(section.data.feedback, 2);
    }
    if (section.data.tips.length > 0) {
      b.ensureSpace(8);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.primary);
      doc.text('DICAS:', MARGIN + 2, b.y);
      b.y += 4;
      b.bulletList(section.data.tips, '→', COLORS.primary);
    }
    b.gap(3);
  }

  // ═══════════════════════════════════════════
  // 3. ROTEIRO OTIMIZADO
  // ═══════════════════════════════════════════
  if (analysis.scriptBlueprint) {
    const sb = analysis.scriptBlueprint;
    b.sectionTitle('Roteiro Otimizado');

    if (sb.exactHook) {
      b.subTitle('Abertura Ideal');
      b.ensureSpace(8);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(COLORS.primary);
      const hookLines = doc.splitTextToSize(`"${stripMarkdown(sb.exactHook)}"`, CONTENT_W - 6);
      for (const line of hookLines) {
        b.ensureSpace(5);
        doc.text(line, MARGIN + 3, b.y);
        b.y += 4.2;
      }
      b.gap(3);
    }

    if (sb.bodyPacing.length > 0) {
      b.subTitle('Ritmo do Vídeo');
      for (const cut of sb.bodyPacing) {
        const cutText = `[${cut.timestamp}] ${stripMarkdown(cut.action)}`;
        const lines = doc.splitTextToSize(cutText, CONTENT_W - 8);
        b.ensureSpace(lines.length * 4.2 + 2);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.primary);
        doc.text(`[${cut.timestamp}]`, MARGIN + 2, b.y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(COLORS.textLight);
        doc.setFontSize(9);
        const actionLines = doc.splitTextToSize(stripMarkdown(cut.action), CONTENT_W - 25);
        for (const al of actionLines) {
          doc.text(al, MARGIN + 22, b.y);
          b.y += 4.2;
        }
        b.y += 1;
      }
      b.gap(2);
    }

    if (sb.exactCta) {
      b.subTitle('Encerramento Ideal');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(COLORS.primary);
      const ctaLines = doc.splitTextToSize(`"${stripMarkdown(sb.exactCta)}"`, CONTENT_W - 6);
      for (const line of ctaLines) {
        b.ensureSpace(5);
        doc.text(line, MARGIN + 3, b.y);
        b.y += 4.2;
      }
      b.gap(3);
    }

    if (sb.captions.length > 0) {
      b.subTitle('Sugestões de Legenda');
      sb.captions.forEach((c, i) => {
        b.bulletList([`Opção ${i + 1}: ${c}`], '▸', COLORS.primary);
      });
      b.gap(2);
    }
  }

  // ═══════════════════════════════════════════
  // 4. DIAGNÓSTICO
  // ═══════════════════════════════════════════
  b.sectionTitle('Diagnóstico');

  if (analysis.strengths.length > 0) {
    b.subTitle('Pontos Fortes');
    b.bulletList(analysis.strengths, '✓', COLORS.green);
    b.gap(2);
  }

  if (analysis.weaknesses.length > 0) {
    b.subTitle('Pontos Fracos');
    b.bulletList(analysis.weaknesses, '✗', COLORS.red);
    b.gap(2);
  }

  if (analysis.retentionKillers.length > 0) {
    b.subTitle('O que mata a retenção');
    b.bulletList(analysis.retentionKillers, '✗', COLORS.red);
    b.gap(2);
  }

  if (analysis.retentionImprovements.length > 0) {
    b.subTitle('Como melhorar a retenção');
    b.bulletList(analysis.retentionImprovements, '→', COLORS.green);
    b.gap(2);
  }

  // ═══════════════════════════════════════════
  // 5. IDEIAS DE VÍDEOS VIRAIS
  // ═══════════════════════════════════════════
  if (analysis.viralVideoIdeas && analysis.viralVideoIdeas.length > 0) {
    b.sectionTitle('Ideias de Vídeos Virais');
    for (const idea of analysis.viralVideoIdeas) {
      b.ensureSpace(18);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.text);
      doc.text(`🎬 ${stripMarkdown(idea.title)}`, MARGIN + 2, b.y);
      b.y += 5;
      b.paragraph(idea.description, 4);
      if (idea.hookSuggestion) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(COLORS.primary);
        const hookLines = doc.splitTextToSize(`Hook: "${stripMarkdown(idea.hookSuggestion)}"`, CONTENT_W - 8);
        for (const line of hookLines) {
          b.ensureSpace(5);
          doc.text(line, MARGIN + 4, b.y);
          b.y += 4;
        }
      }
      b.gap(4);
    }
  }

  // Final footer on last page
  b.addFooter();

  doc.save('auditoria-viral-viralize.pdf');
}
