"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Upload, X, Play, Pause } from "lucide-react";

interface VideoUploadCardProps {
  className?: string;
  triggerAnimation?: boolean;
  onAnimationComplete?: () => void;
  title?: string;
  description?: string;
  onFileSelect?: (file: File) => void;
  onFileRemove?: () => void;
  accept?: string;
}

const truncateFilename = (filename: string, maxLength: number = 30) => {
  if (filename.length <= maxLength) return filename;
  const extension = filename.split(".").pop();
  const nameWithoutExt = filename.replace(`.${extension}`, "");
  const truncatedName = nameWithoutExt.substring(0, maxLength - 3 - (extension?.length ?? 0));
  return `${truncatedName}...${extension}`;
};

function VideoComponent({
  isAnimating,
  onAnimationComplete,
  filename = "video.mp4",
  onRemove,
  videoUrl,
}: {
  isAnimating: boolean;
  onAnimationComplete?: () => void;
  filename?: string;
  onRemove?: () => void;
  videoUrl?: string;
}) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isAnimating) setShouldShow(true);
  }, [isAnimating]);

  useEffect(() => {
    if (videoUrl) setVideoLoaded(false);
  }, [videoUrl]);

  if (!shouldShow && !isRemoving) return null;

  const displayName = truncateFilename(filename);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRemoving(true);
    setIsPlaying(false);
    setShouldShow(false);
  };

  const handleRemoveComplete = () => {
    setShouldShow(false);
    setIsRemoving(false);
    onRemove?.();
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleVideoLoadedData = () => {
    setVideoLoaded(true);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0.01;
    }
  };

  return (
    <AnimatePresence onExitComplete={isRemoving ? handleRemoveComplete : undefined}>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onAnimationComplete={onAnimationComplete}
          className="absolute inset-0 z-10 flex flex-col"
        >
          {/* X button */}
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 z-30 w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>

          {/* Video Preview */}
          <div className="flex-1 relative overflow-hidden rounded-t-lg">
            {videoUrl ? (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-cover"
                  onLoadedData={handleVideoLoadedData}
                  onEnded={() => setIsPlaying(false)}
                  playsInline
                  muted
                />
                {!videoLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <button
                  onClick={handlePlayClick}
                  className="absolute bottom-2 left-2 z-20 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Play className="w-5 h-5 text-primary" />
                </div>
              </div>
            )}
          </div>

          {/* Filename */}
          <div className="px-3 py-2 bg-background/80 backdrop-blur-sm border-t border-border rounded-b-lg">
            <p className="text-xs font-medium truncate text-foreground">{displayName}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function VideoUploadCard({
  className,
  triggerAnimation = false,
  onAnimationComplete,
  title = "Upload Your Video",
  description = "Drop in your videos and start playing instantly.",
  onFileSelect,
  onFileRemove,
  accept = "video/*",
}: VideoUploadCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (triggerAnimation) setIsAnimating(true);
  }, [triggerAnimation]);

  const processFile = useCallback((file: File) => {
    setUploadedFile(file);
    setIsUploading(true);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    onFileSelect?.(file);
    setTimeout(() => {
      setIsUploading(false);
      setIsAnimating(true);
    }, 200);
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find((f) => f.type.startsWith("video/") || f.type.startsWith("audio/"));
    if (videoFile) processFile(videoFile);
  }, [processFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setIsAnimating(false);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    onFileRemove?.();
  }, [videoUrl, onFileRemove]);

  const handleClick = useCallback(() => {
    if (!isUploading && !uploadedFile) {
      fileInputRef.current?.click();
    }
  }, [isUploading, uploadedFile]);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-col gap-3">
        <div
          className={cn(
            "relative rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden",
            "aspect-video",
            isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
            isUploading && "opacity-70 pointer-events-none",
            uploadedFile && "cursor-default"
          )}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Background upload icon */}
          {!uploadedFile && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium">Arraste ou clique</p>
              <p className="text-xs text-muted-foreground">MP4, MOV, AVI</p>
            </div>
          )}

          {/* Video component overlay */}
          <VideoComponent
            isAnimating={isAnimating}
            onAnimationComplete={onAnimationComplete}
            filename={uploadedFile?.name}
            onRemove={handleRemoveFile}
            videoUrl={videoUrl ?? undefined}
          />

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
