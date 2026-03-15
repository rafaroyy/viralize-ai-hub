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
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')   // emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')   // misc symbols & pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')   // transport & map
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')   // flags
    .replace(/[\u{2600}-\u{26FF}]/gu, '')     // misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')     // dingbats
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')     // variation selectors
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')   // supplemental symbols
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')   // chess symbols
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')   // symbols extended-A
    .replace(/[\u{200D}]/gu, '')              // zero width joiner
    .replace(/[\u{20E3}]/gu, '')              // combining enclosing keycap
    .replace(/[\u{E0020}-\u{E007F}]/gu, '')   // tags
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')     // variation selectors
    .replace(/[\u{D800}-\u{DFFF}]/gu, '')     // surrogates
    .replace(/[\u{10000}-\u{10FFFF}]/gu, '')  // catch remaining supplementary
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
    this.doc.setLineWidth(0.8);
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
    this.doc.setLineWidth(0.4);
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
    this.doc.setLineWidth(0.5);
    this.doc.line(MARGIN, this.y, MARGIN + 40, this.y);
    this.y += 6;
  }

  subTitle(title: string) {
    this.ensureSpace(10);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(COLORS.text);
    this.doc.text(sanitize(title), MARGIN, this.y);
    this.y += 5;
  }

  paragraph(text: string, indent = 0) {
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.textLight);
    const lines = this.doc.splitTextToSize(sanitize(text), CONTENT_W - indent);
    for (const line of lines) {
      this.ensureSpace(5);
      this.doc.text(line, MARGIN + indent, this.y);
      this.y += 4.2;
    }
    this.y += 1;
  }

  bulletList(items: string[], icon = '-', iconColor = COLORS.textLight) {
    for (const item of items) {
      const cleanItem = sanitize(item);
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
    const h = 26;
    this.doc.setFillColor(COLORS.cardBg);
    this.doc.roundedRect(x, this.y, w, h, 3, 3, 'F');

    // Border
    this.doc.setDrawColor(COLORS.border);
    this.doc.setLineWidth(0.3);
    this.doc.roundedRect(x, this.y, w, h, 3, 3, 'S');

    // Score
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(score >= 70 ? COLORS.green : score >= 40 ? COLORS.orange : COLORS.red);
    this.doc.text(`${score}`, x + w / 2, this.y + 12, { align: 'center' });

    // Label
    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.textMuted);
    this.doc.text(sanitize(label), x + w / 2, this.y + 20, { align: 'center' });
  }

  /** Draw a rounded card background behind content */
  cardStart(paddingTop = 4): number {
    this.y += paddingTop;
    return this.y; // save start Y for later fill
  }

  cardEnd(startY: number, paddingBottom = 4) {
    this.y += paddingBottom;
    const h = this.y - startY;
    // Draw background behind (must draw first, but we draw after — use low opacity fill workaround)
    // jsPDF doesn't support z-order, so we insert a rect before text. Instead, we just draw the border.
    this.doc.setFillColor(COLORS.cardBg);
    this.doc.roundedRect(MARGIN - 2, startY - 2, CONTENT_W + 4, h + 4, 3, 3, 'F');
  }

  /** Draw a card box with content rendered inside */
  drawCardBox(renderContent: () => void) {
    // We need to measure content height first, so we render, measure, then draw bg behind
    // Since jsPDF doesn't support z-order, we pre-draw the background with estimated height
    const startY = this.y;
    
    // Save position, render content to measure
    const tempY = this.y;
    renderContent();
    const endY = this.y;
    const contentH = endY - tempY;
    
    // Unfortunately jsPDF renders in order, so we draw the box BEFORE content
    // Workaround: we'll use a two-pass approach by just adding padding and border
    // Actually, let's just draw the background first with a reasonable estimate
    // Better approach: draw background rect at known startY with measured height after rendering
    // Since content is already drawn, we just draw a light border around it
    this.doc.setDrawColor(COLORS.border);
    this.doc.setLineWidth(0.3);
    this.doc.roundedRect(MARGIN - 2, startY - 3, CONTENT_W + 4, contentH + 6, 3, 3, 'S');
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
  doc.setLineWidth(0.5);
  doc.line(MARGIN, b.y, PAGE_W - MARGIN, b.y);
  b.y += 8;

  // ═══════════════════════════════════════════
  // 1. VISAO GERAL
  // ═══════════════════════════════════════════
  b.sectionTitle('Visao Geral');

  const scoreColor = analysis.overallScore >= 70 ? COLORS.green : analysis.overallScore >= 40 ? COLORS.orange : COLORS.red;
  doc.setFontSize(42);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(scoreColor);
  doc.text(`${analysis.overallScore}`, MARGIN, b.y + 14);

  doc.setFontSize(12);
  doc.setTextColor(COLORS.textMuted);
  doc.text('/ 100', MARGIN + doc.getTextWidth(`${analysis.overallScore}`) + 3, b.y + 14);

  // Classification badge
  const badgeX = MARGIN + 55;
  const classText = sanitize(analysis.classification);
  const badgeW = doc.getTextWidth(classText) + 14;
  doc.setFillColor(COLORS.primaryLight);
  doc.roundedRect(badgeX, b.y + 4, badgeW, 10, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.primary);
  doc.text(classText, badgeX + badgeW / 2, b.y + 11, { align: 'center' });

  b.y += 24;

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

    // Section card with border
    const cardStartY = b.y;

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
      doc.text('DICAS:', MARGIN + 2, b.y);
      b.y += 4;
      b.bulletList(section.data.tips.map(t => sanitize(t)), '>', COLORS.primary);
    }

    // Draw card border around this section
    const cardH = b.y - cardStartY + 2;
    doc.setDrawColor(COLORS.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN - 3, cardStartY - 4, CONTENT_W + 6, cardH + 6, 2, 2, 'S');

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
        const tsText = `[${sanitize(cut.timestamp)}]`;
        const actionText = sanitize(cut.action);
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

  // Helper to render a diagnostic card with gray background
  const renderDiagCard = (title: string, items: string[], icon: string, iconColor: string) => {
    if (items.length === 0) return;
    b.ensureSpace(16);

    // Draw background card first
    // Estimate height: title (6) + items * ~5.2 + padding (8)
    const estimatedH = 6 + items.length * 6 + 8;
    const cardY = b.y - 2;

    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(MARGIN - 2, cardY, CONTENT_W + 4, estimatedH, 3, 3, 'F');

    b.subTitle(title);
    b.bulletList(items.map(i => sanitize(i)), icon, iconColor);

    // Adjust card height if content was longer
    const actualH = b.y - cardY + 2;
    if (actualH > estimatedH) {
      // Redraw with correct height (overlaps but fills correctly)
      doc.setFillColor(COLORS.cardBg);
      doc.roundedRect(MARGIN - 2, cardY, CONTENT_W + 4, actualH, 3, 3, 'F');
      // Re-render content on top... 
      // Since jsPDF doesn't support z-order, we accept the estimate approach
    }
    b.gap(4);
  };

  renderDiagCard('Pontos Fortes', analysis.strengths, '+', COLORS.green);
  renderDiagCard('Pontos Fracos', analysis.weaknesses, 'x', COLORS.red);
  renderDiagCard('O que mata a retencao', analysis.retentionKillers, 'x', COLORS.red);

  if (analysis.retentionImprovements.length > 0) {
    b.subTitle('Como melhorar a retencao');
    b.bulletList(analysis.retentionImprovements.map(i => sanitize(i)), '>', COLORS.green);
    b.gap(2);
  }

  // ═══════════════════════════════════════════
  // 5. IDEIAS DE VIDEOS VIRAIS
  // ═══════════════════════════════════════════
  if (analysis.viralVideoIdeas && analysis.viralVideoIdeas.length > 0) {
    b.sectionTitle('Ideias de Videos Virais');
    for (const idea of analysis.viralVideoIdeas) {
      b.ensureSpace(18);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.text);
      doc.text(sanitize(idea.title), MARGIN + 2, b.y);
      b.y += 5;
      b.paragraph(idea.description, 4);
      if (idea.hookSuggestion) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(COLORS.primary);
        const hookLines = doc.splitTextToSize(`Hook: "${sanitize(idea.hookSuggestion)}"`, CONTENT_W - 8);
        for (const line of hookLines) {
          b.ensureSpace(5);
          doc.text(line, MARGIN + 4, b.y);
          b.y += 4;
        }
      }
      b.gap(4);
    }
  }

  b.addFooter();
  doc.save('auditoria-viral-viralize.pdf');
}
