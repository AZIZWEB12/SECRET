import { cn } from "@/lib/utils";
import Image from "next/image";

export function AppLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Le Secret du Concours"
      width={40}
      height={40}
      className={cn("h-10 w-10", className)}
      priority
    />
  );
}
