import { useState, useEffect } from 'react';
import { Save, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCreatorProfile, CreatorProfile } from '@/hooks/useCreatorProfile';

const NICHES = [
  'humor', 'finanças', 'saúde', 'beleza', 'tech', 'educação',
  'lifestyle', 'fitness', 'culinária', 'games', 'moda', 'viagem',
  'negócios', 'motivacional', 'notícias', 'entretenimento', 'outro',
];

const CONTENT_STYLES = [
  { value: 'educativo', label: 'Educativo' },
  { value: 'entretenimento', label: 'Entretenimento' },
  { value: 'storytelling', label: 'Storytelling' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'opinião', label: 'Opinião / Reação' },
  { value: 'review', label: 'Review / Unboxing' },
];

const PLATFORMS = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram Reels' },
  { value: 'youtube', label: 'YouTube Shorts' },
  { value: 'kwai', label: 'Kwai' },
];

const VIEW_RANGES = [
  { value: '<1K', label: 'Menos de 1K' },
  { value: '1K-10K', label: '1K — 10K' },
  { value: '10K-100K', label: '10K — 100K' },
  { value: '100K-1M', label: '100K — 1M' },
  { value: '1M+', label: '1M+' },
];

const TONES = [
  { value: 'informal', label: 'Informal' },
  { value: 'profissional', label: 'Profissional' },
  { value: 'engraçado', label: 'Engraçado' },
  { value: 'motivacional', label: 'Motivacional' },
  { value: 'direto', label: 'Direto / Objetivo' },
];

export function CreatorProfileForm() {
  const { toast } = useToast();
  const { profile, loading, saving, saveProfile } = useCreatorProfile();
  const [form, setForm] = useState<CreatorProfile>(profile);
  const [subNicheInput, setSubNicheInput] = useState('');

  useEffect(() => { setForm(profile); }, [profile]);

  const set = <K extends keyof CreatorProfile>(key: K, value: CreatorProfile[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const togglePlatform = (p: string) => {
    const current = form.main_platforms;
    set('main_platforms', current.includes(p) ? current.filter(x => x !== p) : [...current, p]);
  };

  const addSubNiche = () => {
    const v = subNicheInput.trim().toLowerCase();
    if (v && !form.sub_niches.includes(v)) {
      set('sub_niches', [...form.sub_niches, v]);
    }
    setSubNicheInput('');
  };

  const removeSubNiche = (v: string) => set('sub_niches', form.sub_niches.filter(x => x !== v));

  const handleSave = async () => {
    if (!form.niche) {
      toast({ title: 'Selecione um nicho principal', variant: 'destructive' });
      return;
    }
    const err = await saveProfile(form);
    if (err) {
      toast({ title: 'Erro ao salvar perfil', description: err.message, variant: 'destructive' });
    } else {
      toast({ title: 'Perfil de criador salvo!' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-display text-base font-semibold">Por que preencher?</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Com seu perfil de criador preenchido, as análises virais ficam personalizadas para o seu nicho,
          público e estilo. Você também pode fazer análises genéricas quando quiser.
        </p>
      </div>

      <div className="glass-card p-6 space-y-5">
        {/* Nicho */}
        <div className="space-y-2">
          <Label>Nicho principal *</Label>
          <Select value={form.niche} onValueChange={v => set('niche', v)}>
            <SelectTrigger><SelectValue placeholder="Selecione seu nicho" /></SelectTrigger>
            <SelectContent>
              {NICHES.map(n => (
                <SelectItem key={n} value={n} className="capitalize">{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sub-nichos */}
        <div className="space-y-2">
          <Label>Sub-nichos</Label>
          <div className="flex gap-2">
            <Input
              value={subNicheInput}
              onChange={e => setSubNicheInput(e.target.value)}
              placeholder="Ex: skincare coreano"
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubNiche())}
            />
            <Button type="button" variant="outline" size="sm" onClick={addSubNiche}>+</Button>
          </div>
          {form.sub_niches.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {form.sub_niches.map(s => (
                <Badge key={s} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeSubNiche(s)}>
                  {s} <X className="w-3 h-3" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Público-alvo */}
        <div className="space-y-2">
          <Label>Público-alvo</Label>
          <Textarea
            value={form.target_audience}
            onChange={e => set('target_audience', e.target.value)}
            placeholder="Ex: Mulheres 25-35, classe B, interessadas em skincare"
            rows={2}
          />
        </div>

        {/* Estilo de conteúdo */}
        <div className="space-y-2">
          <Label>Estilo de conteúdo</Label>
          <Select value={form.content_style} onValueChange={v => set('content_style', v)}>
            <SelectTrigger><SelectValue placeholder="Selecione o estilo" /></SelectTrigger>
            <SelectContent>
              {CONTENT_STYLES.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Plataformas */}
        <div className="space-y-2">
          <Label>Plataformas principais</Label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(p => (
              <Badge
                key={p.value}
                variant={form.main_platforms.includes(p.value) ? 'default' : 'outline'}
                className="cursor-pointer select-none"
                onClick={() => togglePlatform(p.value)}
              >
                {p.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* @ do perfil */}
        <div className="space-y-2">
          <Label>@ do perfil principal</Label>
          <Input
            value={form.profile_handle}
            onChange={e => set('profile_handle', e.target.value)}
            placeholder="@seuperfil"
          />
        </div>

        {/* Média de views */}
        <div className="space-y-2">
          <Label>Média de views por vídeo</Label>
          <Select value={form.average_views} onValueChange={v => set('average_views', v)}>
            <SelectTrigger><SelectValue placeholder="Selecione a faixa" /></SelectTrigger>
            <SelectContent>
              {VIEW_RANGES.map(r => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tom de voz */}
        <div className="space-y-2">
          <Label>Tom de voz</Label>
          <Select value={form.tone_of_voice} onValueChange={v => set('tone_of_voice', v)}>
            <SelectTrigger><SelectValue placeholder="Selecione o tom" /></SelectTrigger>
            <SelectContent>
              {TONES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Objetivo */}
        <div className="space-y-2">
          <Label>Objetivo</Label>
          <Textarea
            value={form.goals}
            onChange={e => set('goals', e.target.value)}
            placeholder="Ex: Crescer pra 100K seguidores e monetizar com afiliados"
            rows={2}
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar perfil de criador'}
        </Button>
      </div>
    </div>
  );
}
