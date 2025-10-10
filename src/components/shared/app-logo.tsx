import { cn } from "@/lib/utils";

export function AppLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("h-8 w-8 text-primary", className)}
      aria-label="Concours Master Prep Logo"
    >
      <g>
        <path
          d="M20,80 L50,20 L80,80"
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M35,60 L65,60"
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
