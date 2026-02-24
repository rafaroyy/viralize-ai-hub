import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ArrowRight, X, TrendingDown, TrendingUp, Shield } from "lucide-react";
import logoViralize from "@/assets/logo-viralize.png";
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

function ImpactLine({ children, className }: {children: React.ReactNode;className?: string;}) {
  return (
    <p className={cn("text-xl sm:text-2xl lg:text-3xl font-bold font-display text-foreground leading-tight", className)}>
      {children}
    </p>);

}

const CHECKOUT_URL = "https://checkout.centerpag.com/PPU38CQ6M3E";

/* ═══════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════ */

function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="shrink-0">
          <img src={logoViralize} alt="Viralize" className="h-24 object-contain" />
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">
            Entrar
          </Link>
          <a
            href={CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-glow">

            Começar agora
          </a>
        </div>
      </div>
    </header>);

}

/* ═══════════════════════════════════════════
   1) HERO
   ═══════════════════════════════════════════ */

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-20 md:py-32 relative z-10 max-w-3xl text-center flex flex-col items-center gap-8">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] font-display">

          Todos os dias alguém desconhecido fica rico com vídeos simples.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-xl">

          E não é quem trabalha mais. É quem viraliza.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl sm:text-3xl font-bold font-display text-primary">

          Visualização virou dinheiro.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-3">

          <a
            href={CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-primary text-primary-foreground px-10 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-glow text-base">

            Quero começar agora
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
   2) DOR + INVEJA
   ═══════════════════════════════════════════ */

function DorSection() {
  const lines = [
  "Eles não são mais inteligentes.",
  "Não começaram antes.",
  "Não têm mais seguidores.",
  "Só entenderam como fazer vídeos que o algoritmo entrega."];


  return (
    <section className="w-full py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl text-center flex flex-col gap-10">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
            Enquanto você assiste, outros estão faturando.
          </h2>
        </ScrollReveal>

        <div className="flex flex-col gap-4">
          {lines.map((line, i) =>
          <ScrollReveal key={i} delay={i * 0.1}>
              <p className="text-base sm:text-lg text-muted-foreground">{line}</p>
            </ScrollReveal>
          )}
        </div>

        <ScrollReveal delay={0.4}>
          <ImpactLine>Quem domina atenção, domina vendas.</ImpactLine>
        </ScrollReveal>
      </div>
    </section>);

}

/* ═══════════════════════════════════════════
   3) VIRADA MENTAL
   ═══════════════════════════════════════════ */

function ViradaSection() {
  return (
    <section className="w-full py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[140px]" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl text-center flex flex-col gap-10 relative z-10">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
            O jogo não é sobre trabalhar. É sobre aparecer.
          </h2>
        </ScrollReveal>

        <div className="flex flex-col gap-4">
          <ScrollReveal delay={0.1}>
            <p className="text-base sm:text-lg text-muted-foreground">Produtos bons existem aos milhares.</p>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className="text-base sm:text-lg text-muted-foreground">O que falta é alcance.</p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-base sm:text-lg text-muted-foreground font-semibold text-foreground">Sem alcance = sem vendas.</p>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.3}>
          <ImpactLine className="text-primary">Você não precisa de outro produto. Precisa de visualizações.</ImpactLine>
        </ScrollReveal>
      </div>
    </section>);

}

/* ═══════════════════════════════════════════
   4) SOLUÇÃO (VIRALIZE)
   ═══════════════════════════════════════════ */

function SolucaoSection() {
  const semItems = ["criatividade", "experiência", "audiência"];

  return (
    <section className="w-full py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl text-center flex flex-col gap-10">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
            A ferramenta criada para fabricar vídeos virais.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="text-base sm:text-lg text-muted-foreground">
            A Viralize usa inteligência artificial para estruturar vídeos com alto potencial de alcance.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="flex flex-col gap-4 items-center">
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium mb-2">Você não precisa de:</p>
            {semItems.map((item, i) =>
            <div key={i} className="flex items-center gap-3 text-lg text-muted-foreground">
                <X className="h-5 w-5 text-destructive shrink-0" />
                <span>{item}</span>
              </div>
            )}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <ImpactLine>Você só executa. A estrutura já vem pronta.</ImpactLine>
        </ScrollReveal>
      </div>
    </section>);

}

/* ═══════════════════════════════════════════
   5) PROVA (COMPARAÇÃO)
   ═══════════════════════════════════════════ */

function ProvaSection() {
  return (
    <section className="w-full py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[140px]" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl relative z-10 flex flex-col gap-12">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display text-center">
            A diferença é brutal.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sem Viralize */}
            <div className="glass-card p-8 rounded-2xl flex flex-col gap-5 border-destructive/20">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="h-6 w-6 text-destructive" />
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
            </div>

            {/* Com Viralize */}
            <div className="glass-card p-8 rounded-2xl flex flex-col gap-5 border-primary/30 shadow-glow">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-bold font-display text-primary">Com Viralize</h3>
              </div>
              <ul className="flex flex-col gap-3">
                {["explosão de alcance", "mensagens chegando", "vendas acontecendo"].map((item) =>
                <li key={item} className="flex items-center gap-3 text-foreground font-medium">
                    <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                    {item}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <ImpactLine className="text-center">O algoritmo promove quem entende o jogo.</ImpactLine>
        </ScrollReveal>
      </div>
    </section>);

}

/* ═══════════════════════════════════════════
   6) OFERTA
   ═══════════════════════════════════════════ */

function OfertaSection() {
  return (
    <section className="w-full py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px]" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 max-w-lg relative z-10 flex flex-col items-center gap-8 text-center">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
            Acesso vitalício à Viralize
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="flex flex-col items-center gap-2">
            <span className="text-lg text-muted-foreground/60 line-through">De R$ 645</span>
            <div className="flex items-end gap-2">
              <span className="text-sm text-muted-foreground">por apenas</span>
              <span className="text-6xl font-bold font-display text-foreground">R$245

              </span>
            </div>
            <span className="text-sm text-muted-foreground mt-1">Pagamento único.</span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <p className="text-base text-muted-foreground italic">
            Menos que o valor de um vídeo viral pode gerar.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <a href={CHECKOUT_URL} target="_blank"
          rel="noopener noreferrer"
          className="gradient-primary text-primary-foreground px-10 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-glow text-base">

            Quero começar agora
            <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, repeatDelay: 2, duration: 1 }}>
              <ArrowRight className="h-5 w-5" />
            </motion.span>
          </a>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            Pagamento seguro. Acesso imediato.
          </div>
        </ScrollReveal>
      </div>
    </section>);

}

/* ═══════════════════════════════════════════
   7) FECHAMENTO
   ═══════════════════════════════════════════ */

function FechamentoSection() {
  return (
    <section className="w-full py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl text-center">
        <ScrollReveal>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display leading-tight">
            Daqui a 1 ano, você vai desejar ter começado hoje.
          </p>
        </ScrollReveal>
      </div>
    </section>);

}

/* ═══════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════ */

function Footer() {
  return (
    <footer className="w-full border-t border-border/50 py-8">
      <div className="container mx-auto px-4 sm:px-6 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Viralize. Todos os direitos reservados.
        </p>
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
      <DorSection />
      <ViradaSection />
      <SolucaoSection />
      <ProvaSection />
      <OfertaSection />
      <FechamentoSection />
      <Footer />
    </div>);

}