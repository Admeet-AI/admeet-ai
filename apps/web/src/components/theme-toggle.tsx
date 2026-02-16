"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useThemeStore } from "@/stores/theme";

const OPTIONS = [
  { value: "light", icon: Sun, label: "라이트" },
  { value: "dark", icon: Moon, label: "다크" },
  { value: "system", icon: Monitor, label: "시스템" },
] as const;

const ACTIVE_ICON = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const ActiveIcon = ACTIVE_ICON[theme];

  return (
    <div className="group fixed bottom-6 right-6 z-50">
      {/* 펼쳐지는 옵션 패널 (pb-2로 트리거와 연결해 hover 영역 유지) */}
      <div className="absolute bottom-full right-0 pb-2 flex flex-col gap-1.5 opacity-0 translate-y-2 scale-95 pointer-events-none transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              aria-label={opt.label}
              className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-md backdrop-blur-md transition-all duration-150 hover:scale-110 ${
                isActive
                  ? "border-[#00d4ff]/40 bg-[#00d4ff]/10 text-[#00d4ff] shadow-[0_0_12px_rgba(0,212,255,0.2)]"
                  : "border-border/50 bg-background/80 text-foreground/60 hover:text-foreground hover:border-border"
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      {/* 트리거 버튼 */}
      <button
        aria-label={`현재 테마: ${theme}`}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-border/50 bg-background/80 text-foreground shadow-lg backdrop-blur-md transition-all duration-200 group-hover:shadow-xl group-hover:border-border"
      >
        <ActiveIcon className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}
