import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const catalogs = [
  {
    name: "TikTok Shop",
    description: "Catálogo de produtos virais para afiliação",
    url: "https://seller-br.tiktok.com/university/essay?default_language=pt-BR&knowledge_id=6825383530710785",
    gradient: "from-[hsl(340,80%,55%)] to-[hsl(280,70%,50%)]",
  },
  {
    name: "Kiwify",
    description: "Marketplace de infoprodutos digitais",
    url: "https://dashboard.kiwify.com/marketplace/",
    gradient: "from-[hsl(145,70%,45%)] to-[hsl(170,60%,40%)]",
  },
  {
    name: "Hotmart",
    description: "Maior marketplace de produtos digitais",
    url: "https://app.hotmart.com/",
    gradient: "from-[hsl(15,85%,55%)] to-[hsl(35,80%,50%)]",
  },
  {
    name: "Monetizze",
    description: "Plataforma completa de afiliação",
    url: "https://app.monetizze.com.br/loja",
    gradient: "from-[hsl(210,80%,55%)] to-[hsl(240,70%,50%)]",
  },
  {
    name: "Cakto",
    description: "Gateway de pagamento e marketplace",
    url: "https://app.cakto.com.br/",
    gradient: "from-[hsl(270,70%,55%)] to-[hsl(300,60%,50%)]",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const AffiliateHub = () => {
  return (
    <div className="min-h-screen p-6 md:p-10">
      {/* Hero */}
      <section className="pt-10 pb-12 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground leading-[1.1] max-w-3xl mx-auto"
        >
          Acesso Direto aos
          <br />
          Marketplaces de Elite.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-muted-foreground text-lg max-w-xl mx-auto"
        >
          Escolha um marketplace e acesse diretamente o catálogo de afiliação. Simples, rápido e sem fricção.
        </motion.p>
      </section>

      {/* Grid */}
      <section className="pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto"
        >
          {catalogs.map((catalog) => (
            <motion.a
              key={catalog.name}
              variants={cardVariants}
              href={catalog.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group relative overflow-hidden rounded-lg border border-border bg-card p-px cursor-pointer block"
            >
              <div className="relative h-44 overflow-hidden rounded-t-lg">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${catalog.gradient} opacity-30 group-hover:opacity-50 transition-opacity duration-300`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-black tracking-tighter text-foreground/10 group-hover:text-foreground/20 transition-colors duration-300 select-none">
                    {catalog.name}
                  </span>
                </div>
                <div className="absolute inset-0 backdrop-blur-[6px] group-hover:backdrop-blur-[2px] transition-all duration-500" />
              </div>

              <div className="p-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    {catalog.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {catalog.description}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium group-hover:bg-primary/90 transition-colors">
                  Abrir
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </section>
    </div>
  );
};

export default AffiliateHub;
