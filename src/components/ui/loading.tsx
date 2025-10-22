import { cn } from "@/lib/utils";

type LoadingSize = "sm" | "md" | "lg";

interface LoadingProps {
  message?: string;
  size?: LoadingSize;
  fullScreen?: boolean;
}

const TEXT_BY_SIZE: Record<LoadingSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function Loading({
  message = "Cargando...",
  size = "md",
  fullScreen = false,
}: LoadingProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center transition-colors duration-150",
        fullScreen
          ? "min-h-screen bg-[radial-gradient(circle_at_top,_hsl(var(--background)_/_0.95)_0%,_hsl(var(--background)_/_0.9)_50%,_hsl(var(--background)_/_1)_100%)] dark:bg-[radial-gradient(circle_at_top,_hsl(var(--background)_/_1)_0%,_hsl(var(--background)_/_0.85)_60%,_hsl(var(--background)_/_1)_100%)] p-0"
          : "py-12 px-6"
      )}
    >
      <div className="text-center space-y-5 px-6">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-foreground/10 blur-xl dark:bg-foreground/20" />
          <div className="relative flex items-center justify-center gap-3">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className={cn(
                  "h-4 w-4 rounded-full bg-foreground",
                  size === "lg" && "h-5 w-5",
                  size === "sm" && "h-3 w-3"
                )}
                style={{
                  animation: "loading-dot 1.5s cubic-bezier(0.33, 1, 0.68, 1) infinite",
                  animationDelay: `${dot * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className={cn("text-muted-foreground", TEXT_BY_SIZE[size])}>
            {message}
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
            <span className="h-px w-6 bg-border" />
            <span>Pyson</span>
            <span className="h-px w-6 bg-border" />
          </div>
        </div>
      </div>
    </div>
  );
}
