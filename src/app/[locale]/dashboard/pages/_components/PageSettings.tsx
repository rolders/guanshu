"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Page } from "@/types/drizzle";
import { updatePage, deletePage } from "@/lib/actions/pages";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PageSettingsProps {
  locale: string;
  page: Page;
}

export default function PageSettings({ locale, page }: PageSettingsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [theme, setTheme] = useState(page.theme);

  const themes = [
    { value: "default", label: "Default" },
    { value: "minimal", label: "Minimal" },
    { value: "dark", label: "Dark" },
    { value: "colorful", label: "Colorful" },
    { value: "professional", label: "Professional" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Update theme
      const result = await updatePage(page.id, { theme });

      if (!result.success) {
        throw new Error(result.error || "Failed to update theme");
      }

      setSuccess("Theme updated successfully!");
      router.refresh();
    } catch (err) {
      console.error("Error updating theme:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePage = async () => {
    if (!window.confirm("Are you sure you want to delete this page? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deletePage(page.id);

      if (!result.success) {
        throw new Error(result.error || "Failed to delete page");
      }

      router.push(`/${locale}/dashboard/pages`);
      router.refresh();
    } catch (err) {
      console.error("Error deleting page:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Theme Settings</h2>
        {error && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50" role="alert">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
              Page Theme
            </label>
            <Select
              value={theme}
              onValueChange={(value: string) => setTheme(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                {themes.map((themeOption) => (
                  <SelectItem key={themeOption.value} value={themeOption.value}>
                    {themeOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <h3 className="font-medium mb-2">Delete this page</h3>
          <p className="text-sm text-gray-600 mb-4">
            Once you delete a page, there is no going back. Please be certain.
          </p>
          <Button
            type="button"
            className="bg-red-600 hover:bg-red-700"
            onClick={handleDeletePage}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Page"}
          </Button>
        </div>
      </div>
    </div>
  );
} 