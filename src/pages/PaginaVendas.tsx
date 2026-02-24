import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, X, TrendingDown, TrendingUp, Shield, Check, Clock, ChevronDown } from "lucide-react";
import { BorderTrail } from "@/components/ui/border-trail";
import { GradientText } from "@/components/ui/gradient-text";
import logoViralize from "@/assets/logo-viralize.png";
import logoViralizeLight from "@/assets/logo-viralize-light.png";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

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

function ImpactLine({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-xl sm:text-2xl lg:text-3xl font-bold font-display text-foreground leading-tight", className)}>
      {children}
    </p>
  );
}

const CHECKOUT_URL = "https://checkout.centerpag.com/PPU38CQ6M3E";

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
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={isDark ? logoViralize : logoViralizeLight} alt="Viralize" className="h-28 object-contain" />
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors">
            Entrar
          </Link>
          <a
            href={CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-glow"
          >
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
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 overflow-hidden"
          >
            <nav className="container mx-auto px-6 py-4 flex flex-col gap-3">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-2">
                Entrar
              </Link>
              <a
                href={CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="text-sm text-primary hover:text-foreground py-2"
              >
                Começar agora
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
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
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] font-display"
        >
          Todos os dias alguém desconhecido{" "}
          <GradientText className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] font-display">
            fica rico com vídeos simples.
          </GradientText>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-xl"
        >
          E não é quem trabalha mais. É quem viraliza.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl sm:text-3xl font-bold font-display text-primary"
        >
          Visualização virou dinheiro.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-3"
        >
          <a
            href={CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-primary text-primary-foreground px-10 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-glow text-base"
          >
            Quero começar agora
            <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, repeatDelay: 2, duration: 1 }}>
              <ArrowRight className="h-5 w-5" />
            </motion.span>
          </a>
          <span className="text-sm text-muted-foreground">Pagamento único. Acesso vitalício.</span>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   2) DOR + INVEJA
   ═══════════════════════════════════════════ */

function DorSection() {
  const lines = [
    "Eles não são mais inteligentes.",
    "Não começaram antes.",
    "Não têm mais seguidores.",
    "Só entenderam como fazer vídeos que o algoritmo entrega.",
  ];

  return (
    <section className="w-full py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl text-center flex flex-col gap-10">
        <ScrollReveal>
          <SectionTag>Realidade</SectionTag>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
            Enquanto você assiste,{" "}
            <GradientText className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
              outros estão faturando.
            </GradientText>
          </h2>
        </ScrollReveal>

        <div className="flex flex-col gap-4">
          {lines.map((line, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <p className="text-base sm:text-lg text-muted-foreground">{line}</p>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.4}>
          <ImpactLine>Quem domina atenção, domina vendas.</ImpactLine>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   3) VIRADA MENTAL
   ═══════════════════════════════════════════ */

function ViradaSection() {
  return (
    <section className="w-full py-20 md:py-28 bg-secondary/20 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[140px]" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl text-center flex flex-col gap-10 relative z-10">
        <ScrollReveal>
          <SectionTag>Mentalidade</SectionTag>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
            O jogo não é sobre trabalhar.{" "}
            <GradientText className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
              É sobre aparecer.
            </GradientText>
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
    </section>
  );
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
          <SectionTag>Solução</SectionTag>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
            A ferramenta criada para{" "}
            <GradientText className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
              fabricar vídeos virais.
            </GradientText>
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
            {semItems.map((item, i) => (
              <motion.div
                key={i}
                className="glass-card px-6 py-3 rounded-xl flex items-center gap-3 w-fit"
                whileHover={{ y: -2, boxShadow: "0 0 20px hsl(var(--destructive) / 0.15)" }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-5 w-5 text-destructive shrink-0" />
                <span className="text-base text-muted-foreground">{item}</span>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <ImpactLine>Você só executa. A estrutura já vem pronta.</ImpactLine>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   5) PROVA (COMPARAÇÃO)
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
            <SectionTag>Comparação</SectionTag>
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
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="text-lg font-bold font-display text-destructive">Sem Viralize</h3>
              </div>
              <ul className="flex flex-col gap-3">
                {["vídeos ignorados", "perfil parado", "nenhuma venda"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-muted-foreground">
                    <X className="h-4 w-4 text-destructive shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Com Viralize */}
            <motion.div
              className="glass-card p-8 rounded-2xl flex flex-col gap-5 border-primary/30 shadow-glow relative overflow-hidden"
              whileHover={{ y: -4, boxShadow: "0 0 40px hsl(var(--primary) / 0.25)" }}
              transition={{ duration: 0.3 }}
            >
              <BorderTrail
                className="bg-gradient-to-l from-primary via-primary/50 to-transparent"
                size={60}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              />
              <div className="flex items-center gap-3 mb-2 relative z-10">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                  <TrendingUp className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold font-display text-primary">Com Viralize</h3>
              </div>
              <ul className="flex flex-col gap-3 relative z-10">
                {["explosão de alcance", "mensagens chegando", "vendas acontecendo"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <ImpactLine className="text-center">O algoritmo promove quem entende o jogo.</ImpactLine>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   6) OFERTA
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

  return (
    <section className="w-full py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px]" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-4">
            <SectionTag>Oferta</SectionTag>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
              Acesso vitalício à{" "}
              <GradientText className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
                Viralize
              </GradientText>
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="max-w-md mx-auto mt-10">
            <motion.div className="relative glass-card rounded-2xl border border-border/60 p-8 overflow-hidden">
              <BorderTrail
                className="bg-gradient-to-l from-primary via-primary/50 to-transparent"
                size={80}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-foreground">Vitalício</h3>
                  <span className="text-[10px] font-semibold bg-destructive/20 text-destructive px-2.5 py-1 rounded-full border border-destructive/30 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {String(timer.min).padStart(2, "0")}:{String(timer.sec).padStart(2, "0")}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-6">Pague uma vez, use para sempre.</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base text-muted-foreground/50 line-through">De R$ 645</span>
                    <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                      -62% OFF
                    </span>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-sm text-muted-foreground">R$</span>
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-5xl font-bold text-foreground font-display tracking-tight"
                    >
                      247
                    </motion.span>
                    <span className="text-sm text-muted-foreground mb-1.5"> único</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground italic mb-6">
                  Menos que o valor de um vídeo viral pode gerar.
                </p>

                {/* CTA */}
                <a
                  href={CHECKOUT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full gradient-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-glow text-sm mb-6"
                >
                  Quero começar agora
                  <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, repeatDelay: 2, duration: 1 }}>
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                </a>

                {/* Shield */}
                <div className="pt-5 border-t border-border/50 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  Pagamento seguro. Acesso imediato.
                </div>
              </div>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   7) FECHAMENTO
   ═══════════════════════════════════════════ */

function FechamentoSection() {
  return (
    <section className="w-full py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px]" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl text-center relative z-10">
        <ScrollReveal>
          <div className="flex flex-col items-center gap-6">
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display leading-tight">
              Daqui a 1 ano, você vai desejar{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                ter começado hoje.
              </span>
            </p>
            <a
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="gradient-primary text-primary-foreground px-10 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-glow text-base"
            >
              Começar agora
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, repeatDelay: 2, duration: 1 }}>
                <ArrowRight className="h-5 w-5" />
              </motion.span>
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
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
    </footer>
  );
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
    </div>
  );
}
