import { cn } from "@/lib/utils";

export function AiLoader({ className }: { className?: string }) {
  const text = "Generating";

  return (
    <div className={cn("flex flex-col items-center justify-center gap-6", className)}>
      <div
        className="w-[68px] h-[68px] rounded-full"
        style={{
          animation: "loader-rotate 3s cubic-bezier(0.17, 0.67, 0.83, 0.67) infinite",
          boxShadow:
            "0 10px 20px 0 #fff inset, 0 20px 30px 0 #ad5fff inset, 0 60px 60px 0 #471eec inset",
        }}
      />
      <div className="flex gap-[2px]">
        {text.split("").map((char, i) => (
          <span
            key={i}
            className="text-[13px] font-semibold tracking-wide text-foreground/70"
            style={{
              animation: "loader-letter-anim 2s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
              willChange: "transform, opacity",
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}
