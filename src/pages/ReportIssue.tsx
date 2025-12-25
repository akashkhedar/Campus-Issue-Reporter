import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { Send, MapPin, ArrowLeft, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/Header";
import { MediaUploader } from "@/components/MediaUploader";
import { MapPicker } from "@/components/MapPicker";
import type { IssueCategory, Location } from "@/types/issue";
import { useToast } from "@/hooks/use-toast";
import { addIssue } from "@/lib/issues";

const categories: IssueCategory[] = [
  "Infrastructure",
  "Safety",
  "Cleanliness",
  "Academics",
  "Hostel",
  "Other",
];

const formSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be less than 2000 characters"),
  category: z.string().min(1, "Please select a category"),
});

const ReportIssuePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IssueCategory | "">("");
  const [location, setLocation] = useState<Location | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const requestLiveLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser does not support location services.",
        variant: "destructive",
      });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;

        let address: string | undefined;

        // Try reverse geocoding (non-blocking)
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const g = (window as any)?.google;
          if (g?.maps?.Geocoder) {
            const geocoder = new g.maps.Geocoder();
            const results = await new Promise<
              { formatted_address?: string }[] | null
            >((resolve) => {
              geocoder.geocode({ location: { lat, lng } }, (res, status) => {
                if (status === "OK" && res?.length) resolve(res);
                else resolve(null);
              });
            });

            address = results?.[0]?.formatted_address;
          }
        } catch {
          // ignore reverse geocoding failures
        }

        setLocation({ lat, lng, address });

        // Accuracy warning (not a failure)
        if (accuracy > 1000) {
          toast({
            title: "Low GPS accuracy",
            description:
              "Location detected, but accuracy is low. You may adjust the pin manually.",
          });
        }

        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);

        let message = "Unable to access location.";
        if (error.code === 1) message = "Location permission denied.";
        if (error.code === 2) message = "Location unavailable.";
        if (error.code === 3)
          message = "Location request timed out. Try again.";

        toast({
          title: "Location error",
          description: message,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

  const validateForm = () => {
    try {
      formSchema.parse({ title, description, category });

      if (!location || !location.lat || !location.lng) {
        setErrors({ location: "Please pin a location on the map" });
        return false;
      }

      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const issueId = await addIssue({
        title,
        description,
        category,
        location: location as Location,
        mediaFiles: images,
        videoFile: video,
      });

      setIsSubmitted(true);
      toast({
        title: "Issue Reported Successfully!",
        description: `Your issue ID: ${String(issueId)
          .slice(0, 8)
          .toUpperCase()}`,
      });
    } catch {
      toast({
        title: "Submission Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-status-resolved/20">
              <CheckCircle className="h-10 w-10 text-status-resolved" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-foreground">
              Issue Reported!
            </h1>
            <p className="mb-8 text-muted-foreground">
              Your issue has been submitted anonymously. You can track its
              progress on the public feed using the issue ID.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button variant="hero" onClick={() => navigate("/")}>
                View All Issues
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubmitted(false);
                  setTitle("");
                  setDescription("");
                  setCategory("");
                  setLocation(null);
                  setImages([]);
                  setVideo(null);
                }}
              >
                Report Another
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl"
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
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              Report an Issue
            </h1>
            <p className="mt-2 text-muted-foreground">
              Submit your report anonymously. No personal information required.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-secondary/50 p-3 text-sm text-secondary-foreground">
              <Shield className="h-5 w-5 flex-shrink-0" />
              <span>
                Your privacy is protected. We don't collect any personal
                identifiers.
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title *</Label>
              <Input
                id="title"
                placeholder="Brief summary of the issue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as IssueCategory)}
              >
                <SelectTrigger
                  className={errors.category ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail. Include relevant information like when it started, how severe it is, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className={errors.description ? "border-destructive" : ""}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                {errors.description ? (
                  <p className="text-destructive">{errors.description}</p>
                ) : (
                  <span>Minimum 20 characters</span>
                )}
                <span>{description.length}/2000</span>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {location ? "Update my location" : "Use my current location"}
              </Label>
              <MapPicker
                location={location}
                onLocationChange={setLocation}
                className="h-[300px]"
              />
              {location?.address && (
                <p className="text-sm text-muted-foreground">
                  {location.address}
                </p>
              )}
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location}</p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={requestLiveLocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <>
                  <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Locating...
                </>
              ) : (
                "Use my current location"
              )}
            </Button>

            {/* Media Upload */}
            <div className="space-y-2">
              <Label>Photos & Videos (Optional)</Label>
              <MediaUploader
                images={images}
                video={video}
                onImagesChange={setImages}
                onVideoChange={setVideo}
              />
            </div>

            {/* Submit */}
            <div className="flex flex-col gap-4 pt-4 sm:flex-row">
              <Button
                type="submit"
                variant="hero"
                size="lg"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Anonymously
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default ReportIssuePage;
