import { useRef, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';

interface PostPreviewProps {
  parteVisual: string;
  descricaoPost: string;
  artImageUrl: string | null;
  referenceImage: string | null;
}

export function PostPreview({ parteVisual, artImageUrl, referenceImage }: PostPreviewProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Use AI-generated art if available, fallback to reference image
  const backgroundImage = artImageUrl || referenceImage;

  const handleExport = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = 'post-modelado.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast({ title: 'Imagem exportada com sucesso!' });
    } catch (err: any) {
      toast({ title: 'Erro ao exportar', description: err.message, variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const headlineLines = parteVisual?.split('\n').filter(Boolean) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-foreground">Arte Gerada</h3>
          <p className="text-xs text-muted-foreground">
            {artImageUrl ? 'Fundo gerado por IA + texto aplicado via código' : 'Imagem de referência + texto aplicado via código'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Exportar PNG
        </Button>
      </div>

      {/* Canvas da arte — apenas isso é exportado */}
      <div
        ref={canvasRef}
        className="mx-auto overflow-hidden relative"
        style={{
          width: '100%',
          maxWidth: 480,
          aspectRatio: '4 / 5',
          backgroundColor: '#111111',
          borderRadius: 8,
        }}
      >
        {backgroundImage && (
          <img
            src={backgroundImage}
            alt="Arte"
            crossOrigin="anonymous"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}

        {headlineLines.length > 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '24px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
            }}
          >
            {headlineLines.map((line, i) => (
              <span
                key={i}
                style={{
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: headlineLines.length > 3 ? 18 : 24,
                  lineHeight: 1.3,
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                }}
              >
                {line}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
