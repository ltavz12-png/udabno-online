import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "sage" | "wine";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-earth-100 text-earth-700": variant === "default",
          "bg-sage-100 text-sage-700": variant === "sage",
          "bg-wine-500/10 text-wine-600": variant === "wine",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
