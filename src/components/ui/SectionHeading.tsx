import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  subtitle,
  className,
  align = "center",
}: {
  title: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "mb-10",
        align === "center" && "text-center",
        className
      )}
    >
      <h2 className="text-3xl sm:text-4xl font-heading font-bold text-earth-900">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-lg text-earth-600 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
