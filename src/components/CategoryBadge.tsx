import { Badge } from "@/components/ui/badge";
import type { IssueCategory } from "@/types/issue";
import { Building2, ShieldAlert, Sparkles, BookOpen, Home, HelpCircle } from "lucide-react";

interface CategoryBadgeProps {
  category: IssueCategory;
  showIcon?: boolean;
  className?: string;
}

const categoryConfig: Record<IssueCategory, { variant: "infrastructure" | "safety" | "cleanliness" | "academics" | "hostel" | "other"; icon: typeof Building2 }> = {
  Infrastructure: { variant: "infrastructure", icon: Building2 },
  Safety: { variant: "safety", icon: ShieldAlert },
  Cleanliness: { variant: "cleanliness", icon: Sparkles },
  Academics: { variant: "academics", icon: BookOpen },
  Hostel: { variant: "hostel", icon: Home },
  Other: { variant: "other", icon: HelpCircle },
};

export const CategoryBadge = ({ category, showIcon = true, className }: CategoryBadgeProps) => {
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {category}
    </Badge>
  );
};
