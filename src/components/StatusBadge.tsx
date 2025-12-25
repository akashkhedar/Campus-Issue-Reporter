import { Badge } from "@/components/ui/badge";
import type { IssueStatus } from "@/types/issue";
import { Clock, UserCheck, Loader2, CheckCircle2 } from "lucide-react";

interface StatusBadgeProps {
  status: IssueStatus;
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<
  IssueStatus,
  {
    variant: "reported" | "assigned" | "in-progress" | "resolved";
    icon: typeof Clock;
  }
> = {
  Reported: { variant: "reported", icon: Clock },
  Assigned: { variant: "assigned", icon: UserCheck },
  "In Progress": { variant: "in-progress", icon: Loader2 },
  Resolved: { variant: "resolved", icon: CheckCircle2 },
};

export const StatusBadge = ({
  status,
  showIcon = true,
  className,
}: StatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {status}
    </Badge>
  );
};
