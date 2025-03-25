"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  currentImage: string | null;
  onChange: (value: string | null) => void;
}

export default function ImageUpload({ currentImage, onChange }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File type and size validation
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreview(dataUrl);
      onChange(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Page Logo/Avatar
      </label>
      
      <div className="flex items-center gap-4">
        {preview ? (
          <div className="relative w-20 h-20">
            <Image
              src={preview}
              alt="Page logo"
              fill
              className="rounded-full object-cover border border-gray-200"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-full">
            <label className="cursor-pointer text-center p-2">
              <Upload size={24} className="mx-auto text-gray-400" />
              <span className="mt-1 text-xs text-gray-500">Upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          <p>Upload a logo or avatar for your page</p>
          <p>Recommended: Square image (1:1 ratio)</p>
          <p>Maximum size: 2MB</p>
        </div>
      </div>
    </div>
  );
} 