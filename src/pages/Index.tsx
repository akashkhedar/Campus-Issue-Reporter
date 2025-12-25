import { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, AlertTriangle, Megaphone, Shield, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { IssueCard } from "@/components/IssueCard";
import { FilterBar } from "@/components/FilterBar";
import { getFilteredIssues } from "@/data/demoIssues";
import { listenToIssues } from "@/lib/issues";
import type { Issue } from "@/types/issue";
import type { IssueStatus, IssueCategory } from "@/types/issue";

const Index = () => {
  const [statusFilter, setStatusFilter] = useState<IssueStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | "all">(
    "all"
  );
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");

  const [issues, setIssues] = useState<Issue[]>([]);

  const issuesRef = useRef<HTMLDivElement | null>(null);

  // Listen to issues (Firestore or demo fallback)
  useState(() => {
    const unsub = listenToIssues((items) => setIssues(items));
    return unsub;
  });

  const filteredIssues = useMemo(() => {
    let list = [...issues];

    if (statusFilter !== "all")
      list = list.filter((i) => i.status === statusFilter);
    if (categoryFilter !== "all")
      list = list.filter((i) => i.category === categoryFilter);

    const toMillis = (val: unknown) => {
      if (!val) return 0;
      const v = val as { toDate?: () => Date };
      if (v && typeof v.toDate === "function") return v.toDate().getTime();
      const n = Date.parse(String(val));
      return Number.isNaN(n) ? 0 : n;
    };

    list.sort((a, b) => {
      const dateA = toMillis(a.createdAt as unknown);
      const dateB = toMillis(b.createdAt as unknown);
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [issues, statusFilter, categoryFilter, sortOrder]);

  const stats = useMemo(() => {
    return {
      total: issues.length,
      reported: issues.filter((i) => i.status === "Reported").length,
      inProgress: issues.filter(
        (i) => i.status === "In Progress" || i.status === "Assigned"
      ).length,
      resolved: issues.filter((i) => i.status === "Resolved").length,
    };
  }, [issues]);

  const clearFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero py-16 lg:py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm font-medium text-primary-foreground">
              <Shield className="h-4 w-4" />
              100% Anonymous • Transparent • Accountable
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
              Campus Issues,{" "}
              <span className="relative">
                Openly Tracked
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                >
                  <path
                    d="M2 10C50 2 150 2 198 10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-accent"
                  />
                </svg>
              </span>
            </h1>

            <p className="mb-8 text-lg text-primary-foreground/80 sm:text-xl">
              Report campus issues anonymously. Track their resolution publicly.
              Hold your institution accountable with complete transparency.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/report">
                <Button variant="accent" size="xl">
                  <Megaphone className="mr-2 h-5 w-5" />
                  Report an Issue
                </Button>
              </Link>
              <Button
                variant="outline"
                size="xl"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                onClick={() =>
                  issuesRef.current?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <Eye className="mr-2 h-5 w-5" />
                View All Issues
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {[
              {
                label: "Total Issues",
                value: stats.total,
                icon: AlertTriangle,
              },
              {
                label: "Reported",
                value: stats.reported,
                color: "text-status-reported",
              },
              {
                label: "In Progress",
                value: stats.inProgress,
                color: "text-status-in-progress",
              },
              {
                label: "Resolved",
                value: stats.resolved,
                color: "text-status-resolved",
              },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="rounded-xl bg-primary-foreground/10 p-4 text-center backdrop-blur-sm"
              >
                <p
                  className={`text-3xl font-bold ${
                    stat.color || "text-primary-foreground"
                  }`}
                >
                  {stat.value}
                </p>
                <p className="text-sm text-primary-foreground/70">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Issues Section */}
      <section ref={issuesRef} className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                  Public Issue Feed
                </h2>
                <p className="mt-1 text-muted-foreground">
                  {filteredIssues.length} issue
                  {filteredIssues.length !== 1 ? "s" : ""} found
                </p>
              </div>
              <Link to="/report" className="hidden sm:block">
                <Button variant="hero">
                  <Plus className="mr-2 h-4 w-4" />
                  Report Issue
                </Button>
              </Link>
            </div>

            <FilterBar
              statusFilter={statusFilter}
              categoryFilter={categoryFilter}
              sortOrder={sortOrder}
              onStatusChange={setStatusFilter}
              onCategoryChange={setCategoryFilter}
              onSortChange={setSortOrder}
              onClearFilters={clearFilters}
            />

            <div className="mt-8 space-y-4">
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue, index) => (
                  <IssueCard key={issue.id} issue={issue} index={index} />
                ))
              ) : (
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                  <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    No issues found
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Try adjusting your filters or report a new issue.
                  </p>
                  <Link to="/report" className="mt-4 inline-block">
                    <Button variant="hero">Report an Issue</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            CampusVoice — Anonymous Issue Reporter
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Built for transparency and accountability. No personal data
            collected.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
