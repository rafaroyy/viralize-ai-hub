import { useEffect, useState } from 'react';
import { Flame, Copy, Trash2, Loader2, Clock, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface HistoryItem {
  id: string;
  tipo: string;
  titulo: string;
  payload: any;
  created_at: string;
}

const Historico = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('user_history' as any)
      .select('*')
      .eq('user_id', String(user.user_id))
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Erro ao carregar histórico', description: error.message, variant: 'destructive' });
    } else {
      setItems((data as any[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(id);
    const { error } = await supabase.from('user_history' as any).delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    } else {
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
      toast({ title: 'Registro excluído' });
    }
    setDeleting(null);
  };

  if (selectedItem) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Button variant="ghost" className="mb-4 gap-2" onClick={() => setSelectedItem(null)}>
            <ChevronLeft className="w-4 h-4" /> Voltar
          </Button>
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant={selectedItem.tipo === 'analise' ? 'default' : 'secondary'}>
                {selectedItem.tipo === 'analise' ? 'Análise' : 'Modelo'}
              </Badge>
              <h2 className="text-xl font-bold">{selectedItem.titulo}</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(selectedItem.created_at).toLocaleString('pt-BR')}
            </p>
            <div className="rounded-xl bg-secondary/30 p-4 overflow-auto max-h-[70vh]">
              <pre className="text-sm text-foreground/80 whitespace-pre-wrap break-words">
                {JSON.stringify(selectedItem.payload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Histórico</h1>
          <p className="text-sm text-muted-foreground">Suas análises e modelos salvos automaticamente.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>Nenhum registro ainda.</p>
            <p className="text-sm">Suas análises e modelos aparecerão aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="rounded-2xl border border-border bg-card p-5 space-y-3 cursor-pointer hover:border-primary/40 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {item.tipo === 'analise' ? (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Flame className="w-4 h-4 text-primary" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <Badge variant={item.tipo === 'analise' ? 'default' : 'secondary'} className="text-xs">
                      {item.tipo === 'analise' ? 'Análise' : 'Modelo'}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={(e) => handleDelete(item.id, e)}
                    disabled={deleting === item.id}
                  >
                    {deleting === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
                <h3 className="font-semibold text-sm truncate">{item.titulo}</h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleString('pt-BR')}
                </p>
                {item.tipo === 'analise' && item.payload?.overallScore !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Score:</span>
                    <span className="text-sm font-bold text-primary">{item.payload.overallScore}/100</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Historico;
