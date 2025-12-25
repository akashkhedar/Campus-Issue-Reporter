import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Calendar, ArrowRight, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import type { Issue } from "@/types/issue";
import { toDateSafe } from "@/lib/issues";

interface IssueCardProps {
  issue: Issue;
  index?: number;
}

export const IssueCard = ({ issue, index = 0 }: IssueCardProps) => {
  const issueDate = (() => {
    const created = issue.createdAt as unknown;
    const isTimestamp = (v: unknown): v is { toDate: () => Date } =>
      typeof v === "object" &&
      v !== null &&
      typeof (v as { toDate?: unknown }).toDate === "function";

    const date = isTimestamp(created)
      ? created.toDate()
      : new Date(created as string | number | Date | undefined);
    return date.toLocaleDateString();
  })();

  const thumbnailUrl = issue.media.find((m) => m.type === "image")?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={`/issue/${issue.id}`}>
        <Card className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              {/* Thumbnail */}
              <div className="relative h-40 w-full sm:h-auto sm:w-48 flex-shrink-0 overflow-hidden bg-muted">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={issue.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 flex gap-1.5">
                  <StatusBadge status={issue.status} showIcon={false} />
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <CategoryBadge category={issue.category} />
                    <span className="text-xs font-medium text-muted-foreground">
                      #{issue.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {issue.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {issue.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {issueDate}
                    </span>
                    {issue.location.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="line-clamp-1 max-w-[150px]">
                          {issue.location.address}
                        </span>
                      </span>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};
