import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AiLoader } from "@/components/ui/ai-loader";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface DigestItem {
  title: string;
  description: string;
  platform: string;
}

interface DigestSection {
  title: string;
  items: DigestItem[];
}

interface DigestContent {
  week: string;
  sections: DigestSection[];
}

function getWeekKey(): string {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - jan1.getTime()) / 86400000);
  const weekNum = Math.ceil((days + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

const platformColors: Record<string, string> = {
  tiktok: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  instagram: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  youtube: "bg-red-500/20 text-red-400 border-red-500/30",
  twitter: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  kwai: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export function WeeklyDigestModal() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<DigestContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const weekKey = getWeekKey();
    const seenKey = `weekly_digest_seen_${weekKey}`;

    if (localStorage.getItem(seenKey)) return;

    setOpen(true);
    setLoading(true);
    setError(null);

    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/weekly-digest`;

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({}),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Erro ao carregar novidades");
        }
        return res.json();
      })
      .then((data: DigestContent) => {
        setContent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Weekly digest error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [isAuthenticated]);

  const handleClose = () => {
    const weekKey = getWeekKey();
    localStorage.setItem(`weekly_digest_seen_${weekKey}`, "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Novidades da Semana
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <AiLoader hideText />
            <p className="text-sm text-muted-foreground">Carregando novidades...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-sm text-destructive mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={handleClose}>Fechar</Button>
          </div>
        )}

        {content && !loading && (
          <div className="space-y-6">
            {content.sections.map((section, idx) => (
              <div key={idx}>
                <h3 className="text-base font-semibold mb-3">{section.title}</h3>
                <div className="space-y-2">
                  {section.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="rounded-lg border bg-card/50 p-3 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm">{item.title}</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize shrink-0 ${platformColors[item.platform] || ""}`}
                        >
                          {item.platform}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <Button className="w-full" onClick={handleClose}>
              <Sparkles className="h-4 w-4 mr-2" />
              Entendi, vamos criar!
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
