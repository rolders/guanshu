"use client";

import { useState } from "react";
import ImageUpload from "./ImageUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface BackgroundImageSettingsProps {
  backgroundImage: string | null;
  backgroundImageFit: "cover" | "contain" | "repeat";
  backgroundImageVisible: boolean;
  onBackgroundImageChange: (image: string | null) => void;
  onBackgroundImageFitChange: (fit: "cover" | "contain" | "repeat") => void;
  onBackgroundImageVisibleChange: (visible: boolean) => void;
}

export function BackgroundImageSettings({
  backgroundImage,
  backgroundImageFit,
  backgroundImageVisible,
  onBackgroundImageChange,
  onBackgroundImageFitChange,
  onBackgroundImageVisibleChange,
}: BackgroundImageSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Background Image
        </label>
        <ImageUpload
          currentImage={backgroundImage}
          onImageChange={onBackgroundImageChange}
          aspectRatio="16:9"
          maxSize={5}
          className="w-full h-48"
        />
      </div>

      {backgroundImage && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background Image Fit
            </label>
            <Select
              value={backgroundImageFit}
              onValueChange={(value: "cover" | "contain" | "repeat") =>
                onBackgroundImageFitChange(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cover">Cover</SelectItem>
                <SelectItem value="contain">Contain</SelectItem>
                <SelectItem value="repeat">Repeat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="backgroundImageVisible"
              checked={backgroundImageVisible}
              onCheckedChange={onBackgroundImageVisibleChange}
            />
            <label
              htmlFor="backgroundImageVisible"
              className="text-sm font-medium text-gray-700"
            >
              Show background image
            </label>
          </div>
        </>
      )}
    </div>
  );
} 