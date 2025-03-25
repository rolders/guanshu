"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Page } from "@/types/drizzle";
import { createPage, updatePage } from "@/lib/actions/pages";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import ImageUpload from "./ImageUpload";
import { BackgroundImageSettings } from "./BackgroundImageSettings";

interface PageFormProps {
  locale: string;
  page?: Page;
  isEditing?: boolean;
}

export default function PageForm({ locale, page, isEditing = false }: PageFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(page?.mainIcon || null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(page?.backgroundImage || null);
  const [backgroundImageFit, setBackgroundImageFit] = useState<"cover" | "contain" | "repeat">(
    page?.backgroundImageFit || "cover"
  );
  const [backgroundImageVisible, setBackgroundImageVisible] = useState<boolean>(
    page?.backgroundImageVisible ?? true
  );
  const [formData, setFormData] = useState({
    title: page?.title || "",
    slug: page?.slug || "",
    description: page?.description || "",
    hasContactForm: page?.hasContactForm || false,
    isPublished: page?.isPublished || false,
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: isEditing ? formData.slug : generateSlug(title),
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Include the logo image and background image in the form data
      const pageData = {
        ...formData,
        mainIcon: logoImage,
        backgroundImage: backgroundImage,
        backgroundImageFit: backgroundImageFit,
        backgroundImageVisible: backgroundImageVisible
      };

      if (isEditing && page) {
        // Update existing page
        const result = await updatePage(page.id, pageData);

        if (!result.success) {
          throw new Error(result.error || "Failed to update page");
        }

        router.push(`/${locale}/dashboard/pages/${page.id}`);
        router.refresh();
      } else {
        // Create new page
        const result = await createPage(pageData);

        if (!result.success) {
          throw new Error(result.error || "Failed to create page");
        }

        router.push(`/${locale}/dashboard/pages/${result.page!.id}`);
        router.refresh();
      }
    } catch (err) {
      console.error("Error submitting page:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <ImageUpload 
          currentImage={logoImage} 
          onImageChange={setLogoImage}
          aspectRatio="1:1"
          maxSize={2}
          className="w-32 h-32"
        />

        <BackgroundImageSettings
          backgroundImage={backgroundImage}
          backgroundImageFit={backgroundImageFit}
          backgroundImageVisible={backgroundImageVisible}
          onBackgroundImageChange={setBackgroundImage}
          onBackgroundImageFitChange={setBackgroundImageFit}
          onBackgroundImageVisibleChange={setBackgroundImageVisible}
        />

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Page Title *
          </label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleTitleChange}
            className="w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
            Slug *
          </label>
          <div className="flex items-center">
            <span className="text-gray-500 mr-2">/p/</span>
            <Input
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="w-full"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            This will be the URL of your page. Only use lowercase letters, numbers, and hyphens.
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full"
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasContactForm"
            checked={formData.hasContactForm}
            onCheckedChange={(checked) =>
              handleCheckboxChange("hasContactForm", checked as boolean)
            }
          />
          <label
            htmlFor="hasContactForm"
            className="text-sm font-medium text-gray-700"
          >
            Enable contact form
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isPublished"
            checked={formData.isPublished}
            onCheckedChange={(checked) =>
              handleCheckboxChange("isPublished", checked as boolean)
            }
          />
          <label
            htmlFor="isPublished"
            className="text-sm font-medium text-gray-700"
          >
            Publish page
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Page"}
        </Button>
      </div>
    </form>
  );
} 