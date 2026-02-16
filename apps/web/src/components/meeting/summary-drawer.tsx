"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SummaryPanel } from "./summary-panel";

interface SummaryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SummaryDrawer({ open, onOpenChange }: SummaryDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[360px] sm:max-w-[400px] p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle className="text-base">📊 실시간 요약</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-hidden p-4">
          <SummaryPanel />
        </div>
      </SheetContent>
    </Sheet>
  );
}
