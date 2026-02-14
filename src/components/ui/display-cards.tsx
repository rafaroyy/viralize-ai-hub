"use client";

import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon = <Play className="h-4 w-4" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconClassName = "text-primary",
  titleClassName = "text-primary",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "cursor-pointer relative flex flex-col rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 transition-all duration-700 w-[200px] h-[340px] shrink-0",
        "[&>*]:flex [&>*]:items-center [&>*]:gap-2",
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

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards: DisplayCardProps[] = [
    {
      className:
        "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className:
        "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}

export { DisplayCard, DisplayCards };
export default DisplayCards;
