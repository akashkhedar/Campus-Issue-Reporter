import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Status variants
        reported: "border-transparent bg-status-reported/15 text-status-reported",
        assigned: "border-transparent bg-status-assigned/15 text-status-assigned",
        "in-progress": "border-transparent bg-status-in-progress/15 text-status-in-progress",
        resolved: "border-transparent bg-status-resolved/15 text-status-resolved",
        // Category variants
        infrastructure: "border-transparent bg-category-infrastructure/15 text-category-infrastructure",
        safety: "border-transparent bg-category-safety/15 text-category-safety",
        cleanliness: "border-transparent bg-category-cleanliness/15 text-category-cleanliness",
        academics: "border-transparent bg-category-academics/15 text-category-academics",
        hostel: "border-transparent bg-category-hostel/15 text-category-hostel",
        other: "border-transparent bg-category-other/15 text-category-other",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
