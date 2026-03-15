import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, TrendingDown, TrendingUp, X, Check, Clock, Shield, ChevronDown } from "lucide-react";
import { BorderTrail } from "@/components/ui/border-trail";
import { GradientText } from "@/components/ui/gradient-text";
import logoViralize from "@/assets/logo-viralize.png";
import logoViralizeLight from "@/assets/logo-viralize-light.png";
import { useTheme } from "@/hooks/use-theme";
import semViralizeImg from "@/assets/sem-viralize-views.png";
import comViralizeImg from "@/assets/com-viralize-views.png";
import { cn } from "@/lib/utils";

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

function ImpactLine({ children, className }: {children: React.ReactNode;className?: string;}) {
  return (
    <p className={cn("text-xl sm:text-2xl lg:text-3xl font-bold font-display text-foreground leading-tight", className)}>
      {children}
    </p>);

}

const CHECKOUT_MONTHLY = "https://pay.zouti.com.br/checkout?poi=prod_offer_qnohqjvl02nadr7v471icj";
const CHECKOUT_LIFETIME = "https://pay.zouti.com.br/checkout?poi=prod_offer_xx1w0hy1pi5lhvnvcukmdo";

/* ═══════════════════════════════════════════
   NAVBAR
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

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg" : "bg-transparent"
      )}>
      
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={isDark ? logoViralize : logoViralizeLight} alt="Viralize" className="h-28 object-contain" />
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors">
            Entrar
          </Link>
          <a
            href={CHECKOUT_LIFETIME}
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-glow">
            
            Começar agora
          </a>
          <button className="sm:hidden ml-1 p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <div className="space-y-1.5">
              <span className={cn("block w-5 h-0.5 bg-foreground transition-transform", mobileOpen && "rotate-45 translate-y-2")} />
              <span className={cn("block w-5 h-0.5 bg-foreground transition-opacity", mobileOpen && "opacity-0")} />
              <span className={cn("block w-5 h-0.5 bg-foreground transition-transform", mobileOpen && "-rotate-45 -translate-y-2")} />
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen &&
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="sm:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 overflow-hidden">
          
            <nav className="container mx-auto px-6 py-4 flex flex-col gap-3">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-2">
                Entrar
              </Link>
              <a
              href={CHECKOUT_LIFETIME}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="text-sm text-primary hover:text-foreground py-2">
              
                Começar agora
              </a>
            </nav>
          </motion.div>
        }
      </AnimatePresence>
    </motion.header>);

}

/* ═══════════════════════════════════════════
   1) HERO
   ═══════════════════════════════════════════ */

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-20 md:py-32 relative z-10 max-w-3xl text-center flex flex-col items-center gap-8">
        

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] font-display">
          
          Encontre o produto. Crie o vídeo.{" "}
          <GradientText className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] font-display">
            Comece a vender.
          </GradientText>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-xl">
          
          A Viralize junta catálogo de produtos para afiliação, criação de vídeos virais com IA e tráfego orgânico pelo TikTok. Tudo dentro de uma única plataforma.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-3">
          
          <a
            href={CHECKOUT_LIFETIME}
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-primary text-primary-foreground px-10 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-glow text-base">
            
            Começar a criar e vender
            <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, repeatDelay: 2, duration: 1 }}>
              <ArrowRight className="h-5 w-5" />
            </motion.span>
          </a>
          <span className="text-sm text-muted-foreground">Pagamento único. Acesso vitalício à plataforma.</span>
        </motion.div>
      </div>
    </section>);

}

/* ═══════════════════════════════════════════
   2) PROVAS (ANTES/DEPOIS)
   ═══════════════════════════════════════════ */

function ProvaSection() {
  return (
    <section className="w-full py-20 md:py-28 bg-secondary/20 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[140px]" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl relative z-10 flex flex-col gap-12">
        <ScrollReveal>
          <div className="text-center">
            <SectionTag>Na prática</SectionTag>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
              A diferença é{" "}
              <GradientText className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
                brutal.
              </GradientText>
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sem Viralize */}
            <motion.div
              className="glass-card p-8 rounded-2xl flex flex-col gap-5 border-destructive/20"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="text-lg font-bold font-display text-destructive">Sem Viralize</h3>
              </div>
              <ul className="flex flex-col gap-3">
                {["sem produto para vender", "vídeos ignorados", "zero vendas como afiliado"].map((item) =>
                <li key={item} className="flex items-center gap-3 text-muted-foreground">
                    <X className="h-4 w-4 text-destructive shrink-0" />
                    {item}
                  </li>
                )}
              </ul>
              <img
                src={semViralizeImg}
                alt="Poucas visualizações sem Viralize"
                className="w-full rounded-lg mt-2 opacity-80" />
              
            </motion.div>

            {/* Com Viralize */}
            <motion.div
              className="glass-card p-8 rounded-2xl flex flex-col gap-5 border-primary/30 shadow-glow relative overflow-hidden"
              whileHover={{ y: -4, boxShadow: "0 0 40px hsl(var(--primary) / 0.25)" }}
              transition={{ duration: 0.3 }}>
              
              <BorderTrail
                className="bg-gradient-to-l from-primary via-primary/50 to-transparent"
                size={60}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }} />
              
              <div className="flex items-center gap-3 mb-2 relative z-10">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                  <TrendingUp className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold font-display text-primary">Com Viralize</h3>
              </div>
              <ul className="flex flex-col gap-3 relative z-10">
                {["produto escolhido em minutos", "vídeos virais prontos com IA", "vendas chegando pelo TikTok"].map((item) =>
                <li key={item} className="flex items-center gap-3 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {item}
                  </li>
                )}
              </ul>
              <img
                src={comViralizeImg}
                alt="Muitas visualizações com Viralize"
                className="w-full rounded-lg mt-2 relative z-10" />
              
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>);

}

/* ═══════════════════════════════════════════
   3) COMO FUNCIONA
   ═══════════════════════════════════════════ */

function ComoFuncionaSection() {
  const steps = [
  { num: "01", title: "Escolha o produto", desc: "Acesse o catálogo e escolha um infoproduto ou produto físico do TikTok Shop para promover." },
  { num: "02", title: "Crie vídeos virais", desc: "Use a IA da Viralize para gerar roteiros, copy e estrutura de vídeos com potencial de viralização." },
  { num: "03", title: "Publique e venda", desc: "Poste os vídeos no TikTok e direcione o tráfego orgânico para o seu link de afiliado." }];


  return (
    <section className="w-full py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl flex flex-col gap-12">
        <ScrollReveal>
          <div className="text-center">
            <SectionTag>Como funciona</SectionTag>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
              Produto, vídeo e venda.{" "}
              <GradientText className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
                3 passos.
              </GradientText>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) =>
          <ScrollReveal key={step.num} delay={i * 0.1}>
              <motion.div
              className="glass-card p-6 rounded-2xl flex flex-col gap-4 h-full"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}>
              
                <span className="text-3xl font-bold font-display text-primary/30">{step.num}</span>
                <h3 className="text-lg font-bold font-display text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>);

}

/* ═══════════════════════════════════════════
   4) BENEFÍCIOS
   ═══════════════════════════════════════════ */

function BeneficiosSection() {
  const benefits = [
  "Catálogo de produtos prontos para promover como afiliado",
  "Acesso a infoprodutos e produtos físicos do TikTok Shop",
  "Vídeos virais criados com IA em poucos minutos",
  "Roteiros, copy e estrutura prontos para gravar",
  "Tráfego orgânico pelo TikTok sem gastar com anúncios",
  "Tudo dentro de uma plataforma: produto, vídeo e tráfego"];


  return (
    <section className="w-full py-20 md:py-28 bg-secondary/20 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[140px]" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl relative z-10 flex flex-col gap-10">
        <ScrollReveal>
          <div className="text-center">
            <SectionTag>Benefícios</SectionTag>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
              O que você{" "}
              <GradientText className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
                ganha na prática.
              </GradientText>
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((b, i) =>
            <motion.div
              key={i}
              className="glass-card px-5 py-4 rounded-xl flex items-start gap-3"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}>
              
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{b}</span>
              </motion.div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>);

}

/* ═══════════════════════════════════════════
   5) OFERTA VITALÍCIO
   ═══════════════════════════════════════════ */

function OfertaSection() {
  const [timer, setTimer] = useState({ min: 37, sec: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev.min === 0 && prev.sec === 0) return { min: 37, sec: 0 };
        if (prev.sec === 0) return { min: prev.min - 1, sec: 59 };
        return { ...prev, sec: prev.sec - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const features = [
  "Catálogo de produtos para afiliação (infoprodutos + TikTok Shop)",
  "Motor de criação de vídeos virais com IA",
  "Frameworks de viralização (HDC, PPMO, etc.)",
  "Roteiros e copy visual prontos para gravar",
  "Análise de roteiro com metodologia P-C-R",
  "Chat IA especializado em vídeos virais",
  "Suporte prioritário",
  "Garantia de 7 dias"];


  return (
    <section className="w-full py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px]" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-4">
            <SectionTag>Oferta exclusiva</SectionTag>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
              Escolha seu{" "}
              <GradientText className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
                plano
              </GradientText>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Produto, vídeo e tráfego na mesma plataforma. Comece agora.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="max-w-3xl mx-auto mt-10 grid md:grid-cols-2 gap-6">
            
            {/* MENSAL */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative glass-card rounded-2xl border border-border/60 p-8 overflow-hidden">

              <div className="relative z-10">
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-foreground">Mensal</h3>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  Acesso completo com renovação mensal.
                </p>

                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-sm text-muted-foreground">R$</span>
                    <span className="text-5xl font-bold text-foreground font-display tracking-tight">145</span>
                    <span className="text-sm text-muted-foreground mb-1.5">/mês</span>
                  </div>
                </div>

                <a
                  href={CHECKOUT_MONTHLY}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-secondary text-foreground py-3.5 rounded-xl font-semibold hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2 text-sm mb-6 border border-border/50">
                  
                  Começar agora
                  <ArrowRight className="h-4 w-4" />
                </a>

                <ul className="space-y-3">
                  {features.map((f) =>
                  <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  )}
                </ul>
              </div>
            </motion.div>

            {/* VITALÍCIO */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="relative glass-card rounded-2xl border border-primary/30 p-8 overflow-hidden shadow-glow">
              
              <BorderTrail
                className="bg-gradient-to-l from-primary via-primary/50 to-transparent"
                size={80}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }} />
              

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">Vitalício</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary px-2.5 py-1 rounded-full border border-primary/30">
                    Melhor oferta
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  Pague uma vez. Acesso permanente.
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base text-muted-foreground">12x de R$</span>
                    <span className="text-5xl font-bold text-foreground font-display tracking-tight">25,19</span>
                  </div>
                  <p className="text-sm text-muted-foreground/70 mt-2">ou R$245 à vista</p>
                </div>

                <a
                  href={CHECKOUT_LIFETIME}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full gradient-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-glow text-sm mb-6">
                  
                  Entrar para a Viralize
                  <ArrowRight className="h-4 w-4" />
                </a>

                <ul className="space-y-3">
                  {features.map((f) =>
                  <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  )}
                </ul>

                <div className="mt-6 pt-5 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  Pagamento único. Acesso permanente. Sem taxas escondidas.
                </div>
              </div>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>);

}

/* ═══════════════════════════════════════════
   6) FAQ
   ═══════════════════════════════════════════ */

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
  { q: "O que é a Viralize?", a: "A Viralize é uma plataforma que junta catálogo de produtos para afiliação e criação de vídeos virais com IA. Você encontra o produto, cria o vídeo e usa o TikTok para gerar tráfego e vendas." },
  { q: "Como funciona o acesso vitalício?", a: "Você paga uma única vez (R$245 à vista ou 12x de R$25,19) e tem acesso permanente a todas as funcionalidades, incluindo o catálogo de produtos e o motor de vídeos." },
  { q: "Tem garantia?", a: "Sim. Você tem 7 dias de garantia incondicional. Se não fizer sentido para você, devolvemos 100% do valor." },
  { q: "Preciso ter experiência?", a: "Não. A Viralize foi feita para iniciantes. Você escolhe o produto no catálogo, a IA cria o roteiro do vídeo e você só precisa postar." },
  { q: "Que tipo de produtos posso promover?", a: "O catálogo inclui infoprodutos de plataformas como Kiwify, Hotmart e Monetizze, além de produtos físicos disponíveis no TikTok Shop." },
  { q: "Funciona para qualquer nicho?", a: "Sim. O catálogo tem produtos de diversos nichos e os frameworks de viralização funcionam independente do mercado que você escolher." }];


  return (
    <section className="w-full py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl flex flex-col gap-10">
        <ScrollReveal>
          <div className="text-center">
            <SectionTag>Dúvidas</SectionTag>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
              Perguntas{" "}
              <GradientText className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
                frequentes.
              </GradientText>
            </h2>
          </div>
        </ScrollReveal>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) =>
          <ScrollReveal key={i} delay={i * 0.05}>
              <motion.div
              className="glass-card rounded-xl overflow-hidden"
              whileHover={{ y: -1 }}
              transition={{ duration: 0.2 }}>
              
                <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left">
                
                  <span className="text-sm font-medium text-foreground">{faq.q}</span>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200", openIndex === i && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {openIndex === i &&
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden">
                  
                      <p className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </motion.div>
                }
                </AnimatePresence>
              </motion.div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>);

}

/* ═══════════════════════════════════════════
   7) FECHAMENTO (HARD CLOSE)
   ═══════════════════════════════════════════ */

function FechamentoSection() {
  return (
    <section className="w-full py-20 md:py-28 bg-secondary/20 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px]" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl text-center relative z-10">
        <ScrollReveal>
          <div className="flex flex-col items-center gap-6">
            <p className="text-lg text-muted-foreground">Produto para vender. Vídeo para viralizar. Tráfego para converter.</p>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display leading-tight">
              Acesso vitalício por{" "}
              <span className="text-muted-foreground/50 line-through text-2xl sm:text-3xl">R$697</span>{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">12x de R$25,19

              </span>
            </p>
            <p className="text-muted-foreground text-sm max-w-md">
              ou R$245 à vista. Pagamento único. Garantia de 7 dias.
            </p>
            <a
              href={CHECKOUT_LIFETIME}
              target="_blank"
              rel="noopener noreferrer"
              className="gradient-primary text-primary-foreground px-10 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-glow text-base">
              
              Começar agora
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, repeatDelay: 2, duration: 1 }}>
                <ArrowRight className="h-5 w-5" />
              </motion.span>
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>);

}

/* ═══════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════ */

function Footer() {
  const { isDark } = useTheme();
  return (
    <footer className="w-full border-t border-border/50 py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src={isDark ? logoViralize : logoViralizeLight} alt="Viralize" className="h-9" />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Viralize. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>);

}

/* ═══════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════ */

export default function PaginaVendas() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <ProvaSection />
      <ComoFuncionaSection />
      <BeneficiosSection />
      <OfertaSection />
      <FAQSection />
      <FechamentoSection />
      <Footer />
    </div>);

}