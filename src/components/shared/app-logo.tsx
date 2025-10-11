import { cn } from "@/lib/utils";

export function AppLogo({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      aria-label="Le Secret du Concours"
      className={cn("h-8 w-8 text-primary", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>Le Secret du Concours</title>
      <circle cx="12" cy="12" r="10" />
      <path d="M15.5 16.5a4 4 0 1 0 0-8" />
      <path d="M8.5 16.5a4 4 0 1 1 0-8" />
    </svg>
  );
}
