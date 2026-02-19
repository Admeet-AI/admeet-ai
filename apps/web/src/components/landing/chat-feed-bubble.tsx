import { cn } from "@/lib/utils";

interface ChatFeedBubbleProps {
  align: "left" | "right";
  label: string;
  text: string;
  color: string;
  speakerType?: "ai" | "user";
  bubbleRef?: (el: HTMLDivElement | null) => void;
  className?: string;
  avatarText?: string;
}

const getInitial = (value: string): string => {
  const trimmed = value.trim();

  if (!trimmed) {
    return "?";
  }

  return [...trimmed][0] ?? "?";
};

export function ChatFeedBubble({
  align,
  label,
  text,
  color,
  speakerType,
  bubbleRef,
  className,
  avatarText,
}: ChatFeedBubbleProps) {
  const isRight = align === "right";
  const hasExplicitSpeakerType = speakerType !== undefined;
  const isAI = hasExplicitSpeakerType ? speakerType === "ai" : !isRight;
  const userBaseColor = hasExplicitSpeakerType ? "#94a3b8" : color;
  const resolvedAvatarText = avatarText ?? (isAI ? "에이" : getInitial(label));
  const bubbleBg = isAI ? `${color}17` : `${userBaseColor}1f`;
  const bubbleBorder = isAI ? `${color}26` : `${userBaseColor}40`;

  return (
    <div
      className={cn("flex w-full", isRight ? "justify-end" : "justify-start", className)}
      ref={bubbleRef}
    >
      <div className={cn("flex max-w-[90%] items-start gap-2", isRight ? "flex-row-reverse" : "flex-row")}>
        <div
          className={cn(
            "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold leading-none",
            isAI
              ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100"
              : hasExplicitSpeakerType
                ? "text-slate-700 dark:text-slate-100"
                : "text-blue-600 dark:text-blue-200",
          )}
          style={isAI ? undefined : { backgroundColor: `${userBaseColor}22` }}
          aria-hidden
        >
          {resolvedAvatarText}
        </div>

        <div
          className="rounded-2xl px-4 py-3 shadow-sm"
          style={{
            backgroundColor: bubbleBg,
            border: `1px solid ${bubbleBorder}`,
          }}
        >

          {isAI ? (
            <div className={cn("mb-1.5 flex items-center gap-2", isRight ? "justify-end" : "justify-start")}>
              <span
                className="inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-semibold leading-none text-slate-500 dark:text-slate-300"
                style={{
                  backgroundColor: `${color}15`,
                  color,
                }}
              >
                {label}
              </span>
            </div>
          ) : null}

          <p
            className={cn(
              "text-xs leading-relaxed text-slate-700 dark:text-slate-100",
              isRight ? "text-right" : "text-left",
            )}
          >
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}
