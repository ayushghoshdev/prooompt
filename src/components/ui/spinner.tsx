import { cn } from "@/lib/utils";
import { CircleNotchIcon } from "@phosphor-icons/react";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <CircleNotchIcon
      size={32}
      weight="bold"
      role="status"
      aria-label="Loading"
      className={cn("animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
