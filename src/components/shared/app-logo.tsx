import { cn } from "@/lib/utils";
import Image from "next/image";

export function AppLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="LE SECRET DU CONCOURS Logo"
      width={40}
      height={40}
      className={cn("h-10 w-auto", className)}
      unoptimized // Add this if the logo is a static asset in the public folder to avoid potential processing issues
    />
  );
}
