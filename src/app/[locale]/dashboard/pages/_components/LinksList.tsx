"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/types/drizzle";
import {
  createLink,
  updateLink,
  deleteLink,
  reorderLinks,
} from "@/lib/actions/links";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, ArrowUp, ArrowDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define platform options
const platformOptions = [
  { value: "website", label: "Website", icon: "🌐" },
  { value: "linkedin", label: "LinkedIn", icon: "🔗" },
  { value: "twitter", label: "Twitter/X", icon: "🐦" },
  { value: "facebook", label: "Facebook", icon: "👤" },
  { value: "instagram", label: "Instagram", icon: "📷" },
  { value: "youtube", label: "YouTube", icon: "▶️" },
  { value: "tiktok", label: "TikTok", icon: "🎵" },
  { value: "github", label: "GitHub", icon: "💻" },
  { value: "wechat", label: "WeChat", icon: "💬" },
  { value: "weibo", label: "Weibo", icon: "🔴" },
  { value: "zhihu", label: "Zhihu", icon: "❓" },
  { value: "xiaohongshu", label: "Xiaohongshu", icon: "📕" },
  { value: "douyin", label: "Douyin", icon: "🎬" },
  { value: "bilibili", label: "Bilibili", icon: "📺" },
  { value: "other", label: "Other", icon: "🔗" }
];

interface LinksListProps {
  locale: string;
  pageId: string;
  links: Link[];
}

export default function LinksList({ locale, pageId, links: initialLinks }: LinksListProps) {
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state for new/edited link
  const [formData, setFormData] = useState({
    platform: "website",
    title: "",
    url: "",
    iconType: "default",
    isVisible: true
  });

  // Reset form data
  const resetForm = () => {
    setFormData({
      platform: "website",
      title: "",
      url: "",
      iconType: "default",
      isVisible: true
    });
    setIsAdding(false);
    setIsEditing(null);
  };

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle platform selection
  const handlePlatformChange = (value: string) => {
    setFormData({
      ...formData,
      platform: value,
      title: platformOptions.find(option => option.value === value)?.label || value,
    });
  };

  // Add new link
  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await createLink(pageId, {
        platform: formData.platform,
        title: formData.title,
        url: formData.url,
        iconType: formData.iconType,
        isVisible: formData.isVisible
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to create link");
      }

      if (result.link) {
        // Ensure the link object has all required properties
        const newLink: Link = {
          id: result.link.id,
          pageId: result.link.pageId,
          platform: result.link.platform,
          title: result.link.title,
          url: result.link.url,
          iconType: result.link.iconType || "default",  // Ensure it's not null
          customIcon: result.link.customIcon,
          position: result.link.position,
          isVisible: result.link.isVisible ?? true,  // Ensure it's not null
          createdAt: result.link.createdAt,
          updatedAt: result.link.updatedAt
        };
        
        setLinks([...links, newLink]);
        setSuccess("Link added successfully!");
        resetForm();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start editing a link
  const handleEditStart = (link: Link) => {
    setFormData({
      platform: link.platform,
      title: link.title,
      url: link.url,
      iconType: link.iconType,
      isVisible: link.isVisible
    });
    setIsEditing(link.id);
    setIsAdding(false);
  };

  // Save edited link
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await updateLink(isEditing, formData);

      if (!result.success) {
        throw new Error(result.error || "Failed to update link");
      }

      if (result.link) {
        // Ensure the link object has all required properties
        const updatedLink: Link = {
          id: result.link.id,
          pageId: result.link.pageId,
          platform: result.link.platform,
          title: result.link.title,
          url: result.link.url,
          iconType: result.link.iconType || "default",  // Ensure it's not null
          customIcon: result.link.customIcon,
          position: result.link.position,
          isVisible: result.link.isVisible ?? true,  // Ensure it's not null
          createdAt: result.link.createdAt,
          updatedAt: result.link.updatedAt
        };
        
        setLinks(links.map(link => link.id === isEditing ? updatedLink : link));
        setSuccess("Link updated successfully!");
        resetForm();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a link
  const handleDeleteLink = async (linkId: string) => {
    if (!window.confirm("Are you sure you want to delete this link?")) {
      return;
    }
    
    try {
      const result = await deleteLink(linkId);

      if (!result.success) {
        throw new Error(result.error || "Failed to delete link");
      }

      setLinks(links.filter(link => link.id !== linkId));
      setSuccess("Link deleted successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  // Move link up in order
  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    
    try {
      // Get current link and the one above it
      const linkToMove = links[index];
      const linkAbove = links[index - 1];
      
      // Swap positions
      const newLinks = [...links];
      newLinks[index] = linkAbove;
      newLinks[index - 1] = linkToMove;
      
      // Update state
      setLinks(newLinks);
      
      // Call API to persist changes
      const result = await reorderLinks(pageId, newLinks.map(link => link.id));
      
      if (!result.success) {
        throw new Error(result.error || "Failed to reorder links");
      }
    } catch (err) {
      // Revert on error
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setLinks(initialLinks);
    }
  };

  // Move link down in order
  const handleMoveDown = async (index: number) => {
    if (index >= links.length - 1) return;
    
    try {
      // Get current link and the one below it
      const linkToMove = links[index];
      const linkBelow = links[index + 1];
      
      // Swap positions
      const newLinks = [...links];
      newLinks[index] = linkBelow;
      newLinks[index + 1] = linkToMove;
      
      // Update state
      setLinks(newLinks);
      
      // Call API to persist changes
      const result = await reorderLinks(pageId, newLinks.map(link => link.id));
      
      if (!result.success) {
        throw new Error(result.error || "Failed to reorder links");
      }
    } catch (err) {
      // Revert on error
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setLinks(initialLinks);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Social Media Links</h2>
        {!isAdding && !isEditing && (
          <Button
            onClick={() => {
              setIsAdding(true);
              setIsEditing(null);
              setFormData({
                platform: "website",
                title: "Website",
                url: "",
                iconType: "default",
                isVisible: true
              });
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Add New Link
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 text-sm text-green-800 rounded-lg bg-green-50" role="alert">
          {success}
        </div>
      )}

      {(isAdding || isEditing) && (
        <form onSubmit={isEditing ? handleEditSave : handleAddLink} className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-medium">{isEditing ? "Edit Link" : "Add New Link"}</h3>
          
          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
              Platform
            </label>
            <Select
              value={formData.platform}
              onValueChange={(value: string) => handlePlatformChange(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a platform" />
              </SelectTrigger>
              <SelectContent>
                {platformOptions.map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    {platform.icon} {platform.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full"
              required
            />
          </div>
          
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              URL
            </label>
            <Input
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://"
              className="w-full"
              required
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Add Link"}
            </Button>
            <Button
              type="button"
              onClick={resetForm}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {links.length > 0 ? (
        <div className="space-y-2">
          {links.map((link, index) => {
            const platform = platformOptions.find(p => p.value === link.platform) || { icon: "🔗", label: "Link" };
            
            return (
              <div 
                key={link.id} 
                className="p-4 border rounded-lg flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3 flex-grow">
                  <span className="text-xl">{platform.icon}</span>
                  <div>
                    <p className="font-medium">{link.title}</p>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-600 hover:underline truncate block max-w-xs"
                    >
                      {link.url}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="h-8 w-8 p-0"
                  >
                    <span className="sr-only">Move up</span>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === links.length - 1}
                    className="h-8 w-8 p-0"
                  >
                    <span className="sr-only">Move down</span>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditStart(link)}
                    className="h-8 w-8 p-0 text-blue-600"
                  >
                    <span className="sr-only">Edit</span>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLink(link.id)}
                    className="h-8 w-8 p-0 text-red-600"
                  >
                    <span className="sr-only">Delete</span>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed">
          <p className="text-gray-500">No links added yet. Add your first social media link.</p>
        </div>
      )}
    </div>
  );
} 