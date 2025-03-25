"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  currentImage: string | null;
  onImageChange: (image: string | null) => void;
  maxSize?: number; // in MB
  aspectRatio?: string;
  className?: string;
}

export default function ImageUpload({
  currentImage,
  onImageChange,
  maxSize = 2,
  aspectRatio = "1:1",
  className,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File type and size validation
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      alert(`Image must be smaller than ${maxSize}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreview(dataUrl);
      onImageChange(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange(null);
  };

  return (
    <div className={cn("relative", className)}>
      {preview ? (
        <>
          <div className="relative w-full h-full">
            <Image
              src={preview}
              alt="Image preview"
              fill
              className="object-cover rounded-lg border border-border"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm hover:bg-destructive/90 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-muted rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Click to upload
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {aspectRatio} • Max {maxSize}MB
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
} 