import React from "react";
import { Check, Clock, Loader2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getStatusMeta } from "@/lib/ui/scan-presenters";

const icons = {
  check: Check,
  clock: Clock,
  loader: Loader2,
  x: X
};

export function StatusBadge({ status }: { status: string }) {
  const meta = getStatusMeta(status);
  const Icon = icons[meta.icon];

  return (
    <Badge aria-label={`Status: ${meta.label}`} tone={meta.tone}>
      <Icon aria-hidden="true" className="h-3 w-3" />
      {meta.label}
    </Badge>
  );
}
