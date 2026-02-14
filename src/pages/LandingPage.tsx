import { useRef, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Check, ChevronDown, Play, X, Clock, Layers,
  Target, Cpu, LayoutGrid, RefreshCw, Download, User, ShoppingBag, Store, Mic,
  Eye, Zap, Shield, Sparkles,
} from "lucide-react";
import logoViralize from "@/assets/logo-viralize.png";
import logoViralizeLight from "@/assets/logo-viralize-light.png";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import DisplayCards from "@/components/ui/display-cards";

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

function ScrollReveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-4 border border-primary/30 rounded-full px-4 py-1.5 bg-primary/5">
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════
   MOCK DATA — viralGallery
   ═══════════════════════════════════════════ */

const viralGallery = [
  {
    title: "Se você faz isso no TikTok, tá matando seu alcance",
    platform: "TikTok", duration: "00:19", views: "2.3M", likes: "184k", framework: "HDC",
    hook: "Você tá sabotando o algoritmo e nem percebe.",
    structure: ["Choque (1ª frase)", "Prova rápida (1 dado)", "Virada (o que fazer)", "CTA simples"],
    cta: "Comenta 'FRAMEWORK' que eu te mando o modelo.",
  },
  {
    title: "O erro que faz teu Reels morrer em 3 segundos",
    platform: "Instagram", duration: "00:23", views: "1.1M", likes: "77k", framework: "HDC",
    hook: "Se você começa assim, acabou.",
    structure: ["Negação do óbvio", "Exemplo visual", "Checklist 3 passos", "Fechamento com autoridade"],
    cta: "Quer que eu gere 3 versões disso pro teu nicho? Clica em começar.",
  },
  {
    title: "Como vender sem parecer vendedor (em 20s)",
    platform: "TikTok", duration: "00:20", views: "860k", likes: "41k", framework: "PPMO",
    hook: "Você não precisa convencer. Precisa encaixar a prova.",
    structure: ["Problema", "Prova", "Mecanismo", "Oferta"],
    cta: "Se quiser o roteiro, aperta gerar agora.",
  },
  {
    title: "3 frases que seguram atenção instantânea",
    platform: "YouTube Shorts", duration: "00:28", views: "540k", likes: "22k", framework: "Lista Ritmada",
    hook: "Anota isso: são 3 frases que prendem qualquer um.",
    structure: ["Setup rápido", "Lista com ritmo", "Mini payoff", "CTA discreto"],
    cta: "Quer as variações? Gera na Viralize.",
  },
  {
    title: "Por que seu anúncio não converte (a verdade)",
    platform: "TikTok", duration: "00:22", views: "1.8M", likes: "130k", framework: "HDC",
    hook: "Seu anúncio tá bonito. E é exatamente por isso que não vende.",
    structure: ["Provocação", "Dado real", "Solução rápida", "CTA direto"],
    cta: "Comenta 'COPY' pra receber o template.",
  },
  {
    title: "Hook perfeito: 3 modelos pra copiar agora",
    platform: "Instagram", duration: "00:18", views: "720k", likes: "55k", framework: "Lista Ritmada",
    hook: "Salva esse vídeo. Sério.",
    structure: ["Comando de ação", "Modelo 1", "Modelo 2", "Modelo 3", "CTA"],
    cta: "Quer mais 10 modelos? Gera na Viralize.",
  },
  {
    title: "Esse formato vendeu R$40k em 7 dias",
    platform: "TikTok", duration: "00:25", views: "2.0M", likes: "160k", framework: "PPMO",
    hook: "Não foi sorte. Foi estrutura.",
    structure: ["Resultado", "Contexto", "Framework usado", "Prova social", "CTA"],
    cta: "Quer o mesmo framework? Clica em começar.",
  },
  {
    title: "A regra dos 3s que todo viral segue",
    platform: "YouTube Shorts", duration: "00:30", views: "480k", likes: "29k", framework: "HDC",
    hook: "Todo vídeo viral tem isso nos primeiros 3 segundos.",
    structure: ["Afirmação forte", "Exemplo 1", "Exemplo 2", "Revelação", "CTA"],
    cta: "Gera o teu agora na Viralize.",
  },
  {
    title: "Pare de postar sem framework",
    platform: "Instagram", duration: "00:15", views: "950k", likes: "68k", framework: "HDC",
    hook: "Você posta todo dia e não cresce? O problema não é frequência.",
    structure: ["Dor", "Diagnóstico", "Solução", "CTA"],
    cta: "Comenta 'VIRAL' que eu te mostro como.",
  },
  {
    title: "Copy que vende em vídeo curto (sem ser chato)",
    platform: "TikTok", duration: "00:21", views: "1.4M", likes: "102k", framework: "PPMO",
    hook: "Vender em vídeo curto não é sobre falar do produto.",
    structure: ["Anti-padrão", "Exemplo real", "Técnica", "CTA natural"],
    cta: "Quer o roteiro? Gera na Viralize.",
  },
  {
    title: "Hack de retenção: como prender até o final",
    platform: "YouTube Shorts", duration: "00:26", views: "630k", likes: "38k", framework: "Loop Aberto",
    hook: "Fica até o final que eu provo.",
    structure: ["Promessa", "Tensão", "Entrega parcial", "Entrega final + CTA"],
    cta: "Gera variações desse formato agora.",
  },
  {
    title: "Por que creators medianos faturam mais que bons",
    platform: "TikTok", duration: "00:24", views: "1.6M", likes: "115k", framework: "Contraste",
    hook: "Talento não paga boleto. Estrutura paga.",
    structure: ["Tese contrária", "Prova", "Framework", "CTA"],
    cta: "Quer a estrutura? Tá na Viralize.",
  },
];

/* ═══════════════════════════════════════════
   1) HEADER
   ═══════════════════════════════════════════ */

function Navbar() {
  const { isDark } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navItems = [
    { label: "Como funciona", href: "#tour" },
    { label: "Vídeos", href: "#proof" },
    { label: "Por dentro", href: "#tour" },
    { label: "Preços", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 shrink-0">
          <img src={isDark ? logoViralize : logoViralizeLight} alt="Viralize" className="h-9 object-contain" />
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {navItems.map((item) => (
            <a key={item.href + item.label} href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors">
            Entrar
          </Link>
          <Link to="/login" className="gradient-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-glow">
            Começar agora
          </Link>
          {/* Mobile hamburger */}
          <button className="lg:hidden ml-1 p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <div className="space-y-1.5">
              <span className={cn("block w-5 h-0.5 bg-foreground transition-transform", mobileOpen && "rotate-45 translate-y-2")} />
              <span className={cn("block w-5 h-0.5 bg-foreground transition-opacity", mobileOpen && "opacity-0")} />
              <span className={cn("block w-5 h-0.5 bg-foreground transition-transform", mobileOpen && "-rotate-45 -translate-y-2")} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 overflow-hidden"
          >
            <nav className="container mx-auto px-6 py-4 flex flex-col gap-3">
              {navItems.map((item) => (
                <a key={item.href + item.label} href={item.href} onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-2">
                  {item.label}
                </a>
              ))}
              <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-2">
                Entrar
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ═══════════════════════════════════════════
   2) HERO
   ═══════════════════════════════════════════ */

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* BG effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
        {/* Left */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="flex flex-col gap-6">
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.1] font-display">
            Viralizar não é sorte,{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary">é framework</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl leading-relaxed">
            Você não precisa de mais ideias. Precisa de estrutura. A Viralize monta seu vídeo frame por frame com frameworks de retenção e venda — do gancho ao CTA — em minutos.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link
              to="/login"
              className="gradient-primary text-primary-foreground px-7 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2 shadow-glow text-sm"
            >
              Gerar meu primeiro vídeo
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, repeatDelay: 2, duration: 1 }}>
                <ArrowRight className="h-4 w-4" />
              </motion.span>
            </Link>
            <a
              href="#proof"
              className="border border-border bg-secondary/50 hover:bg-secondary text-foreground px-7 py-3.5 rounded-xl font-semibold transition-colors inline-flex items-center justify-center gap-2 text-sm"
            >
              <Play className="h-4 w-4" />
              Ver vídeos criados
            </a>
          </div>

          {/* Micro bullets */}
          <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground mt-2">
            {["Do prompt ao vídeo: 2–5 minutos", "Copy visual por frame (não é só roteiro)", "Garantia de 7 dias"].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                {t}
              </span>
            ))}
          </div>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-3 mt-2">
            {[
              { value: "+500M", label: "views orgânicos" },
              { value: "3.5x", label: "mais engajamento" },
              { value: "Frameworks", label: "reais de venda" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 bg-secondary/60 border border-border/50 rounded-full px-4 py-2">
                <span className="text-sm font-bold text-foreground">{s.value}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — Video Builder mock */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-border/60 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-foreground tracking-wide uppercase">Video Builder</span>
                <span className="text-[10px] font-medium bg-primary/20 text-primary px-2.5 py-1 rounded-full border border-primary/30">
                  Framework aplicado: HDC
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { n: "01", label: "Hook", sub: "Choque inicial" },
                  { n: "02", label: "Tensão", sub: "Dado + prova" },
                  { n: "03", label: "Virada", sub: "Solução rápida" },
                  { n: "04", label: "Prova", sub: "Social proof" },
                  { n: "05", label: "CTA", sub: "Ação direta" },
                  { n: "06", label: "Saída", sub: "Loop / replay" },
                ].map((frame, i) => (
                  <motion.div
                    key={frame.n}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="bg-secondary/70 border border-border/50 rounded-xl p-3 sm:p-4 flex flex-col items-center gap-1 hover:border-primary/40 transition-colors group"
                  >
                    <span className="text-lg sm:text-xl font-bold text-primary/80 group-hover:text-primary transition-colors">{frame.n}</span>
                    <span className="text-xs font-semibold text-foreground">{frame.label}</span>
                    <span className="text-[10px] text-muted-foreground">{frame.sub}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          {/* Glow behind */}
          <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-3xl -z-10" />
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   3) PROVA — MARQUEE + MODAL
   ═══════════════════════════════════════════ */

function ProofSection() {
  // Pick 3 featured videos for the stacked display
  const featured = [viralGallery[0], viralGallery[1], viralGallery[2]];

  const cards = featured.map((v, i) => {
    const baseClass =
      "[grid-area:stack] before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 before:transition-opacity before:duration-700 before:left-0 before:top-0";

    const positions = [
      `${baseClass} grayscale-[100%] hover:before:opacity-0 hover:grayscale-0 hover:-translate-y-10`,
      `${baseClass} translate-x-12 sm:translate-x-16 translate-y-10 grayscale-[100%] hover:before:opacity-0 hover:grayscale-0 hover:-translate-y-1`,
      "[grid-area:stack] translate-x-24 sm:translate-x-32 translate-y-20 hover:translate-y-10",
    ];

    return {
      icon: <Play className="h-4 w-4" />,
      title: v.platform + " · " + v.framework,
      description: v.title,
      date: v.views + " views · " + v.likes + " ❤",
      iconClassName: "text-primary",
      titleClassName: "text-primary",
      className: positions[i],
    };
  });

  return (
    <section id="proof" className="w-full py-20 md:py-28 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 mb-12">
        <ScrollReveal>
          <div className="text-center space-y-3">
            <SectionTag>Prova real</SectionTag>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
              Clique e assista. Isso aqui saiu da Viralize.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Zero teoria. Só entrega. Veja a estrutura do vídeo por trás do resultado.
            </p>
          </div>
        </ScrollReveal>
      </div>

      <div className="container mx-auto px-4 sm:px-6 flex justify-center">
        <DisplayCards cards={cards} />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   4) TOUR — SCROLLYTELLING
   ═══════════════════════════════════════════ */

const tourSteps = [
  { icon: Target, title: "Você escolhe o alvo", desc: "Produto, público e objetivo. Sem adivinhação.", mockLabel: "Configuração", mockSub: "Nicho: Infoproduto · Objetivo: Venda" },
  { icon: Cpu, title: "A Viralize escolhe o framework", desc: "Estrutura baseada no objetivo: viralizar, vender ou captar.", mockLabel: "Framework", mockSub: "HDC — Hook, Dado, CTA" },
  { icon: LayoutGrid, title: "Sai o vídeo quebrado em frames", desc: "Hook → tensão → prova → virada → CTA.", mockLabel: "Frames", mockSub: "5 frames · 22s · 9:16" },
  { icon: RefreshCw, title: "Você gera variações em 1 clique", desc: "3 versões pra testar rápido.", mockLabel: "Variações", mockSub: "v1 · v2 · v3 geradas" },
  { icon: Download, title: "Você exporta pronto pra postar", desc: "Formato otimizado por plataforma + legendas.", mockLabel: "Exportar", mockSub: "TikTok · Reels · Shorts" },
];

function TourSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const activeIndex = useTransform(scrollYProgress, [0, 1], [0, tourSteps.length - 1]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const unsubscribe = activeIndex.on("change", (v) => setActive(Math.round(v)));
    return unsubscribe;
  }, [activeIndex]);

  const currentStep = tourSteps[active] || tourSteps[0];

  return (
    <section id="tour" ref={containerRef} className="relative" style={{ height: `${(tourSteps.length + 1) * 100}vh` }}>
      <div className="sticky top-0 min-h-screen flex items-center py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <SectionTag>Por dentro</SectionTag>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
                Não é gerador. É motor de retenção.
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                Veja a Viralize montando o vídeo por dentro, frame por frame.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-5xl mx-auto">
            {/* Mock (left) */}
            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-border/60 relative overflow-hidden order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="relative z-10 flex flex-col items-center text-center gap-4 min-h-[200px] justify-center"
                >
                  <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                    <currentStep.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-bold font-display">{currentStep.mockLabel}</span>
                  <span className="text-sm text-muted-foreground">{currentStep.mockSub}</span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Steps (right) */}
            <div className="flex flex-col gap-4 order-1 lg:order-2">
              {tourSteps.map((step, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "p-5 rounded-xl border transition-all duration-300 cursor-default",
                    i === active
                      ? "border-primary/50 bg-primary/5 shadow-glow"
                      : "border-border/30 bg-secondary/20 opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold text-primary">{String(i + 1).padStart(2, "0")}</span>
                    <h4 className="font-semibold text-sm">{step.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground ml-7">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   5) O QUE VOCÊ RECEBE
   ═══════════════════════════════════════════ */

function WhatYouGetSection() {
  const bullets = [
    "3 hooks prontos (sem enrolação)",
    "Copy visual por frame (texto + intenção)",
    "Estrutura de retenção (ordem e tempo)",
    "Gatilhos de venda sem parecer vendedor",
    "Variações automáticas pra teste rápido",
  ];

  return (
    <section className="w-full py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <SectionTag>Entrega</SectionTag>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display mb-6">
              Você aperta um botão. Sai um vídeo pronto pra ganhar feed.
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="grid sm:grid-cols-2 gap-3 text-left mt-8 mb-8">
              {bullets.map((b, i) => (
                <div key={i} className="flex items-center gap-3 glass-card p-4 rounded-xl">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 shadow-glow">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{b}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl p-6">
              <p className="text-lg font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                Não é inspiração. É execução.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   6) PRA QUEM É
   ═══════════════════════════════════════════ */

const audiences = [
  { icon: User, title: "Infoprodutor", desc: "Vídeos que vendem sem implorar." },
  { icon: ShoppingBag, title: "Afiliado", desc: "Volume + estrutura: escala com consistência." },
  { icon: Store, title: "Negócio local", desc: "Captação com criativos curtos que convertem." },
  { icon: Mic, title: "Creator", desc: "Retenção, ritmo e gancho no lugar certo." },
];

function AudienceSection() {
  return (
    <section className="w-full py-20 md:py-28 bg-secondary/20">
      <div className="container mx-auto px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center mb-12">
            <SectionTag>Público</SectionTag>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
              Serve pra quem precisa de resultado, não de teoria.
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {audiences.map((a, i) => (
            <ScrollReveal key={a.title} delay={i * 0.1}>
              <motion.div
                className="glass-card p-6 text-center h-full"
                whileHover={{ y: -4, boxShadow: "0 0 30px hsl(var(--primary) / 0.15)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <a.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-base mb-2 font-display">{a.title}</h3>
                <p className="text-sm text-muted-foreground">{a.desc}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   7) PREÇOS
   ═══════════════════════════════════════════ */

function PricingSection() {
  const plans = [
    {
      name: "Mensal",
      price: "R$ 97",
      period: "/mês",
      features: [
        "Acesso completo ao motor de vídeos",
        "Frameworks de viralização",
        "Copy visual por frame",
        "Variações automáticas",
        "Suporte por email",
        "Garantia de 7 dias",
      ],
      popular: true,
    },
    {
      name: "Trimestral",
      price: "R$ 197",
      period: "/trimestre",
      features: [
        "Tudo do plano Mensal",
        "Frameworks avançados",
        "Relatórios de performance",
        "Suporte prioritário",
      ],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="w-full py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center space-y-3 mb-12">
            <SectionTag>Preços</SectionTag>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
              R$97/mês pra ter um criativo que não cansa.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Se não fizer sentido em 7 dias, você cancela e acabou.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 0.15}>
              <motion.div
                className={cn(
                  "glass-card p-8 h-full relative rounded-2xl",
                  plan.popular && "border-primary/50 shadow-glow"
                )}
                whileHover={{ y: -4 }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full shadow-glow">
                    Recomendado
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2 font-display">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 mt-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/login"
                  className={cn(
                    "block text-center py-3 rounded-xl font-semibold transition-all w-full text-sm",
                    plan.popular
                      ? "gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  )}
                >
                  Começar Agora
                </Link>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   8) FAQ
   ═══════════════════════════════════════════ */

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
    { q: "A Viralize gera o vídeo pronto ou só o roteiro?", a: "Vídeo pronto. Com frames, copy visual, narração, legendas e edição. Você só exporta e posta." },
    { q: "Preciso saber editar vídeo?", a: "Não. A Viralize faz tudo. Você escolhe o tema, a IA monta, você aprova e publica." },
    { q: "O que são os frameworks de viralização?", a: "São estruturas testadas em +500M de views orgânicos. Cada uma define a ordem, ritmo e gatilhos do vídeo pra maximizar retenção e conversão." },
    { q: "Posso usar os vídeos comercialmente?", a: "Sim. Tudo que você cria é 100% seu. Use em seus canais, para clientes ou revenda." },
    { q: "Como funciona a garantia de 7 dias?", a: "Se não fizer sentido, pediu cancelamento em até 7 dias e devolvemos 100%. Sem perguntas." },
    { q: "Quantos vídeos posso gerar por mês?", a: "Depende do seu plano. Consulte os limites de quota na seção de preços ou dentro da plataforma." },
  ];

  return (
    <section id="faq" className="w-full py-20 md:py-28 bg-secondary/20">
      <div className="container mx-auto px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center mb-12">
            <SectionTag>FAQ</SectionTag>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
              Perguntas que todo mundo faz
            </h2>
          </div>
        </ScrollReveal>

        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <motion.div className="glass-card overflow-hidden rounded-xl">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full p-5 flex items-center justify-between text-left gap-4"
                >
                  <span className="font-medium text-sm">{faq.q}</span>
                  <motion.div animate={{ rotate: openIndex === i ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openIndex === i ? "auto" : 0, opacity: openIndex === i ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm text-muted-foreground">{faq.a}</p>
                </motion.div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   9) CTA FINAL
   ═══════════════════════════════════════════ */

function CtaFinalSection() {
  return (
    <section className="w-full py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px]" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <ScrollReveal>
          <div className="flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
              Se você postar sem framework,{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">tá jogando no escuro.</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Entre agora e gere seu primeiro vídeo em minutos.
            </p>
            <Link
              to="/login"
              className="gradient-primary text-primary-foreground px-10 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-glow text-base"
            >
              Começar agora
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, repeatDelay: 2, duration: 1 }}>
                <ArrowRight className="h-5 w-5" />
              </motion.span>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   10) FOOTER
   ═══════════════════════════════════════════ */

function Footer() {
  const { isDark } = useTheme();
  return (
    <footer className="w-full border-t border-border/50 py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <img src={isDark ? logoViralize : logoViralizeLight} alt="Viralize" className="h-9 mb-4" />
            <p className="text-sm text-muted-foreground">Framework que transforma vídeos em resultado.</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3">Produto</h4>
            <ul className="space-y-2">
              {[
                { label: "Como funciona", href: "#tour" },
                { label: "Vídeos", href: "#proof" },
                { label: "Preços", href: "#pricing" },
                { label: "FAQ", href: "#faq" },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3">Empresa</h4>
            <ul className="space-y-2">
              {["Sobre", "Blog", "Contato"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3">Legal</h4>
            <ul className="space-y-2">
              {["Termos", "Privacidade"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border/50 pt-6">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Viralize. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════
   MARQUEE KEYFRAMES (add via style tag)
   ═══════════════════════════════════════════ */

function MarqueeStyles() {
  return (
    <style>{`
      @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `}</style>
  );
}

/* ═══════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════ */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarqueeStyles />
      <Navbar />
      <HeroSection />
      <ProofSection />
      <TourSection />
      <WhatYouGetSection />
      <AudienceSection />
      <PricingSection />
      <FaqSection />
      <CtaFinalSection />
      <Footer />
    </div>
  );
}
