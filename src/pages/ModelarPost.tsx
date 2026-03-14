import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, Sparkles, Copy, Lightbulb, Palette, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PostPreview } from '@/components/PostPreview';

interface Gatilho {
  nome: string;
  explicacao: string;
}

interface ModelResult {
  copyModelado: string;
  parteVisual: string;
  descricaoPost: string;
  gatilhosUtilizados: Gatilho[];
}

const goals = [
  { value: 'vender', label: 'Vender um produto/serviço' },
  { value: 'educar', label: 'Educar / ensinar algo' },
  { value: 'engajar', label: 'Gerar engajamento' },
  { value: 'autoridade', label: 'Mostrar autoridade' },
];

const tones = [
  { value: 'profissional', label: 'Profissional' },
  { value: 'descontraido', label: 'Descontraído' },
  { value: 'inspirador', label: 'Inspirador' },
  { value: 'urgente', label: 'Urgente / Escassez' },
];

const ModelarPost = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [niche, setNiche] = useState('');
  const [goal, setGoal] = useState('');
  const [tone, setTone] = useState('');
  const [audience, setAudience] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ModelResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Formato inválido', description: 'Envie um arquivo de imagem (PNG, JPG, WEBP)', variant: 'destructive' });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'O tamanho máximo é 20MB', variant: 'destructive' });
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const removeImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async () => {
    if (!imageFile) {
      toast({ title: 'Envie uma imagem', description: 'Faça upload da imagem do post para modelar', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const imageBase64 = await fileToBase64(imageFile);
      const { data, error } = await supabase.functions.invoke('model-post', {
        body: { imageBase64, niche, goal, tone, audience },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Erro ao modelar post');
      setResult(data.result);

      // Save to history
      if (user) {
        await supabase.from('user_history' as any).insert({
          user_id: String(user.user_id),
          tipo: 'modelo',
          titulo: niche ? `Modelo: ${niche.slice(0, 60)}` : 'Post modelado',
          payload: data.result,
        });
      }
    } catch (err: any) {
      toast({ title: 'Erro ao modelar', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Export is now handled by PostPreview component

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast({ title: 'Copiado!' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 px-6 py-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="text-primary">Modelar</span> Post
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Envie a imagem de um post e a IA vai criar uma copy adaptada ao seu nicho, com gatilhos mentais e diretrizes de design.
            </p>
          </div>

          {!result && (
            <div className="max-w-xl mx-auto space-y-4">
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Caso queira uma qualidade melhor, não tire print, recomendamos baixar a imagem original via{' '}
                  <a href="https://snapinsta.app" target="_blank" rel="noopener noreferrer" className="text-primary font-medium underline underline-offset-2 hover:text-primary/80">
                    Snapinsta
                  </a>{' '}
                  e fazer o upload aqui.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
                {!imageFile ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-secondary/20 transition-colors"
                  >
                    <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">Arraste ou clique para enviar</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP — máx. 20MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileSelect(f);
                      }}
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-secondary/30 p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0">
                        {imagePreview && (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{imageFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(imageFile.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0 w-8 h-8" onClick={removeImage}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Nicho ou negócio</Label>
                    <Input
                      placeholder="Ex: marketing digital, confeitaria, fitness..."
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Objetivo</Label>
                      <Select value={goal} onValueChange={setGoal}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {goals.map((g) => (
                            <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Tom de voz</Label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {tones.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Público-alvo</Label>
                    <Input
                      placeholder="Ex: empreendedores, mães, jovens 18-25..."
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isLoading || !imageFile}
                className="w-full h-12 text-base font-semibold gap-2 rounded-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Modelando com IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" /> Modelar Post
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Results Dashboard */}
          {result && (
            <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-start">
                <Button variant="outline" size="sm" onClick={() => setResult(null)} className="gap-2">
                  <Upload className="w-4 h-4" /> Novo upload
                </Button>
              </div>

              {/* Post Preview */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <PostPreview
                  parteVisual={result.parteVisual}
                  descricaoPost={result.descricaoPost}
                  referenceImage={imagePreview}
                  userName={niche || 'Seu Perfil'}
                />
              </div>

              {/* Copy Modelado */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Copy className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg">Copy Modelado</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => handleCopy(result.copyModelado, 'copy')}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedField === 'copy' ? 'Copiado!' : 'Copiar'}
                  </Button>
                </div>
                <div className="rounded-xl bg-secondary/30 border border-border/50 p-4">
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                    {result.copyModelado}
                  </p>
                </div>
              </div>

              {/* Gatilhos Utilizados */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">Gatilhos Utilizados</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.gatilhosUtilizados?.map((g, i) => (
                    <div key={i} className="rounded-xl bg-secondary/30 border border-border/50 p-4 space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                        {g.nome}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{g.explicacao}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Descrição do Post */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Palette className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Descrição do Post</h3>
                      <p className="text-xs text-muted-foreground">Legenda e hashtags para acompanhar o post</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => handleCopy(result.descricaoPost || '', 'descricao')}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedField === 'descricao' ? 'Copiado!' : 'Copiar'}
                  </Button>
                </div>
                <div className="rounded-xl bg-secondary/30 border border-border/50 p-4">
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                    {result.descricaoPost || 'Nenhuma descrição gerada.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ModelarPost;
