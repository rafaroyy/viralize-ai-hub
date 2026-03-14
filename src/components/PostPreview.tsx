import { useRef, useState } from 'react';
import { Download, Loader2, Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';

interface PostPreviewProps {
  parteVisual: string;
  descricaoPost: string;
  referenceImage: string | null;
  userName?: string;
}

export function PostPreview({ parteVisual, descricaoPost, referenceImage, userName = 'Seu Perfil' }: PostPreviewProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
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

  // Split parteVisual into lines for the visual headline
  const headlineLines = parteVisual?.split('\n').filter(Boolean) || [];

  // Truncate descricaoPost for preview (like Instagram)
  const descPreview = descricaoPost || '';
  const descLines = descPreview.split('\n');
  const shortDesc = descLines.slice(0, 4).join('\n');
  const hasMore = descLines.length > 4;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-foreground">Visualização do Post</h3>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Exportar Imagem
        </Button>
      </div>

      {/* ---- THE POST CARD (exported as PNG) ---- */}
      <div
        ref={cardRef}
        className="mx-auto overflow-hidden"
        style={{
          width: '100%',
          maxWidth: 480,
          backgroundColor: '#ffffff',
          borderRadius: 16,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a' }}>
            {userName}
          </span>
        </div>

        {/* Visual / Image area */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1 / 1',
            backgroundColor: '#f3f4f6',
            overflow: 'hidden',
          }}
        >
          {referenceImage && (
            <img
              src={referenceImage}
              alt="Post"
              crossOrigin="anonymous"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          )}

          {/* Headline overlay */}
          {headlineLines.length > 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '32px 20px 20px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 60%, transparent 100%)',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              {headlineLines.map((line, i) => (
                <span
                  key={i}
                  style={{
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: headlineLines.length > 2 ? 18 : 22,
                    lineHeight: 1.25,
                    textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                  }}
                >
                  {line}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <Heart size={24} color="#1a1a1a" />
            <MessageCircle size={24} color="#1a1a1a" />
            <Send size={24} color="#1a1a1a" />
          </div>
          <Bookmark size={24} color="#1a1a1a" />
        </div>

        {/* Caption / description */}
        <div style={{ padding: '0 16px 16px' }}>
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.5,
              color: '#1a1a1a',
              whiteSpace: 'pre-line',
              margin: 0,
              wordBreak: 'break-word',
            }}
          >
            <span style={{ fontWeight: 600 }}>{userName}</span>{' '}
            {shortDesc}
            {hasMore && (
              <span style={{ color: '#8e8e8e' }}> ...mais</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
