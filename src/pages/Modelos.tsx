import { LayoutGrid, Play, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const templates = [
  { id: 1, name: "Hook + Revelação", category: "Engajamento", duration: "15s", views: "2.3M", gradient: "from-purple-600 to-pink-500" },
  { id: 2, name: "Antes e Depois", category: "Transformação", duration: "30s", views: "1.8M", gradient: "from-blue-600 to-cyan-500" },
  { id: 3, name: "Top 5 Lista", category: "Educativo", duration: "60s", views: "950K", gradient: "from-orange-500 to-red-500" },
  { id: 4, name: "POV Storytelling", category: "Entretenimento", duration: "30s", views: "4.1M", gradient: "from-green-500 to-emerald-500" },
  { id: 5, name: "Tutorial Rápido", category: "Educativo", duration: "45s", views: "1.2M", gradient: "from-violet-600 to-purple-500" },
  { id: 6, name: "Reação + Opinião", category: "Engajamento", duration: "15s", views: "3.5M", gradient: "from-rose-500 to-pink-500" },
  { id: 7, name: "Desafio Viral", category: "Entretenimento", duration: "30s", views: "5.7M", gradient: "from-amber-500 to-orange-500" },
  { id: 8, name: "Produto Review", category: "Vendas", duration: "60s", views: "780K", gradient: "from-teal-500 to-cyan-500" },
  { id: 9, name: "Day in the Life", category: "Lifestyle", duration: "90s", views: "2.1M", gradient: "from-indigo-500 to-blue-500" },
];

const Modelos = () => {
  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold">Modelos de Edição</h1>
        </div>
        <p className="text-muted-foreground">Escolha um modelo para a IA se inspirar na criação do seu vídeo</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map((t) => (
          <div
            key={t.id}
            className="glass-card overflow-hidden group cursor-pointer hover:border-primary/50 transition-all duration-300"
          >
            {/* Preview Area */}
            <div className={`h-40 bg-gradient-to-br ${t.gradient} relative flex items-center justify-center`}>
              <div className="w-14 h-14 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-6 h-6 text-foreground" />
              </div>
              <span className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-background/20 backdrop-blur-sm text-foreground">
                {t.category}
              </span>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-display font-semibold mb-2">{t.name}</h3>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {t.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {t.views} views
                </span>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3 border-primary/30 text-primary hover:bg-primary/10">
                Usar Modelo
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Modelos;
