import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import {
  Shield,
  LogOut,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Filter,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import { auth } from "@/lib/firebase";
import {
  listenToIssues,
  testFirestoreConnection,
  updateIssueStatus,
  assignResolver,
} from "@/lib/issues";
import { addResolutionProof } from "@/lib/issues";
import { MediaUploader } from "@/components/MediaUploader";
import type { Issue } from "@/types/issue";
import type { IssueStatus, IssueCategory } from "@/types/issue";
import { useToast } from "@/hooks/use-toast";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<IssueStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | "all">(
    "all"
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<IssueStatus | "">("");
  const [resolverName, setResolverName] = useState("");
  const [resolverDept, setResolverDept] = useState("");
  const [resolverContact, setResolverContact] = useState("");
  const [adminImages, setAdminImages] = useState<File[]>([]);
  const [adminVideo, setAdminVideo] = useState<File | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (!currentUser) {
        navigate("/admin/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged out",
        description: "You've been logged out successfully.",
      });
      navigate("/admin/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // subscribe to issues
  useState(() => {
    const unsub = listenToIssues((items) => setIssues(items));
    return unsub;
  });

  const filteredIssues = issues.filter((issue) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      issue.title.toLowerCase().includes(q) ||
      issue.description.toLowerCase().includes(q) ||
      (issue.id || "").toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === "all" || issue.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || issue.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: issues.length,
    reported: issues.filter((i) => i.status === "Reported").length,
    inProgress: issues.filter(
      (i) => i.status === "In Progress" || i.status === "Assigned"
    ).length,
    resolved: issues.filter((i) => i.status === "Resolved").length,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-hero">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.total}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Issues</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-reported/10">
                  <Clock className="h-6 w-6 text-status-reported" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.reported}
                  </p>
                  <p className="text-sm text-muted-foreground">Reported</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-in-progress/10">
                  <Users className="h-6 w-6 text-status-in-progress" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.inProgress}
                  </p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-resolved/10">
                  <CheckCircle2 className="h-6 w-6 text-status-resolved" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.resolved}
                  </p>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Issues Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Manage Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search issues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(v) =>
                    setStatusFilter(v as IssueStatus | "all")
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Reported">Reported</SelectItem>
                    <SelectItem value="Assigned">Assigned</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={categoryFilter}
                  onValueChange={(v) =>
                    setCategoryFilter(v as IssueCategory | "all")
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Infrastructure">
                      Infrastructure
                    </SelectItem>
                    <SelectItem value="Safety">Safety</SelectItem>
                    <SelectItem value="Cleanliness">Cleanliness</SelectItem>
                    <SelectItem value="Academics">Academics</SelectItem>
                    <SelectItem value="Hostel">Hostel</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="rounded-lg border border-border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[80px]">ID</TableHead>
                      <TableHead className="min-w-[250px]">Title</TableHead>
                      <TableHead className="min-w-[120px]">Category</TableHead>
                      <TableHead className="min-w-[120px]">Status</TableHead>
                      <TableHead className="min-w-[120px]">Date</TableHead>
                      <TableHead className="min-w-[100px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIssues.map((issue) => (
                      <React.Fragment key={issue.id}>
                        <TableRow>
                          <TableCell className="font-mono text-xs">
                            #{issue.id.slice(0, 8).toUpperCase()}
                          </TableCell>
                          <TableCell>
                            <p className="font-medium line-clamp-1">
                              {issue.title}
                            </p>
                          </TableCell>
                          <TableCell>
                            <CategoryBadge
                              category={issue.category}
                              showIcon={false}
                            />
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              status={issue.status}
                              showIcon={false}
                            />
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/issue/${issue.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (editingId === issue.id) {
                                    setEditingId(null);
                                  } else {
                                    setEditingId(issue.id);
                                    setEditStatus(issue.status);
                                    setResolverName(issue.resolver?.name ?? "");
                                    setResolverDept(
                                      issue.resolver?.department ?? ""
                                    );
                                    setResolverContact(
                                      issue.resolver?.contact ?? ""
                                    );
                                  }
                                }}
                              >
                                Manage
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {editingId === issue.id && (
                          <TableRow>
                            <TableCell colSpan={6}>
                              <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
                                <div className="flex flex-wrap gap-3">
                                  <Select
                                    value={editStatus}
                                    onValueChange={(v) =>
                                      setEditStatus(v as IssueStatus)
                                    }
                                  >
                                    <SelectTrigger className="w-[160px]">
                                      <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="In Progress">
                                        In Progress
                                      </SelectItem>
                                      <SelectItem value="Resolved">
                                        Resolved
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>

                                  <Input
                                    placeholder="Resolver name"
                                    value={resolverName}
                                    onChange={(e) =>
                                      setResolverName(e.target.value)
                                    }
                                  />
                                  <Input
                                    placeholder="Department"
                                    value={resolverDept}
                                    onChange={(e) =>
                                      setResolverDept(e.target.value)
                                    }
                                  />
                                  <Input
                                    placeholder="Contact"
                                    value={resolverContact}
                                    onChange={(e) =>
                                      setResolverContact(e.target.value)
                                    }
                                  />
                                  {editStatus === "Resolved" && (
                                    <div className="w-full">
                                      <p className="mb-2 text-sm text-muted-foreground">
                                        Upload resolution photos / video
                                        (required)
                                      </p>
                                      <MediaUploader
                                        images={adminImages}
                                        video={adminVideo}
                                        onImagesChange={setAdminImages}
                                        onVideoChange={setAdminVideo}
                                        maxImages={5}
                                      />
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="hero"
                                    onClick={async () => {
                                      try {
                                        // If marking resolved, require at least one media
                                        if (
                                          editStatus === "Resolved" &&
                                          adminImages.length === 0 &&
                                          !adminVideo
                                        ) {
                                          toast({
                                            title: "Missing media",
                                            description:
                                              "You must upload a photo or video when marking as Resolved.",
                                            variant: "destructive",
                                          });
                                          return;
                                        }

                                        if (editStatus)
                                          await updateIssueStatus(
                                            issue.id,
                                            editStatus
                                          );

                                        if (
                                          resolverName ||
                                          resolverDept ||
                                          resolverContact
                                        ) {
                                          await assignResolver(issue.id, {
                                            name: resolverName,
                                            department: resolverDept,
                                            contact: resolverContact,
                                          });
                                        }

                                        if (editStatus === "Resolved") {
                                          await addResolutionProof(
                                            issue.id,
                                            adminImages,
                                            adminVideo
                                          );
                                        }

                                        toast({
                                          title: "Saved",
                                          description: "Issue updated.",
                                        });
                                        setEditingId(null);
                                        setAdminImages([]);
                                        setAdminVideo(null);
                                      } catch (err) {
                                        console.error(err);
                                        toast({
                                          title: "Error",
                                          description:
                                            "Failed to update issue.",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    onClick={() => setEditingId(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredIssues.length === 0 && (
                <div className="py-12 text-center">
                  <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    No issues found matching your filters.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
