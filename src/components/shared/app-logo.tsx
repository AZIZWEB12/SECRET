import Link from 'next/link';
import { cn } from '@/lib/utils';

export function AppLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 group", className)}>
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 via-purple-500 to-primary rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-6deg]">
           <span className="text-white font-black text-lg tracking-tighter">GTC</span>
        </div>
      </div>
    </div>
  );
}
