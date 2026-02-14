"use client";

import { cn } from "@/lib/utils";
import { Play, Eye } from "lucide-react";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
  onClick?: () => void;
  isActive?: boolean;
}

function DisplayCard({
  className,
  icon = <Play className="h-4 w-4" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconClassName = "text-primary",
  titleClassName = "text-primary",
  onClick,
  isActive = false,
}: DisplayCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer relative flex flex-col rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 transition-all duration-500 w-[200px] h-[340px] shrink-0",
        "[&>*]:flex [&>*]:items-center [&>*]:gap-2",
        isActive && "border-primary/60 shadow-glow scale-105 z-10",
        className
      )}
    >
      <div>
        <span className={cn("flex items-center justify-center rounded-full border border-border/50 bg-secondary/60 p-2", iconClassName)}>
          {icon}
        </span>
        <p className={cn("text-sm font-semibold", titleClassName)}>{title}</p>
      </div>

      <p className="text-xs text-muted-foreground mt-2 line-clamp-3 flex-1">{description}</p>

      <p className="text-[10px] text-muted-foreground/60 mt-auto">{date}</p>
    </div>
  );
}

interface VideoDisplayCardProps {
  video: {
    title: string;
    platform: string;
    duration: string;
    views: string;
    likes: string;
    framework: string;
    hook: string;
  };
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

export function VideoDisplayCard({ video, isActive, onClick, className }: VideoDisplayCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer relative flex flex-col rounded-xl border bg-card/80 backdrop-blur-sm transition-all duration-500 w-[180px] sm:w-[200px] h-[320px] sm:h-[360px] shrink-0 overflow-hidden group",
        isActive
          ? "border-primary/60 shadow-glow scale-105 z-10 grayscale-0"
          : "border-border/30 grayscale-[80%] opacity-60 hover:opacity-80 hover:grayscale-[40%]",
        className
      )}
    >
      {/* Video placeholder area */}
      <div className="relative flex-1 bg-secondary/40 flex items-center justify-center min-h-[180px]">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <Play className={cn(
          "h-8 w-8 transition-all duration-300",
          isActive ? "text-primary" : "text-muted-foreground/40"
        )} />
        {/* Platform badge */}
        <span className="absolute top-2 left-2 text-[9px] font-medium bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/20">
          {video.platform}
        </span>
        {/* Framework badge */}
        <span className="absolute top-2 right-2 text-[9px] font-bold text-primary/80 bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
          {video.framework}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5">
        <p className={cn(
          "text-xs font-semibold line-clamp-2 transition-colors",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}>
          {video.title}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" />{video.views}</span>
          <span>❤ {video.likes}</span>
          <span className="ml-auto">{video.duration}</span>
        </div>
        {isActive && (
          <p className="text-[10px] text-muted-foreground/80 italic line-clamp-2 mt-0.5">
            "{video.hook}"
          </p>
        )}
      </div>
    </div>
  );
}

export { DisplayCard };
export default DisplayCard;
