import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, Video, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaUploaderProps {
  images: File[];
  video: File | null;
  onImagesChange: (images: File[]) => void;
  onVideoChange: (video: File | null) => void;
  maxImages?: number;
}

export const MediaUploader = ({
  images,
  video,
  onImagesChange,
  onVideoChange,
  maxImages = 5,
}: MediaUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File, type: "image" | "video"): boolean => {
    const maxSize = type === "image" ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB for images, 50MB for videos
    const allowedTypes = type === "image" 
      ? ["image/jpeg", "image/png", "image/webp", "image/gif"]
      : ["video/mp4", "video/webm", "video/quicktime"];

    if (!allowedTypes.includes(file.type)) {
      setError(`Invalid ${type} format. Allowed: ${allowedTypes.join(", ")}`);
      return false;
    }

    if (file.size > maxSize) {
      setError(`${type === "image" ? "Image" : "Video"} too large. Max: ${maxSize / (1024 * 1024)}MB`);
      return false;
    }

    setError(null);
    return true;
  }, []);

  const handleImageUpload = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const validImages = fileArray.filter((file) => validateFile(file, "image"));
      
      if (images.length + validImages.length > maxImages) {
        setError(`Maximum ${maxImages} images allowed`);
        return;
      }

      onImagesChange([...images, ...validImages]);
    },
    [images, maxImages, onImagesChange, validateFile]
  );

  const handleVideoUpload = useCallback(
    (file: File) => {
      if (validateFile(file, "video")) {
        onVideoChange(file);
      }
    },
    [onVideoChange, validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);

      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter((f) => f.type.startsWith("image/"));
      const videoFiles = files.filter((f) => f.type.startsWith("video/"));

      if (imageFiles.length > 0) handleImageUpload(imageFiles);
      if (videoFiles.length > 0 && !video) handleVideoUpload(videoFiles[0]);
    },
    [handleImageUpload, handleVideoUpload, video]
  );

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
    setError(null);
  };

  const removeVideo = () => {
    onVideoChange(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:border-primary/50"
        }`}
      >
        <Upload className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-2 text-sm font-medium text-foreground">
          Drag & drop files here
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          or click to browse (max {maxImages} images, 1 video)
        </p>

        <div className="mt-4 flex justify-center gap-3">
          <label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
            />
            <Button type="button" variant="secondary" size="sm" asChild>
              <span>
                <ImageIcon className="mr-1.5 h-4 w-4" />
                Add Images
              </span>
            </Button>
          </label>

          <label>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              disabled={!!video}
              onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
            />
            <Button type="button" variant="secondary" size="sm" disabled={!!video} asChild>
              <span>
                <Video className="mr-1.5 h-4 w-4" />
                Add Video
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {images.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Upload ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-1 top-1 rounded-full bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Video Preview */}
      {video && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="group relative overflow-hidden rounded-lg border border-border"
        >
          <video
            src={URL.createObjectURL(video)}
            controls
            className="max-h-60 w-full"
          />
          <button
            type="button"
            onClick={removeVideo}
            className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
};
