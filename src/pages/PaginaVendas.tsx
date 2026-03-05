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

const CHECKOUT_LIFETIME = "https://pay.zouti.com.br/checkout?poi=prod_offer_2eglvz23g6tqk19jd1b3xe";

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
            
            Garantir acesso
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
              
                Garantir acesso
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 text-sm text-primary border border-primary/30 rounded-full px-5 py-2 bg-primary/5">
          
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Este acesso foi liberado para você após a live.
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] font-display">
          
          Seu convite exclusivo para o{" "}
          <GradientText className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] font-display">
            acesso vitalício à Viralize.
          </GradientText>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-xl">
          
          Normalmente fechado ao público. Condição disponível por tempo limitado para quem participou da live.
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
            
            Quero garantir meu acesso vitalício
            <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, repeatDelay: 2, duration: 1 }}>
              <ArrowRight className="h-5 w-5" />
            </motion.span>
          </a>
          <span className="text-sm text-muted-foreground">Pagamento único. Acesso vitalício.</span>
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
              O que muda{" "}
              <GradientText className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
                na prática.
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
                {["vídeos ignorados", "perfil parado", "nenhuma venda"].map((item) =>
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
                {["explosão de alcance", "mensagens chegando", "vendas acontecendo"].map((item) =>
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
  { num: "01", title: "Escolha seu objetivo", desc: "Defina o tipo de vídeo e o resultado que quer alcançar." },
  { num: "02", title: "Viralize gera a estrutura", desc: "A IA cria roteiro, copy visual e framework de viralização prontos para gravar." },
  { num: "03", title: "Você posta com consistência", desc: "Execute com clareza e direção. Sem adivinhar, sem desperdiçar tempo." }];


  return (
    <section className="w-full py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl flex flex-col gap-12">
        <ScrollReveal>
          <div className="text-center">
            <SectionTag>Como funciona</SectionTag>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
              Simples assim.{" "}
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
  "Velocidade: saia da ideia ao roteiro em minutos",
  "Consistência: nunca mais fique sem saber o que postar",
  "Direção criativa: cada vídeo com estrutura validada",
  "Menos tentativa e erro: pare de adivinhar o que funciona",
  "Mais iteração: teste variações rápidas e encontre o que viraliza",
  "Clareza total: saiba exatamente o que gravar, falar e mostrar"];


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
  "Acesso completo ao motor de vídeos",
  "Frameworks de viralização (HDC, PPMO, etc.)",
  "Copy visual por frame",
  "Variações automáticas de roteiro",
  "Análise de roteiro com metodologia P-C-R",
  "Chat IA especializado em vídeos virais",
  "Upload de vídeos personalizados",
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
              Acesso vitalício à{" "}
              <GradientText className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
                Viralize
              </GradientText>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Pague uma vez. Use para sempre. Sem mensalidade, sem surpresas.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="max-w-md mx-auto mt-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative glass-card rounded-2xl border border-border/60 p-8 overflow-hidden">
              
              <BorderTrail
                className="bg-gradient-to-l from-primary via-primary/50 to-transparent"
                size={80}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }} />
              

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-foreground">Vitalício</h3>
                  <span className="text-[10px] font-semibold bg-destructive/20 text-destructive px-2.5 py-1 rounded-full border border-destructive/30 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {String(timer.min).padStart(2, '0')}:{String(timer.sec).padStart(2, '0')}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  Pague uma vez, use para sempre.
                </p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base text-muted-foreground/50 line-through">De R$ 697,00</span>
                    <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                      OFERTA DA LIVE
                    </span>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-sm text-muted-foreground">R$</span>
                    <span className="text-5xl font-bold text-foreground font-display tracking-tight">245</span>
                    <span className="text-sm text-muted-foreground mb-1.5"> único</span>
                  </div>
                </div>

                {/* CTA */}
                <a
                  href={CHECKOUT_LIFETIME}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full gradient-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-glow text-sm mb-6">
                  
                  Garantir acesso vitalício
                  <ArrowRight className="h-4 w-4" />
                </a>

                {/* Features */}
                <ul className="space-y-3">
                  {features.map((f) =>
                  <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  )}
                </ul>

                {/* Shield */}
                <div className="mt-6 pt-5 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  Pagamento único. Acesso completo. Sem taxas escondidas.
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
  { q: "O que é a Viralize?", a: "A Viralize é uma ferramenta de inteligência artificial que cria roteiros, estruturas e copy visual para vídeos com alto potencial de alcance. Você define o objetivo e ela entrega tudo pronto para gravar." },
  { q: "Como funciona o acesso vitalício?", a: "Você paga uma única vez e tem acesso completo a todas as funcionalidades da Viralize, sem mensalidade e sem cobranças futuras." },
  { q: "Tem garantia?", a: "Sim. Você tem 7 dias de garantia incondicional. Se não fizer sentido para você, devolvemos 100% do valor." },
  { q: "Preciso ter experiência com vídeos?", a: "Não. A Viralize foi feita justamente para quem não sabe por onde começar. A estrutura, o roteiro e a copy já vêm prontos." },
  { q: "Como acesso a plataforma após a compra?", a: "Após o pagamento, você recebe os dados de acesso por e-mail e já pode começar a usar imediatamente." },
  { q: "Funciona para qualquer nicho?", a: "Sim. A Viralize trabalha com frameworks de viralização que funcionam independente do nicho. Você adapta o conteúdo ao seu mercado." }];


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
            <p className="text-lg text-muted-foreground">Essa condição foi liberada para quem participou da live.</p>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display leading-tight">
              Acesso vitalício por{" "}
              <span className="text-muted-foreground/50 line-through text-2xl sm:text-3xl">R$697</span>{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">R$245.

              </span>
            </p>
            <p className="text-muted-foreground text-sm max-w-md">
              Pagamento único. Sem mensalidade. Garantia de 7 dias.
            </p>
            <a
              href={CHECKOUT_LIFETIME}
              target="_blank"
              rel="noopener noreferrer"
              className="gradient-primary text-primary-foreground px-10 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-glow text-base">
              
              Ativar acesso vitalício agora
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