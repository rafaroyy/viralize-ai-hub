import { useRef, useEffect, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Check, ChevronDown, Play, X, Clock, Layers,
  Target, Cpu, LayoutGrid, RefreshCw, Download, User, ShoppingBag, Store, Mic,
  Eye, Zap, Shield, ShieldCheckIcon, Sparkles, Wand2, PenLine, Loader2, CheckCircle, Video } from
"lucide-react";
import { BorderTrail } from "@/components/ui/border-trail";
import logoViralize from "@/assets/logo-viralize.png";
import logoViralizeLight from "@/assets/logo-viralize-light.png";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { GradientText } from "@/components/ui/gradient-text";
import viralVideoProof from "@/assets/viral-video-proof.mp4";

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

function ScrollReveal({ children, delay = 0, className }: {children: React.ReactNode;delay?: number;className?: string;}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}>

      {children}
    </motion.div>);

}

function SectionTag({ children }: {children: React.ReactNode;}) {
  return (
    <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-4 border border-primary/30 rounded-full px-4 py-1.5 bg-primary/5">
      {children}
    </span>);

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
  cta: "Comenta 'FRAMEWORK' que eu te mando o modelo."
},
{
  title: "O erro que faz teu Reels morrer em 3 segundos",
  platform: "Instagram", duration: "00:23", views: "1.1M", likes: "77k", framework: "HDC",
  hook: "Se você começa assim, acabou.",
  structure: ["Negação do óbvio", "Exemplo visual", "Checklist 3 passos", "Fechamento com autoridade"],
  cta: "Quer que eu gere 3 versões disso pro teu nicho? Clica em começar."
},
{
  title: "Como vender sem parecer vendedor (em 20s)",
  platform: "TikTok", duration: "00:20", views: "860k", likes: "41k", framework: "PPMO",
  hook: "Você não precisa convencer. Precisa encaixar a prova.",
  structure: ["Problema", "Prova", "Mecanismo", "Oferta"],
  cta: "Se quiser o roteiro, aperta gerar agora."
},
{
  title: "3 frases que seguram atenção instantânea",
  platform: "YouTube Shorts", duration: "00:28", views: "540k", likes: "22k", framework: "Lista Ritmada",
  hook: "Anota isso: são 3 frases que prendem qualquer um.",
  structure: ["Setup rápido", "Lista com ritmo", "Mini payoff", "CTA discreto"],
  cta: "Quer as variações? Gera na Viralize."
},
{
  title: "Por que seu anúncio não converte (a verdade)",
  platform: "TikTok", duration: "00:22", views: "1.8M", likes: "130k", framework: "HDC",
  hook: "Seu anúncio tá bonito. E é exatamente por isso que não vende.",
  structure: ["Provocação", "Dado real", "Solução rápida", "CTA direto"],
  cta: "Comenta 'COPY' pra receber o template."
},
{
  title: "Hook perfeito: 3 modelos pra copiar agora",
  platform: "Instagram", duration: "00:18", views: "720k", likes: "55k", framework: "Lista Ritmada",
  hook: "Salva esse vídeo. Sério.",
  structure: ["Comando de ação", "Modelo 1", "Modelo 2", "Modelo 3", "CTA"],
  cta: "Quer mais 10 modelos? Gera na Viralize."
},
{
  title: "Esse formato vendeu R$40k em 7 dias",
  platform: "TikTok", duration: "00:25", views: "2.0M", likes: "160k", framework: "PPMO",
  hook: "Não foi sorte. Foi estrutura.",
  structure: ["Resultado", "Contexto", "Framework usado", "Prova social", "CTA"],
  cta: "Quer o mesmo framework? Clica em começar."
},
{
  title: "A regra dos 3s que todo viral segue",
  platform: "YouTube Shorts", duration: "00:30", views: "480k", likes: "29k", framework: "HDC",
  hook: "Todo vídeo viral tem isso nos primeiros 3 segundos.",
  structure: ["Afirmação forte", "Exemplo 1", "Exemplo 2", "Revelação", "CTA"],
  cta: "Gera o teu agora na Viralize."
},
{
  title: "Pare de postar sem framework",
  platform: "Instagram", duration: "00:15", views: "950k", likes: "68k", framework: "HDC",
  hook: "Você posta todo dia e não cresce? O problema não é frequência.",
  structure: ["Dor", "Diagnóstico", "Solução", "CTA"],
  cta: "Comenta 'VIRAL' que eu te mostro como."
},
{
  title: "Copy que vende em vídeo curto (sem ser chato)",
  platform: "TikTok", duration: "00:21", views: "1.4M", likes: "102k", framework: "PPMO",
  hook: "Vender em vídeo curto não é sobre falar do produto.",
  structure: ["Anti-padrão", "Exemplo real", "Técnica", "CTA natural"],
  cta: "Quer o roteiro? Gera na Viralize."
},
{
  title: "Hack de retenção: como prender até o final",
  platform: "YouTube Shorts", duration: "00:26", views: "630k", likes: "38k", framework: "Loop Aberto",
  hook: "Fica até o final que eu provo.",
  structure: ["Promessa", "Tensão", "Entrega parcial", "Entrega final + CTA"],
  cta: "Gera variações desse formato agora."
},
{
  title: "Por que creators medianos faturam mais que bons",
  platform: "TikTok", duration: "00:24", views: "1.6M", likes: "115k", framework: "Contraste",
  hook: "Talento não paga boleto. Estrutura paga.",
  structure: ["Tese contrária", "Prova", "Framework", "CTA"],
  cta: "Quer a estrutura? Tá na Viralize."
}];


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
  { label: "FAQ", href: "#faq" }];


  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg" : "bg-transparent"
      )}>

      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 shrink-0">
          <img src={isDark ? logoViralize : logoViralizeLight} alt="Viralize" className="h-28 object-contain" />
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {navItems.map((item) =>
          <a key={item.href + item.label} href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {item.label}
            </a>
          )}
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
        {mobileOpen &&
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 overflow-hidden">

            <nav className="container mx-auto px-6 py-4 flex flex-col gap-3">
              {navItems.map((item) =>
            <a key={item.href + item.label} href={item.href} onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-2">
                  {item.label}
                </a>
            )}
              <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-2">
                Entrar
              </Link>
            </nav>
          </motion.div>
        }
      </AnimatePresence>
    </motion.header>);

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
            <GradientText className="text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.1] font-display">
              é framework
            </GradientText>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl leading-relaxed">
            Você não precisa de mais ideias. Precisa de estrutura. A Viralize monta seu vídeo frame por frame com frameworks de retenção e venda — do gancho ao CTA — em minutos.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link
              to="/login"
              className="gradient-primary text-primary-foreground px-7 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2 shadow-glow text-sm">

              Gerar meu primeiro vídeo
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, repeatDelay: 2, duration: 1 }}>
                <ArrowRight className="h-4 w-4" />
              </motion.span>
            </Link>
            <a
              href="#proof"
              className="border border-border bg-secondary/50 hover:bg-secondary text-foreground px-7 py-3.5 rounded-xl font-semibold transition-colors inline-flex items-center justify-center gap-2 text-sm">

              <Play className="h-4 w-4" />
              Ver vídeos criados
            </a>
          </div>

          {/* Micro bullets */}
          <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground mt-2">
            {["Do prompt ao vídeo: 2–5 minutos", "Copy visual por frame (não é só roteiro)", "Garantia de 7 dias"].map((t) =>
            <span key={t} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                {t}
              </span>
            )}
          </div>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-3 mt-2">
            {[
            { value: "+500M", label: "views orgânicos" },
            { value: "3.5x", label: "mais engajamento" },
            { value: "Frameworks", label: "reais de venda" }].
            map((s) =>
            <div key={s.label} className="flex items-center gap-2 bg-secondary/60 border border-border/50 rounded-full px-4 py-2">
                <span className="text-sm font-bold text-foreground">{s.value}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right — TikTok Dashboard mock */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative">

          <div className="glass-card p-5 sm:p-7 rounded-2xl border border-border/60 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                    <Eye className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-xs font-semibold text-foreground tracking-wide uppercase">Analytics — Últimos 30 dias</span>
                </div>
                <span className="text-[10px] font-medium bg-primary/20 text-primary px-2.5 py-1 rounded-full border border-primary/30">
                  ● Ao vivo
                </span>
              </div>

              {/* Big number */}
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs font-medium">Total de visualizações</span>
                <div className="flex items-end gap-3">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="text-4xl sm:text-5xl font-bold text-foreground font-display tracking-tight">
                    12.4M
                  </motion.span>
                  <span className="text-sm font-semibold text-green-500 mb-1.5">↑ 340%</span>
                </div>
              </div>

              {/* Mini chart bars */}
              <div className="flex items-end gap-1.5 h-20">
                {[35, 42, 28, 55, 70, 48, 62, 80, 95, 75, 88, 100, 92, 78, 85, 97, 90, 82, 70, 95, 88, 100, 85, 92, 78, 88, 95, 100, 90, 85].map((h, i) =>
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.7 + i * 0.03, duration: 0.4, ease: "easeOut" }}
                  className={cn(
                    "flex-1 rounded-sm min-w-[4px]",
                    h >= 90 ? "gradient-primary" : "bg-primary/30"
                  )} />

                )}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                { label: "Curtidas", value: "1.2M", icon: "❤️" },
                { label: "Compartilhamentos", value: "340k", icon: "🔁" },
                { label: "Novos seguidores", value: "+89k", icon: "👥" }].
                map((stat, i) =>
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  className="bg-secondary/70 border border-border/50 rounded-xl p-3 flex flex-col gap-1">
                    <span className="text-sm">{stat.icon}</span>
                    <span className="text-lg font-bold text-foreground">{stat.value}</span>
                    <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                  </motion.div>
                )}
              </div>

              {/* Top videos mini list */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Top vídeos do mês</span>
                {[
                { title: "Se você namora veja esse vídeo", views: "1.8M", growth: "+580%" },
                { title: "Esse formato vendeu R$40k em 7 dias", views: "2.0M", growth: "+420%" },
                { title: "Por que creators medianos faturam mais", views: "1.6M", growth: "+310%" }].
                map((v, i) =>
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + i * 0.1 }}
                  className="flex items-center justify-between bg-secondary/40 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary">{`#${i + 1}`}</span>
                      <span className="text-xs text-foreground truncate max-w-[180px] sm:max-w-[220px]">{v.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-foreground">{v.views}</span>
                      <span className="text-[10px] text-green-500 font-medium">{v.growth}</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
          {/* Glow behind */}
          <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-3xl -z-10" />
        </motion.div>
      </div>
    </section>);

}

/* ═══════════════════════════════════════════
   3) PROVA — MARQUEE + MODAL
   ═══════════════════════════════════════════ */

function ProofSection() {
  const proofVideo = {
    title: "Como tirou 980 na redação do Enem",
    platform: "TikTok", duration: "00:18", views: "1.2M", likes: "98k", framework: "P-C-R",
    hook: "Convenci minha amiga a me falar como que ela tirou 980 na redação do Enem ano passado.",
    structure: ["Hook com prova social (nota real)", "Revelação do método (IA no WhatsApp)", "CTA com link na bio"],
    cta: "Deixei o link na minha bio para você testar."
  };

  return (
    <section id="proof" className="w-full overflow-hidden">
      <ContainerScroll
        titleComponent={
        <div className="space-y-4">
            <SectionTag>Prova real</SectionTag>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
              Clique e assista.{" "}
              <GradientText className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
                Isso aqui saiu da Viralize.
              </GradientText>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Zero teoria. Só entrega. Veja a estrutura do vídeo por trás do resultado.
            </p>
          </div>
        }>

        <div className="h-full w-full flex flex-col md:flex-row gap-4 md:gap-6 p-2 md:p-4 overflow-auto">
          {/* Left: video vertical + stats below */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative w-[220px] sm:w-[240px] md:w-[260px] aspect-[9/16] rounded-2xl border border-border/40 overflow-hidden bg-background/60 shadow-lg">
              <video
                src={viralVideoProof}
                className="h-full w-full object-cover"
                controls
                playsInline
                muted
                loop
                preload="metadata" />

            </div>
            {/* Views/likes below player */}
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{proofVideo.views}</span>
              <span>❤ {proofVideo.likes}</span>
              <span>{proofVideo.platform} · {proofVideo.duration}</span>
            </div>
          </div>

          {/* Right: recipe breakdown */}
          <div className="flex-1 flex flex-col gap-3 justify-center min-w-0">
            <h3 className="text-base font-bold text-foreground font-display leading-snug">{proofVideo.title}</h3>
            <span className="text-[10px] font-medium bg-primary/20 text-primary px-2.5 py-1 rounded-full border border-primary/30 w-fit">
              Framework: {proofVideo.framework}
            </span>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Hook</p>
              <p className="text-sm text-muted-foreground leading-relaxed">"{proofVideo.hook}"</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Estrutura</p>
              <div className="flex flex-col gap-1">
                {proofVideo.structure.map((s, i) =>
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-5 h-5 rounded-md bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    {s}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">CTA</p>
              <p className="text-sm text-muted-foreground leading-relaxed">"{proofVideo.cta}"</p>
            </div>
          </div>
        </div>
      </ContainerScroll>
    </section>);

}

/* ═══════════════════════════════════════════
   4) TEST DRIVE — MOCK UI
   ═══════════════════════════════════════════ */

function TourSection() {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [processingText, setProcessingText] = useState("Gerando roteiro...");

  // Animate progress bar on step 2
  useEffect(() => {
    if (step === 2) {
      setProgress(0);
      setProcessingText("Gerando roteiro...");
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 4;
        });
      }, 120);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Change processing text at midpoint
  useEffect(() => {
    if (step === 2 && progress >= 50 && progress < 55) {
      setProcessingText("Renderizando cenas...");
    }
    if (step === 2 && progress >= 100) {
      const timeout = setTimeout(() => setStep(3), 600);
      return () => clearTimeout(timeout);
    }
  }, [step, progress]);

  const stepLabels = ["Escolher Modo", "Configurar", "Processando", "Pronto!"];

  return (
    <section id="tour" className="w-full py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center mb-10">
            <SectionTag>Test Drive</SectionTag>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
              Veja a Viralize{" "}
              <GradientText className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
                montando um vídeo.
              </GradientText>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Interface real. Dados mockados. Só pra você sentir o poder.
            </p>
          </div>
        </ScrollReveal>

        {/* Step tabs */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {stepLabels.map((label, i) =>
          <button
            key={label}
            onClick={() => {if (i <= step) setStep(i);}}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200",
              i === step ?
              "gradient-primary text-primary-foreground shadow-glow" :
              i < step ?
              "bg-primary/15 text-primary border border-primary/30 cursor-pointer" :
              "bg-secondary/60 text-muted-foreground border border-border/50 cursor-default opacity-50"
            )}>
              <span className="mr-1.5 opacity-60">{String(i + 1).padStart(2, "0")}</span>
              {label}
            </button>
          )}
        </div>

        {/* Mock UI card */}
        <div className="max-w-3xl mx-auto">
          <div className="glass-card rounded-2xl border border-border/60 overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border/40 bg-secondary/30">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-destructive/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <span className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-[10px] text-muted-foreground ml-2 font-mono">viralize.ai/criar</span>
            </div>

            <div className="p-5 sm:p-7 min-h-[340px]">
              <AnimatePresence mode="wait">
                {/* Step 0 — Escolher Modo */}
                {step === 0 &&
                <motion.div key="s0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="flex flex-col gap-6">
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground mb-1">Como você quer criar seu vídeo?</p>
                      <p className="text-xs text-muted-foreground">Escolha o modo que combina com você</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                      onClick={() => setStep(1)}
                      className="border border-primary/40 bg-primary/5 hover:bg-primary/10 rounded-xl p-6 flex flex-col items-center gap-3 transition-colors group">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                          <Wand2 className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <span className="text-sm font-bold text-foreground">Assistente IA</span>
                        <span className="text-[11px] text-muted-foreground text-center leading-snug">A IA cria o roteiro, escolhe as cenas e monta o vídeo completo pra você</span>
                      </button>
                      <div className="border border-border/50 bg-secondary/40 rounded-xl p-6 flex flex-col items-center gap-3 opacity-60 cursor-default">
                        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center border border-border/50">
                          <PenLine className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground">Script Manual</span>
                        <span className="text-[11px] text-muted-foreground text-center leading-snug">Você escreve o roteiro e envia seus próprios vídeos</span>
                      </div>
                    </div>
                  </motion.div>
                }

                {/* Step 1 — Configurar */}
                {step === 1 &&
                <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Nicho</label>
                        <div className="bg-secondary/60 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground">Casal / Relacionamento</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Objetivo</label>
                        <div className="bg-secondary/60 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground">Venda com link no perfil</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tema do vídeo</label>
                      <div className="bg-secondary/60 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground">Date criativo com jogo de casal</div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Duração</label>
                      <div className="bg-secondary/60 border border-border/50 rounded-lg px-3 py-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-foreground">24s · 3 cenas</span>
                          <span className="text-[10px] text-muted-foreground">8s – 30s</span>
                        </div>
                        <div className="relative h-2 w-full rounded-full bg-secondary overflow-hidden">
                          <div className="absolute h-full rounded-full gradient-primary" style={{ width: "73%" }} />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Fonte de vídeo</label>
                        <div className="bg-primary/5 border border-primary/30 rounded-lg px-3 py-2.5 text-sm text-foreground flex items-center gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-primary" /> IA Viralize
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Estilo de legenda</label>
                        <div className="bg-primary/5 border border-primary/30 rounded-lg px-3 py-2.5 text-sm text-foreground">🎤 Karaoke</div>
                      </div>
                    </div>
                    <button onClick={() => setStep(2)} className="gradient-primary text-primary-foreground px-5 py-3 rounded-xl font-semibold text-sm self-end hover:opacity-90 transition-opacity shadow-glow flex items-center gap-2 mt-1">
                      <Video className="h-4 w-4" /> Gerar Vídeo
                    </button>
                  </motion.div>
                }

                {/* Step 2 — Processando */}
                {step === 2 &&
                <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="flex flex-col items-center justify-center gap-6 min-h-[280px]">
                    <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                      <Loader2 className="h-8 w-8 text-primary-foreground" />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground mb-1">Criando seu vídeo...</p>
                      <p className="text-sm text-muted-foreground">{processingText}</p>
                    </div>
                    <div className="w-full max-w-xs">
                      <div className="relative h-3 w-full rounded-full bg-secondary overflow-hidden">
                        <motion.div
                        className="absolute h-full rounded-full gradient-primary"
                        style={{ width: `${progress}%` }}
                        transition={{ duration: 0.1 }} />

                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-2">{progress}%</p>
                    </div>
                  </motion.div>
                }

                {/* Step 3 — Pronto! */}
                {step === 3 &&
                <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }} className="flex flex-col items-center justify-center gap-5 min-h-[280px]">
                    <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-500/40">
                      <CheckCircle className="h-10 w-10 text-green-500" />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground font-display">Vídeo Pronto!</p>
                      <p className="text-sm text-muted-foreground mt-1">24s · 3 cenas · Formato 9:16</p>
                    </div>
                    <button className="border border-border bg-secondary/60 hover:bg-secondary text-foreground px-6 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2">
                      <Download className="h-4 w-4" /> Baixar Vídeo
                    </button>
                    <div className="flex gap-3 mt-2">
                      <button onClick={() => {setStep(0);setProgress(0);}} className="border border-border bg-secondary/50 hover:bg-secondary text-foreground px-5 py-2.5 rounded-xl font-semibold text-xs transition-colors flex items-center gap-2">
                        <RefreshCw className="h-3.5 w-3.5" /> Recomeçar
                      </button>
                      <Link to="/login" className="gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-xs hover:opacity-90 transition-opacity shadow-glow flex items-center gap-2">
                        Quero criar o meu <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                }
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>);

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
  "Variações automáticas pra teste rápido"];


  return null;


































}

/* ═══════════════════════════════════════════
   6) PRA QUEM É
   ═══════════════════════════════════════════ */

const audiences = [
{ icon: User, title: "Infoprodutor", desc: "Vídeos que vendem sem implorar." },
{ icon: ShoppingBag, title: "Afiliado", desc: "Volume + estrutura: escala com consistência." },
{ icon: Store, title: "Negócio local", desc: "Captação com criativos curtos que convertem." },
{ icon: Mic, title: "Creator", desc: "Retenção, ritmo e gancho no lugar certo." }];


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
          {audiences.map((a, i) =>
          <ScrollReveal key={a.title} delay={i * 0.1}>
              <motion.div
              className="glass-card p-6 text-center h-full"
              whileHover={{ y: -4, boxShadow: "0 0 30px hsl(var(--primary) / 0.15)" }}
              transition={{ duration: 0.3 }}>

                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <a.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-base mb-2 font-display">{a.title}</h3>
                <p className="text-sm text-muted-foreground">{a.desc}</p>
              </motion.div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>);

}

/* ═══════════════════════════════════════════
   7) PREÇOS
   ═══════════════════════════════════════════ */

function PricingSection({ checkoutMonthly, checkoutLifetime }: {checkoutMonthly?: string;checkoutLifetime?: string;}) {
  const [activeTab, setActiveTab] = useState<'monthly' | 'quarterly'>('quarterly');

  const features = [
    "Acesso completo ao motor de vídeos",
    "Frameworks de viralização (HDC, PPMO, etc.)",
    "Copy visual por frame",
    "Variações automáticas de roteiro",
    "Análise de roteiro com metodologia P-C-R",
    "Chat IA especializado em vídeos virais",
    "Upload de vídeos personalizados",
    "Suporte prioritário",
    "Garantia de 7 dias",
  ];

  const plans = {
    monthly: {
      label: "Mensal",
      price: "145",
      period: "/mês",
      subtitle: "Flexibilidade total",
      href: checkoutMonthly || "https://pay.zouti.com.br/checkout?poi=prod_offer_qnohqjvl02nadr7v471icj",
    },
    quarterly: {
      label: "Trimestral",
      price: "395",
      period: "/trimestre",
      subtitle: "Economia de 32%",
      originalPrice: "435",
      badge: "-32% OFF",
      href: checkoutLifetime || "https://pay.zouti.com.br/checkout?poi=prod_offer_7u1c4rgzmr0c3jf60vvi3k",
    },
  };

  const current = plans[activeTab];

  return (
    <section id="pricing" className="w-full py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <ScrollReveal className="text-center mb-12">
          <SectionTag>Preços</SectionTag>
          <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">
            Invista no seu <GradientText>crescimento viral</GradientText>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Escolha o plano ideal e comece a criar vídeos que viralizam.
          </p>
        </ScrollReveal>

        {/* Tab toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-secondary/70 border border-border/50 rounded-xl p-1 gap-1">
            {(["monthly", "quarterly"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                  activeTab === tab
                    ? "gradient-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab === "monthly" ? "Mensal" : "Trimestral"}
                {tab === "quarterly" && (
                  <span className="absolute -top-2.5 -right-2.5 text-[10px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded-full">
                    -32%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Card */}
        <ScrollReveal className="max-w-md mx-auto">
          <motion.div
            layout
            className="relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

            {activeTab === "quarterly" && plans.quarterly.badge && (
              <div className="absolute top-4 right-4 text-xs font-bold bg-green-500 text-white px-3 py-1 rounded-full">
                {plans.quarterly.badge}
              </div>
            )}

            <div className="relative z-10 flex flex-col items-center text-center gap-6">
              <div>
                <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">{current.label}</p>
                <p className="text-xs text-muted-foreground">{current.subtitle}</p>
              </div>

              <div className="flex items-baseline gap-1">
                {activeTab === "quarterly" && plans.quarterly.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through mr-2">R${plans.quarterly.originalPrice}</span>
                )}
                <span className="text-sm text-muted-foreground">R$</span>
                <motion.span
                  key={current.price}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl sm:text-6xl font-bold font-display text-foreground"
                >
                  {current.price}
                </motion.span>
                <span className="text-muted-foreground text-sm">{current.period}</span>
              </div>

              {activeTab === "quarterly" && (
                <p className="text-xs text-green-500 font-medium">
                  Equivale a R$98/mês — economize R$140
                </p>
              )}

              <div className="w-full border-t border-border/50 pt-6">
                <ul className="flex flex-col gap-3 text-left">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={current.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full gradient-primary text-primary-foreground py-4 rounded-xl font-semibold text-center hover:opacity-90 transition-opacity shadow-glow inline-flex items-center justify-center gap-2"
              >
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </a>

              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Garantia de 7 dias — cancele sem burocracia
              </p>
            </div>
          </motion.div>
        </ScrollReveal>
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
  { q: "A Viralize gera o vídeo pronto ou só o roteiro?", a: "Vídeo pronto. Você escolhe o modo (Assistente IA ou Script Manual), configura nicho, objetivo e duração, e a IA gera o vídeo completo com legendas, cenas e edição. Só baixar e postar." },
  { q: "Preciso saber editar vídeo?", a: "Não. A Viralize faz tudo. Você pode usar vídeos gerados pela IA da Viralize ou fazer upload dos seus próprios clipes. A plataforma monta, edita e adiciona legendas automaticamente." },
  { q: "Como funciona o Assistente IA?", a: "Você define o nicho, objetivo e tema. A IA gera o roteiro e monta o vídeo automaticamente, dividindo em cenas proporcionais à duração escolhida (1 cena a cada 8 segundos). Suporta vídeos de 8s a 30s." },
  { q: "O que é a Análise de Roteiro?", a: "É uma ferramenta que avalia seu roteiro usando a metodologia P–C–R (Pergunta, Conflito, Resposta). Você recebe scores de retenção, pico emocional e insights práticos para melhorar seu conteúdo antes de gravar." },
  { q: "Posso usar meus próprios vídeos?", a: "Sim! No modo de vídeos personalizados, recomendamos enviar 4 clipes de 5 segundos cada. A IA faz a montagem, roteiro e edição. Dica: use o botão 'Buscar Inspiração' para encontrar referências no TikTok e o SnapTik para remover marcas d'água." },
  { q: "Posso usar os vídeos comercialmente?", a: "Sim. Tudo que você cria é 100% seu. Use em seus canais, para clientes ou revenda." },
  { q: "Como funciona a garantia de 7 dias?", a: "Se não fizer sentido, pediu cancelamento em até 7 dias e devolvemos 100%. Sem perguntas." }];


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
          {faqs.map((faq, i) =>
          <ScrollReveal key={i} delay={i * 0.05}>
              <motion.div className="glass-card overflow-hidden rounded-xl">
                <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-5 flex items-center justify-between text-left gap-4">

                  <span className="font-medium text-sm">{faq.q}</span>
                  <motion.div animate={{ rotate: openIndex === i ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  </motion.div>
                </button>
                <motion.div
                initial={false}
                animate={{ height: openIndex === i ? "auto" : 0, opacity: openIndex === i ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden">

                  <p className="px-5 pb-5 text-sm text-muted-foreground">{faq.a}</p>
                </motion.div>
              </motion.div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>);

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
              className="gradient-primary text-primary-foreground px-10 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-glow text-base">

              Começar agora
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, repeatDelay: 2, duration: 1 }}>
                <ArrowRight className="h-5 w-5" />
              </motion.span>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>);

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
              { label: "FAQ", href: "#faq" }].
              map((item) =>
              <li key={item.label}>
                  <a href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item.label}</a>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3">Empresa</h4>
            <ul className="space-y-2">
              {["Sobre", "Blog", "Contato"].map((item) =>
              <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3">Legal</h4>
            <ul className="space-y-2">
              {["Termos", "Privacidade"].map((item) =>
              <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="border-t border-border/50 pt-6">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Viralize. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>);

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
    `}</style>);

}

/* ═══════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════ */

export default function LandingPage() {
  const { affiliateSlug } = useParams<{affiliateSlug?: string;}>();
  const navigate = useNavigate();
  const [affiliateLinks, setAffiliateLinks] = useState<{checkout_monthly: string;checkout_lifetime: string;} | null>(null);

  useEffect(() => {
    if (!affiliateSlug) return;

    const fetchAffiliate = async () => {
      const { data, error } = await supabase.
      from('affiliates').
      select('checkout_monthly, checkout_lifetime').
      eq('slug', affiliateSlug).
      eq('active', true).
      maybeSingle();

      if (error || !data) {
        navigate('/', { replace: true });
        return;
      }
      setAffiliateLinks(data);
    };

    fetchAffiliate();
  }, [affiliateSlug, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarqueeStyles />
      <Navbar />
      <HeroSection />
      <ProofSection />
      <TourSection />
      <WhatYouGetSection />
      <AudienceSection />
      <PricingSection
        checkoutMonthly={affiliateLinks?.checkout_monthly}
        checkoutLifetime={affiliateLinks?.checkout_lifetime} />
      
      <FaqSection />
      <CtaFinalSection />
      <Footer />
    </div>);

}