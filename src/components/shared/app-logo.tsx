import { cn } from "@/lib/utils";
import Image from "next/image";

export function AppLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="LE SECRET DU CONCOURS Logo"
      width={40}
      height={40}
      className={cn("h-8 w-auto", className)}
    />
  );
}
