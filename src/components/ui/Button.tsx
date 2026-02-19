import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          {
            "bg-sage-600 hover:bg-sage-700 text-white": variant === "primary",
            "bg-earth-500 hover:bg-earth-600 text-white":
              variant === "secondary",
            "border-2 border-earth-400 text-earth-700 hover:bg-earth-500 hover:text-white":
              variant === "outline",
            "text-earth-700 hover:bg-earth-100": variant === "ghost",
          },
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-5 py-2.5 text-sm": size === "md",
            "px-6 py-3 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
