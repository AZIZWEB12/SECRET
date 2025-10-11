import { cn } from "@/lib/utils";

export function AppLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={cn("h-10 w-10", className)}
    >
      <defs>
        <style>
          {`
            .s-path {
              stroke: hsl(var(--primary));
              stroke-width: 8;
              fill: none;
              stroke-linecap: round;
              stroke-linejoin: round;
              stroke-dasharray: 200;
              stroke-dashoffset: 200;
              animation: draw-s 2s ease-in-out forwards;
            }
            .dc-path {
              stroke: hsl(var(--primary));
              stroke-width: 8;
              fill: none;
              stroke-linecap: round;
              stroke-linejoin: round;
              stroke-dasharray: 300;
              stroke-dashoffset: 300;
              animation: draw-dc 2s ease-in-out 0.5s forwards;
            }
            @keyframes draw-s {
              to {
                stroke-dashoffset: 0;
              }
            }
            @keyframes draw-dc {
              to {
                stroke-dashoffset: 0;
              }
            }
          `}
        </style>
      </defs>
      <g transform="translate(5, 5) scale(0.9)">
        <path
          className="s-path"
          d="M65,20 a15,15 0 1,1 -30,0 a15,15 0 0,1 30,0"
        />
        <path
          className="dc-path"
          d="M65,80 a15,15 0 1,1 -30,0 a15,15 0 0,0 30,0 M35,20 V80"
        />
      </g>
    </svg>
  );
}