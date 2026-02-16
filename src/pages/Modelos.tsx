import { LayoutGrid, Clock } from "lucide-react";

const Modelos = () => {
  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Modelos de Edição</h1>
        </div>
        <p className="text-muted-foreground">Escolha um modelo para a IA se inspirar na criação do seu vídeo</p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <Clock className="w-10 h-10 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">Em Breve</h2>
        <p className="text-muted-foreground max-w-md">
          Estamos preparando modelos de edição incríveis para você. Fique ligado nas novidades!
        </p>
        <span className="mt-4 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
          Em desenvolvimento
        </span>
      </div>
    </div>
  );
};

export default Modelos;
