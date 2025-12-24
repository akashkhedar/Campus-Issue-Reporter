import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, User, Building, Mail, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import { StatusTimeline } from "@/components/StatusTimeline";
import { MapPicker } from "@/components/MapPicker";
import { getIssueById } from "@/data/demoIssues";

const IssueDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const issue = id ? getIssueById(id) : undefined;

  if (!issue) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-foreground">Issue Not Found</h1>
            <p className="mb-6 text-muted-foreground">
              The issue you're looking for doesn't exist or has been removed.
            </p>
            <Button variant="hero" onClick={() => navigate("/")}>
              Back to Issues
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(issue.createdAt).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-4xl"
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Issues
          </Button>

          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <StatusBadge status={issue.status} />
              <CategoryBadge category={issue.category} />
              <span className="text-sm font-medium text-muted-foreground">
                #{issue.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              {issue.title}
            </h1>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Reported on {formattedDate}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-8 lg:col-span-2">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-foreground/90">
                    {issue.description}
                  </p>
                </CardContent>
              </Card>

              {/* Media */}
              {issue.media.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Attached Media
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {issue.media.map((media) => (
                        <div
                          key={media.id}
                          className="overflow-hidden rounded-lg border border-border"
                        >
                          {media.type === "image" ? (
                            <img
                              src={media.url}
                              alt="Issue attachment"
                              className="h-48 w-full object-cover"
                            />
                          ) : (
                            <video
                              src={media.url}
                              controls
                              className="h-48 w-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {issue.location.address && (
                    <p className="mb-3 text-sm text-muted-foreground">
                      {issue.location.address}
                    </p>
                  )}
                  <MapPicker
                    location={issue.location}
                    onLocationChange={() => {}}
                    readonly
                    className="h-[250px]"
                  />
                </CardContent>
              </Card>

              {/* Resolution Proof */}
              {issue.resolutionProof && issue.resolutionProof.length > 0 && (
                <Card className="border-status-resolved/30 bg-status-resolved/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-status-resolved">
                      Resolution Proof
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {issue.resolutionProof.map((media) => (
                        <div
                          key={media.id}
                          className="overflow-hidden rounded-lg border border-status-resolved/30"
                        >
                          {media.type === "image" ? (
                            <img
                              src={media.url}
                              alt="Resolution proof"
                              className="h-48 w-full object-cover"
                            />
                          ) : (
                            <video
                              src={media.url}
                              controls
                              className="h-48 w-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Status History</CardTitle>
                </CardHeader>
                <CardContent>
                  <StatusTimeline history={issue.statusHistory} />
                </CardContent>
              </Card>

              {/* Resolver Info */}
              {issue.resolver && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Assigned Resolver
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {issue.resolver.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="h-4 w-4" />
                      {issue.resolver.department}
                    </div>
                    {issue.resolver.contact && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {issue.resolver.contact}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default IssueDetailPage;
