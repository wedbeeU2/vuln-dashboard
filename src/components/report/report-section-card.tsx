import React, { type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";

export function ReportSectionCard({
  children,
  count,
  description,
  title
}: {
  children: ReactNode;
  count?: ReactNode;
  description?: ReactNode;
  title: string;
}) {
  return (
    <Card>
      <CardHeader
        action={count !== undefined ? <Badge tone="neutral">{count}</Badge> : undefined}
        description={description}
        title={title}
      />
      {children}
    </Card>
  );
}
