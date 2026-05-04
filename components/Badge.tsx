import { CheckCircle2, Code2, CreativeCommons, Globe2, ShieldCheck } from "lucide-react";
import { badgeLabel, cn } from "@/lib/utils";
import type { BadgeType } from "@/types";

const icons = {
  verified: CheckCircle2,
  "open-source": Code2,
  "creative-commons": CreativeCommons,
  "public-domain": Globe2,
  "safe-download": ShieldCheck
};

export function Badge({ type, compact = false }: { type: BadgeType; compact?: boolean }) {
  const Icon = icons[type];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[#e74c3c]/25 bg-[#e74c3c]/10 font-bold text-[#ffb199]",
        compact ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs"
      )}
    >
      <Icon className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {badgeLabel(type)}
    </span>
  );
}
