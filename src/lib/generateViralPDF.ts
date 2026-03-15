import jsPDF from 'jspdf';

// ── Color palette (corporate light mode) ──
const COLORS = {
  bg: '#FFFFFF',
  text: '#1A1A1A',
  textLight: '#555555',
  textMuted: '#888888',
  primary: '#7C3AED',
  primaryLight: '#EDE9FE',
  green: '#16A34A',
  red: '#DC2626',
  orange: '#EA580C',
  border: '#E5E7EB',
  headerBg: '#F9FAFB',
  cardBg: '#F3F4F6',
};

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_H = 12;
const CARD_PAD = 4; // mm padding inside cards
const CARD_RADIUS = 3;

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

/** Remove emojis and special unicode symbols that break PDF font rendering */
function stripEmojis(text: string): string {
  return text
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')
    .replace(/[\u{200D}]/gu, '')
    .replace(/[\u{20E3}]/gu, '')
    .replace(/[\u{E0020}-\u{E007F}]/gu, '')
    .replace(/[\u{D800}-\u{DFFF}]/gu, '')
    .replace(/[\u{10000}-\u{10FFFF}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function sanitize(text: string): string {
  return stripEmojis(text.replace(/\*\*/g, '').replace(/\[\d{2}:\d{2}(?:\s*-\s*\d{2}:\d{2})?\]/g, (m) => m));
}

function cleanBullets(text: string): string[] {
  return text
    .split(/\n|(?:^|\s)•\s*/g)
    .map((l) => sanitize(l.trim()))
    .filter(Boolean);
}

/** Clean timestamp: remove duplicate brackets, ensure clean format */
function cleanTimestamp(ts: string): string {
  return ts.replace(/^\[+/, '').replace(/\]+$/, '').trim();
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
    this.doc.setDrawColor(COLORS.primary);
    this.doc.setLineWidth(2);
    this.doc.line(MARGIN, 8, PAGE_W - MARGIN, 8);

    this.doc.setFontSize(7);
    this.doc.setTextColor(COLORS.textMuted);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Viralize AI — Relatorio de Auditoria Viral', MARGIN, 13);

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
    this.doc.setDrawColor(COLORS.primary);
    this.doc.setLineWidth(1);
    this.doc.line(MARGIN, footerY - 3, PAGE_W - MARGIN, footerY - 3);
    this.doc.setFontSize(6.5);
    this.doc.setTextColor(COLORS.textMuted);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Gerado por Viralize AI', MARGIN, footerY);
    this.doc.text(`Pagina ${this.page}`, PAGE_W - MARGIN, footerY, { align: 'right' });
  }

  // ── Drawing primitives ──

  sectionTitle(title: string, color = COLORS.primary) {
    this.ensureSpace(14);
    this.doc.setFontSize(13);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(color);
    this.doc.text(sanitize(title).toUpperCase(), MARGIN, this.y);
    this.y += 2;
    this.doc.setDrawColor(color);
    this.doc.setLineWidth(1.5);
    this.doc.line(MARGIN, this.y, MARGIN + 40, this.y);
    this.y += 6;
  }

  subTitle(title: string) {
    this.ensureSpace(10);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(COLORS.text);
    this.doc.text(sanitize(title), MARGIN + CARD_PAD, this.y);
    this.y += 5;
  }

  paragraph(text: string, indent = 0) {
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.textLight);
    const lines = this.doc.splitTextToSize(sanitize(text), CONTENT_W - indent - CARD_PAD * 2);
    for (const line of lines) {
      this.ensureSpace(5);
      this.doc.text(line, MARGIN + indent + CARD_PAD, this.y);
      this.y += 4.2;
    }
    this.y += 1;
  }

  bulletList(items: string[], icon = '-', iconColor = COLORS.textLight) {
    for (const item of items) {
      const cleanItem = sanitize(item);
      const lines = this.doc.splitTextToSize(cleanItem, CONTENT_W - 8 - CARD_PAD * 2);
      this.ensureSpace(lines.length * 4.2 + 2);
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(iconColor);
      this.doc.text(icon, MARGIN + CARD_PAD + 2, this.y);
      this.doc.setTextColor(COLORS.textLight);
      for (let i = 0; i < lines.length; i++) {
        this.doc.text(lines[i], MARGIN + CARD_PAD + 8, this.y);
        this.y += 4.2;
      }
      this.y += 1;
    }
  }

  scoreBox(label: string, score: number, x: number, w: number) {
    const h = 26;
    this.doc.setFillColor(COLORS.cardBg);
    this.doc.roundedRect(x, this.y, w, h, 3, 3, 'F');

    this.doc.setDrawColor(COLORS.border);
    this.doc.setLineWidth(0.3);
    this.doc.roundedRect(x, this.y, w, h, 3, 3, 'S');

    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(score >= 70 ? COLORS.green : score >= 40 ? COLORS.orange : COLORS.red);
    this.doc.text(`${score}`, x + w / 2, this.y + 12, { align: 'center' });

    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.textMuted);
    this.doc.text(sanitize(label), x + w / 2, this.y + 20, { align: 'center' });
  }

  /**
   * Two-pass card rendering: measures content height first, draws background, then re-renders content.
   * This solves jsPDF's lack of z-order support.
   */
  renderInCard(renderContent: (measuring: boolean) => void) {
    const startY = this.y;

    // Pass 1: measure height (render silently)
    const savedPage = this.page;
    renderContent(true);
    const measuredEndY = this.y;
    const contentHeight = measuredEndY - startY;

    // Reset position
    this.y = startY;
    // If we crossed pages during measurement, we can't easily draw a single bg.
    // For simplicity, handle single-page cards.
    if (this.page !== savedPage) {
      // Multi-page card: just render without background
      this.page = savedPage;
      renderContent(false);
      return;
    }

    // Draw background card
    this.doc.setFillColor(COLORS.cardBg);
    this.doc.roundedRect(
      MARGIN - 2,
      startY - CARD_PAD,
      CONTENT_W + 4,
      contentHeight + CARD_PAD * 2,
      CARD_RADIUS,
      CARD_RADIUS,
      'F'
    );

    // Pass 2: render content on top of the background
    this.y = startY;
    renderContent(false);
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

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.text);
  doc.text('Relatorio de Auditoria Viral', MARGIN, b.y);
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

  doc.setDrawColor(COLORS.primary);
  doc.setLineWidth(2);
  doc.line(MARGIN, b.y, PAGE_W - MARGIN, b.y);
  b.y += 10;

  // ═══════════════════════════════════════════
  // 1. VISAO GERAL
  // ═══════════════════════════════════════════
  b.sectionTitle('Visao Geral');

  // Giant score in brand purple
  doc.setFontSize(48);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.primary);
  doc.text(`${analysis.overallScore}`, MARGIN, b.y + 16);

  doc.setFontSize(14);
  doc.setTextColor(COLORS.textMuted);
  doc.text('/ 100', MARGIN + doc.getTextWidth(`${analysis.overallScore}`) * (48 / 14) / 2.8 + 4, b.y + 16);

  // Classification badge
  const badgeX = MARGIN + 60;
  const classText = sanitize(analysis.classification);
  doc.setFontSize(10);
  const badgeW = doc.getTextWidth(classText) + 14;
  doc.setFillColor(COLORS.primaryLight);
  doc.roundedRect(badgeX, b.y + 6, badgeW, 10, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.primary);
  doc.text(classText, badgeX + badgeW / 2, b.y + 13, { align: 'center' });

  b.y += 26;

  b.subTitle('Resumo');
  b.paragraph(analysis.summary);
  b.gap(4);

  // ═══════════════════════════════════════════
  // 2. ANALISE P-C-R
  // ═══════════════════════════════════════════
  b.sectionTitle('Analise P-C-R (Pergunta - Conflito - Resposta)');

  // Score boxes row
  b.ensureSpace(34);
  const boxW = (CONTENT_W - 8) / 3;
  b.scoreBox('HOOK (Abertura)', analysis.hookAnalysis.score, MARGIN, boxW);
  b.scoreBox('BODY (Conteudo)', analysis.bodyAnalysis.score, MARGIN + boxW + 4, boxW);
  b.scoreBox('CTA (Encerramento)', analysis.ctaAnalysis.score, MARGIN + (boxW + 4) * 2, boxW);
  b.y += 32;

  const pcrSections = [
    { label: 'Hook - Abertura', data: analysis.hookAnalysis },
    { label: 'Body - Conteudo', data: analysis.bodyAnalysis },
    { label: 'CTA - Encerramento', data: analysis.ctaAnalysis },
  ];

  for (const section of pcrSections) {
    b.ensureSpace(20);

    b.renderInCard(() => {
      b.subTitle(`${section.label} (${section.data.score}/100)`);
      const feedbackLines = cleanBullets(section.data.feedback);
      if (feedbackLines.length > 1) {
        b.bulletList(feedbackLines, '-', COLORS.textLight);
      } else {
        b.paragraph(section.data.feedback, 2);
      }
      if (section.data.tips.length > 0) {
        b.ensureSpace(8);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.primary);
        doc.text('DICAS:', MARGIN + CARD_PAD + 2, b.y);
        b.y += 4;
        b.bulletList(section.data.tips.map(t => sanitize(t)), '>', COLORS.primary);
      }
    });

    b.gap(6);
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
      const hookLines = doc.splitTextToSize(`"${sanitize(sb.exactHook)}"`, CONTENT_W - 6);
      for (const line of hookLines) {
        b.ensureSpace(5);
        doc.text(line, MARGIN + 3, b.y);
        b.y += 4.2;
      }
      b.gap(3);
    }

    if (sb.bodyPacing.length > 0) {
      b.subTitle('Ritmo do Video');
      for (const cut of sb.bodyPacing) {
        // Fix: clean duplicate brackets and ensure spacing
        const cleanTs = cleanTimestamp(sanitize(cut.timestamp));
        const tsText = `[${cleanTs}]`;
        const actionText = sanitize(cut.action).replace(/^\s*\]?\s*/, '').trim();
        const actionLines = doc.splitTextToSize(actionText, CONTENT_W - 25);
        b.ensureSpace(actionLines.length * 4.2 + 2);

        // Timestamp in bold purple
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.primary);
        doc.text(tsText, MARGIN + 2, b.y);

        // Action in normal dark
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(COLORS.textLight);
        doc.setFontSize(9);
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
      const ctaLines = doc.splitTextToSize(`"${sanitize(sb.exactCta)}"`, CONTENT_W - 6);
      for (const line of ctaLines) {
        b.ensureSpace(5);
        doc.text(line, MARGIN + 3, b.y);
        b.y += 4.2;
      }
      b.gap(3);
    }

    if (sb.captions.length > 0) {
      b.subTitle('Sugestoes de Legenda');
      sb.captions.forEach((c, i) => {
        b.bulletList([`Opcao ${i + 1}: ${sanitize(c)}`], '>', COLORS.primary);
      });
      b.gap(2);
    }
  }

  // ═══════════════════════════════════════════
  // 4. DIAGNOSTICO
  // ═══════════════════════════════════════════
  b.sectionTitle('Diagnostico');

  const renderDiagCard = (title: string, items: string[], icon: string, iconColor: string) => {
    if (items.length === 0) return;
    b.ensureSpace(16);

    b.renderInCard(() => {
      b.subTitle(title);
      b.bulletList(items.map(i => sanitize(i)), icon, iconColor);
    });

    b.gap(4);
  };

  renderDiagCard('Pontos Fortes', analysis.strengths, '+', COLORS.green);
  renderDiagCard('Pontos Fracos', analysis.weaknesses, 'x', COLORS.red);
  renderDiagCard('O que mata a retencao', analysis.retentionKillers, 'x', COLORS.red);

  if (analysis.retentionImprovements.length > 0) {
    b.renderInCard(() => {
      b.subTitle('Como melhorar a retencao');
      b.bulletList(analysis.retentionImprovements.map(i => sanitize(i)), '>', COLORS.green);
    });
    b.gap(2);
  }

  // ═══════════════════════════════════════════
  // 5. IDEIAS DE VIDEOS VIRAIS
  // ═══════════════════════════════════════════
  if (analysis.viralVideoIdeas && analysis.viralVideoIdeas.length > 0) {
    b.sectionTitle('Ideias de Videos Virais');
    for (const idea of analysis.viralVideoIdeas) {
      b.ensureSpace(18);
      b.renderInCard(() => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.text);
        doc.text(sanitize(idea.title), MARGIN + CARD_PAD + 2, b.y);
        b.y += 5;
        b.paragraph(idea.description, 4);
        if (idea.hookSuggestion) {
          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(COLORS.primary);
          const hookLines = doc.splitTextToSize(`Hook: "${sanitize(idea.hookSuggestion)}"`, CONTENT_W - 8);
          for (const line of hookLines) {
            b.ensureSpace(5);
            doc.text(line, MARGIN + CARD_PAD + 4, b.y);
            b.y += 4;
          }
        }
      });
      b.gap(4);
    }
  }

  b.addFooter();
  doc.save('auditoria-viral-viralize.pdf');
}
