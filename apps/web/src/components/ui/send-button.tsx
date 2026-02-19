import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface SendButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "default";
}

export function SendButton({
  size = "default",
  className,
  ...props
}: SendButtonProps) {
  const sizeClass =
    size === "sm"
      ? "h-7 w-7 [&_svg]:h-3 [&_svg]:w-3"
      : "h-9 w-9 [&_svg]:h-3.5 [&_svg]:w-3.5";

  return (
    <button
      type="submit"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-[#0066ff] text-white transition-colors hover:bg-[#0052cc] disabled:opacity-30",
        sizeClass,
        className,
      )}
      {...props}
    >
      <Send />
    </button>
  );
}
