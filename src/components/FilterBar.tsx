import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IssueStatus, IssueCategory } from "@/types/issue";
import { Filter, SortAsc, SortDesc, X } from "lucide-react";

interface FilterBarProps {
  statusFilter: IssueStatus | "all";
  categoryFilter: IssueCategory | "all";
  sortOrder: "latest" | "oldest";
  onStatusChange: (status: IssueStatus | "all") => void;
  onCategoryChange: (category: IssueCategory | "all") => void;
  onSortChange: (sort: "latest" | "oldest") => void;
  onClearFilters: () => void;
}

const statuses: (IssueStatus | "all")[] = [
  "all",
  "Reported",
  "Assigned",
  "In Progress",
  "Resolved",
];
const categories: (IssueCategory | "all")[] = [
  "all",
  "Infrastructure",
  "Safety",
  "Cleanliness",
  "Academics",
  "Hostel",
  "Other",
];

export const FilterBar = ({
  statusFilter,
  categoryFilter,
  sortOrder,
  onStatusChange,
  onCategoryChange,
  onSortChange,
  onClearFilters,
}: FilterBarProps) => {
  const hasFilters = statusFilter !== "all" || categoryFilter !== "all";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground flex-shrink-0">
        <Filter className="h-4 w-4" />
        Filters
      </div>

      <div className="flex flex-1 items-center gap-3 overflow-x-auto no-scrollbar whitespace-nowrap -mx-2 px-2">
        {/* Use nowrap and prevent children from shrinking so they scroll horizontally on small screens */}
        <Select
          value={statusFilter}
          onValueChange={(v) => onStatusChange(v as IssueStatus | "all")}
        >
          <SelectTrigger className="w-[140px] flex-shrink-0">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status === "all" ? "All Statuses" : status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={categoryFilter}
          onValueChange={(v) => onCategoryChange(v as IssueCategory | "all")}
        >
          <SelectTrigger className="w-[150px] flex-shrink-0">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={sortOrder === "latest" ? "secondary" : "ghost"}
          size="sm"
          onClick={() =>
            onSortChange(sortOrder === "latest" ? "oldest" : "latest")
          }
          className="gap-1 flex-shrink-0"
        >
          {sortOrder === "latest" ? (
            <>
              <SortDesc className="h-4 w-4" />
              Latest
            </>
          ) : (
            <>
              <SortAsc className="h-4 w-4" />
              Oldest
            </>
          )}
        </Button>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-1 text-muted-foreground flex-shrink-0"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};
