import { cn } from "@/lib/utils";
import { DotLoader } from "@/components/ui/dot-loader";

const frames = [
  [14, 7, 0, 8, 6, 13, 20],
  [14, 7, 13, 20, 16, 27, 21],
  [14, 20, 27, 21, 34, 24, 28],
  [27, 21, 34, 28, 41, 32, 35],
  [34, 28, 41, 35, 48, 40, 42],
  [34, 28, 41, 35, 48, 42, 46],
  [34, 28, 41, 35, 48, 42, 38],
  [34, 28, 41, 35, 48, 30, 21],
  [34, 28, 41, 48, 21, 22, 14],
  [34, 28, 41, 21, 14, 16, 27],
  [34, 28, 21, 14, 10, 20, 27],
  [28, 21, 14, 4, 13, 20, 27],
  [28, 21, 14, 12, 6, 13, 20],
  [28, 21, 14, 6, 13, 20, 11],
  [28, 21, 14, 6, 13, 20, 10],
  [14, 6, 13, 20, 9, 7, 21],
];

export function AiLoader({ className, hideText = false }: { className?: string; hideText?: boolean }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <DotLoader frames={frames} duration={120} className="gap-1.5" dotClassName="h-2.5 w-2.5" />
      {!hideText && <p className="text-xs font-medium text-muted-foreground tracking-wide">Gerando vídeo...</p>}
    </div>
  );
}
