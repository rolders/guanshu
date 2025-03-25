"use client";

import { useState } from "react";
import { Page } from "@/types/drizzle";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { updatePage } from "@/lib/actions/pages";

interface PublishStatusProps {
  page: Page;
}

export default function PublishStatus({ page }: PublishStatusProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  return (
    <div className="bg-white shadow sm:rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Publish Status</h2>
        <Badge variant={page.isPublished ? "success" : "secondary"}>
          {page.isPublished ? "Published" : "Draft"}
        </Badge>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          {page.isPublished
            ? "Your page is live and visible to anyone with the link."
            : "Your page is currently in draft mode and only visible to you."}
        </p>
        {page.isPublished && (
          <div className="mt-3">
            <div className="flex items-center space-x-2">
              <Input
                readOnly
                value={`${process.env.NEXT_PUBLIC_APP_URL}/p/${page.slug}`}
                className="text-xs bg-gray-50"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${process.env.NEXT_PUBLIC_APP_URL}/p/${page.slug}`
                  );
                  toast({
                    title: "Link copied",
                    description: "The link has been copied to your clipboard",
                  });
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  window.open(`/p/${page.slug}`, "_blank");
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4">
        <Button
          variant={page.isPublished ? "secondary" : "default"}
          onClick={async () => {
            setIsSubmitting(true);
            const result = await updatePage(page.id, {
              isPublished: !page.isPublished,
            });
            setIsSubmitting(false);
            
            if (result.success) {
              toast({
                title: page.isPublished ? "Page unpublished" : "Page published",
                description: page.isPublished
                  ? "Your page is now hidden from the public"
                  : "Your page is now visible to the public",
              });
              router.refresh();
            } else {
              toast({
                variant: "destructive",
                title: "Error",
                description: result.error || "Something went wrong",
              });
            }
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : page.isPublished ? (
            "Unpublish"
          ) : (
            "Publish"
          )}
        </Button>
      </div>
    </div>
  );
} 