import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useAnimation } from "framer-motion";
import { ArrowRight, PlayCircle, FileText, Wand2, Download, Check, ChevronDown, Sparkles, Zap, Shield, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import logoViralize from "@/assets/logo-viralize.png";
import logoViralizeLight from "@/assets/logo-viralize-light.png";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

/* ─── Scroll Reveal ─── */
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

/* ─── Navbar ─── */
function Navbar() {
  const { isDark } = useTheme();
  const [scrolled, setScrolled] = useState(false);
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
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <img src={isDark ? logoViralize : logoViralizeLight} alt="Viralize AI" className="h-10 object-contain" />
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "Recursos", href: "#features" },
            { label: "Como Funciona", href: "#how-it-works" },
            { label: "Preços", href: "#pricing" },
            { label: "FAQ", href: "#faq" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/criar"
            className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Login
          </Link>
          <Link
            to="/criar"
            className="gradient-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Começar Agora
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

/* ─── Hero ─── */
function HeroSection() {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/15 rounded-full blur-[120px]" />

      <div className="container mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <ScrollReveal>
          <motion.div className="flex flex-col justify-center space-y-6" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div className="space-y-4" variants={itemVariants}>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-7xl leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">O Cérebro Por Trás,</span>
                <br />
                <span className="text-foreground">Dos Vídeos Que Viralizam</span>
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                A IA que carrega os frameworks responsáveis por +500 milhões de impressões orgânicas no TikTok e Instagram.
                Crie vídeos virais baseados em frameworks reais de venda.
              </p>
            </motion.div>

            <motion.div className="flex flex-col gap-4 sm:flex-row sm:items-center" variants={itemVariants}>
              <Link
                to="/criar"
                className="gradient-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-glow"
              >
                Começar agora
                <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, repeatDelay: 2, duration: 1 }}>
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </Link>
              <a
                href="#how-it-works"
                className="bg-secondary/50 hover:bg-secondary text-foreground px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                Ver Como Funciona
              </a>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-4 flex gap-6">
              {[
                { value: "+500M", label: "Views Orgânicos" },
                { value: "3.5X", label: "Mais Engajamento" },
                { value: "95%", label: "Taxa de Viralização" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="relative h-[450px] w-full overflow-hidden rounded-xl border border-border/50 glass-card p-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-blue-500/20 z-10 rounded-xl" />
            <div className="relative z-20 h-full w-full rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/10 p-6 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="col-span-2 h-24 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center"
                  whileHover={{ scale: 1.03, boxShadow: "0 0 15px hsl(var(--primary) / 0.3)" }}
                >
                  <span className="text-xl text-foreground tracking-tight text-center font-bold">
                    Viralize AI Studio
                  </span>
                </motion.div>
                {["Roteiro Viral", "Edição IA", "Análise", "Exportar"].map((label, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                    className="h-28 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 10px hsl(var(--primary) / 0.2)" }}
                  >
                    <span className="text-sm text-muted-foreground">{label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ─── Features ─── */
function FeaturesSection() {
  const features = [
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: "Frameworks de Viralização",
      description: "Acesso aos mesmos frameworks usados por criadores que geram milhões de views.",
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Geração em Minutos",
      description: "Do prompt ao vídeo pronto para publicar em menos de 2 minutos.",
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
      title: "Análise de Roteiro P-C-R",
      description: "Metodologia exclusiva de Pergunta, Conflito e Resposta para máxima retenção.",
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Garantia de 7 Dias",
      description: "Teste a plataforma sem riscos. Não gostou? Devolvemos 100% do seu dinheiro.",
    },
  ];

  return (
    <section id="features" className="w-full py-20 md:py-32">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Por Que Criadores Escolhem a{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">Viralize AI</span>
            </h2>
            <p className="max-w-[700px] mx-auto text-muted-foreground md:text-lg">
              Ferramentas que transformam ideias em vídeos virais com frameworks comprovados de venda.
            </p>
          </div>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 0.1}>
              <motion.div
                className="glass-card p-6 h-full"
                whileHover={{ y: -4, boxShadow: "0 10px 40px hsl(var(--primary) / 0.1)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 shadow-glow">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How it works ─── */
function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Descreva Seu Prompt",
      description: "Digite o que você quer que o vídeo comunique. A IA entenderá seu objetivo e frameworks necessários.",
      icon: <FileText className="h-8 w-8 text-primary" />,
      details: ["Produto ou serviço", "Público-alvo", "Objetivo de venda"],
    },
    {
      number: "02",
      title: "IA Gera o Criativo",
      description: "Nossos frameworks analisam seu prompt e geram um vídeo otimizado para viralizar.",
      icon: <Wand2 className="h-8 w-8 text-blue-500" />,
      details: ["Copy visual", "Sequência de frames", "Gatilhos de atenção"],
    },
    {
      number: "03",
      title: "Customize e Exporte",
      description: "Ajuste cores, textos e timing. Exporte em qualidade profissional para suas redes.",
      icon: <Download className="h-8 w-8 text-primary" />,
      details: ["Personalização total", "Múltiplos formatos", "Pronto para publicar"],
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-20 md:py-32 bg-secondary/20">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Como Funciona
            </h2>
            <p className="max-w-[700px] mx-auto text-muted-foreground md:text-lg">
              Três passos simples para criar vídeos que convertem.
            </p>
          </div>
        </ScrollReveal>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 0.15}>
              <motion.div
                className="glass-card p-8 text-center h-full"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500 mb-4">
                  {step.number}
                </div>
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{step.description}</p>
                <ul className="space-y-2">
                  {step.details.map((detail) => (
                    <li key={detail} className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                      <Check className="h-3 w-3 text-primary" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <motion.div
            className="mt-16 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl border border-primary/30 p-8 text-center"
            whileHover={{ scale: 1.01 }}
          >
            <h3 className="text-2xl font-bold mb-2">
              Tempo Médio: <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">2 Minutos</span>
            </h3>
            <p className="text-muted-foreground">
              Do prompt ao vídeo pronto para publicar. Sem necessidade de conhecimentos técnicos em edição.
            </p>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ─── Pricing ─── */
function PricingSection() {
  const plans = [
    {
      name: "Mensal",
      price: "R$ 97",
      period: "/mês",
      description: "Perfeito para começar a criar vídeos virais.",
      features: [
        "Acesso ao Cérebro Viral",
        "Frameworks básicos de viralização",
        "12 vídeos por mês",
        "Suporte por email",
        "Garantia de 7 dias",
      ],
      popular: false,
    },
    {
      name: "Trimestral",
      price: "R$ 197",
      period: "/trimestre",
      description: "Melhor custo-benefício para criadores sérios.",
      features: [
        "Tudo do plano Mensal",
        "Frameworks avançados",
        "40 vídeos por trimestre",
        "Análise de conversão",
        "Suporte prioritário",
        "Relatórios de performance",
      ],
      popular: true,
    },
  ];

  return (
    <section id="pricing" className="w-full py-20 md:py-32">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Planos e Preços
            </h2>
            <p className="max-w-[700px] mx-auto text-muted-foreground md:text-lg">
              Escolha o plano ideal para o seu negócio.
            </p>
          </div>
        </ScrollReveal>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 0.15}>
              <motion.div
                className={cn(
                  "glass-card p-8 h-full relative",
                  plan.popular && "border-primary/50 shadow-glow"
                )}
                whileHover={{ y: -4 }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground text-xs font-medium px-4 py-1 rounded-full">
                    Mais Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/criar"
                  className={cn(
                    "block text-center py-3 rounded-lg font-medium transition-all w-full",
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

/* ─── CTA ─── */
function CtaSection() {
  return (
    <section className="w-full py-20 md:py-32 bg-gradient-to-br from-primary/10 to-blue-500/10">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
              Deixe a IA Pensar Como um Criativo Milionário
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl">
              Assine por R$97/mês e tenha acesso ao cérebro de quem vive de vídeos virais. Comece a gerar vídeos que vendem em minutos.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-4 mt-6">
              <Link
                to="/criar"
                className="gradient-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-glow text-lg"
              >
                Começar Agora
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, repeatDelay: 2, duration: 1 }}>
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </Link>
              <a
                href="#features"
                className="border border-border bg-background hover:bg-secondary text-foreground px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Ver Frameworks
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */
function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
    {
      question: "Como a Viralize AI cria os vídeos?",
      answer: "A Viralize AI usa frameworks de viralização comprovados, que foram responsáveis por mais de 500 milhões de impressões orgânicas. Nossa IA analisa seu prompt, aplica técnicas de copywriting, storytelling e edição estratégica para criar vídeos otimizados para engajamento.",
    },
    {
      question: "Preciso ter experiência em edição de vídeo?",
      answer: "Não! A Viralize AI foi criada justamente para quem não tem tempo ou conhecimento técnico. Nossa IA faz todo o trabalho pesado, desde o roteiro até a edição final. Você só precisa aprovar e publicar.",
    },
    {
      question: "Qual é a diferença entre o plano Mensal e Trimestral?",
      answer: "O plano Mensal (R$ 97/mês) oferece acesso ao Cérebro Viral com frameworks básicos, perfeito para começar. O plano Trimestral (R$ 197 a cada 3 meses) inclui todos os frameworks básicos e avançados, análise de conversão e suporte prioritário.",
    },
    {
      question: "Posso usar os vídeos comercialmente?",
      answer: "Sim! Todos os vídeos criados com a Viralize AI são 100% seus. Você pode usar em seus próprios canais, para clientes, revender ou como quiser.",
    },
    {
      question: "Como funciona a garantia de 7 dias?",
      answer: "Se você não ficar satisfeito com a Viralize AI nos primeiros 7 dias, devolvemos 100% do seu dinheiro, sem perguntas.",
    },
  ];

  return (
    <section id="faq" className="w-full py-20 md:py-32 bg-secondary/20">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Perguntas Frequentes</h2>
            <p className="max-w-[700px] mx-auto text-muted-foreground md:text-lg">
              Tudo que você precisa saber sobre a Viralize AI.
            </p>
          </div>
        </ScrollReveal>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <motion.div className="glass-card overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full p-5 flex items-center justify-between text-left"
                >
                  <span className="font-medium">{faq.question}</span>
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
                  <p className="px-5 pb-5 text-sm text-muted-foreground">{faq.answer}</p>
                </motion.div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  const { isDark } = useTheme();
  return (
    <footer className="w-full border-t border-border/50 py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <img src={isDark ? logoViralize : logoViralizeLight} alt="Viralize AI" className="h-10 mb-4" />
            <p className="text-sm text-muted-foreground">
              O cérebro por trás dos vídeos que viralizam.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3">Produto</h4>
            <ul className="space-y-2">
              {["Recursos", "Preços", "Como Funciona", "FAQ"].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase().replace(/ /g, "-")}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3">Empresa</h4>
            <ul className="space-y-2">
              {["Sobre", "Blog", "Contato"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3">Legal</h4>
            <ul className="space-y-2">
              {["Termos", "Privacidade"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border/50 pt-6">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Viralize AI. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Landing Page ─── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CtaSection />
      <FaqSection />
      <Footer />
    </div>
  );
}
