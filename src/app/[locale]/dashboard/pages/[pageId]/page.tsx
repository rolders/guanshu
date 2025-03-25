import { getPageSession } from "@/lib/auth/lucia";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getPageById } from "@/lib/actions/pages";
import { getPageLinks } from "@/lib/actions/links";
import PageForm from "../_components/PageForm";
import LinksList from "../_components/LinksList";
import PageSettings from "../_components/PageSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Page } from "@/types/drizzle";
import PublishStatus from "../_components/PublishStatus";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ locale: string; pageId: string }>;
}) {
  const { locale, pageId } = await params;
  const session = await getPageSession();

  // Redirect if not logged in
  if (!session?.user) {
    redirect(`/${locale}`);
  }

  // Fetch page data
  const pageResult = await getPageById(pageId);
  
  if (!pageResult.success || !pageResult.page) {
    // Page not found or doesn't belong to this user
    redirect(`/${locale}/dashboard/pages`);
  }

  // Ensure proper type conversion and required fields exist
  const pageData = pageResult.page;
  
  // Create a properly typed Page object with explicit type assertions
  const page: Page = {
    id: pageData.id,
    createdAt: pageData.createdAt,
    updatedAt: pageData.updatedAt,
    userId: pageData.userId,
    title: pageData.title,
    slug: pageData.slug,
    description: pageData.description,
    backgroundImage: pageData.backgroundImage,
    mainIcon: pageData.mainIcon,
    theme: pageData.theme || 'default',
    customColors: pageData.customColors as Record<string, string> | null,
    hasContactForm: pageData.hasContactForm ?? false,
    contactFormTitle: pageData.contactFormTitle,
    contactFormCta: pageData.contactFormCta,
    isPublished: pageData.isPublished ?? false
  };
  
  // Fetch links for this page
  const linksResult = await getPageLinks(pageId);
  const links = linksResult.success && linksResult.links ? linksResult.links : [];

  const backToPages = `/${locale}/dashboard/pages`;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link
          href={backToPages}
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          ← Back to Pages
        </Link>
        <h1 className="text-2xl font-bold mt-2">{page.title}</h1>
        <p className="text-sm text-gray-500">
          {page.isPublished ? (
            <span className="text-green-600">
              Published at{" "}
              <Link
                href={`/p/${page.slug}`}
                className="underline"
                target="_blank"
              >
                /p/{page.slug}
              </Link>
            </span>
          ) : (
            <span className="text-yellow-600">Draft (not published)</span>
          )}
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <PageForm locale={locale} page={page} isEditing={true} />
          </div>
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <LinksList locale={locale} pageId={pageId} links={links} />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <PageSettings locale={locale} page={page} />
          </div>
        </TabsContent>
      </Tabs>

      <PublishStatus page={page} />
    </div>
  );
} 