import { getPageSession } from "@/lib/auth/lucia";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserPages } from "@/lib/actions/pages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PagesListPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getPageSession();

  // Redirect if not logged in
  if (!session?.user) {
    redirect(`/${locale}`);
  }

  // Fetch all pages for the user
  const pagesResult = await getUserPages();
  const pages = pagesResult.success && pagesResult.pages ? pagesResult.pages : [];

  // Construct URL paths
  const newPagePath = `/${locale}/dashboard/pages/new`;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Pages</h1>
        <Link
          href={newPagePath}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create New Page
        </Link>
      </div>

      {pages.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-700 mb-4">No pages yet</h2>
              <p className="text-gray-500 mb-6">
                You haven't created any aggregator pages yet. Create your first page to get started.
              </p>
              <Link
                href={newPagePath}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Your First Page
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => {
            const publicPagePath = `/p/${page.slug}`;
            const editPagePath = `/${locale}/dashboard/pages/${page.id}`;
            
            return (
              <Card key={page.id} className="overflow-hidden">
                <CardHeader className={`${page.isPublished ? 'bg-green-50 border-b' : 'bg-yellow-50 border-b'}`}>
                  <CardTitle className="flex justify-between items-center">
                    <span className="truncate">{page.title}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      page.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {page.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {page.description || 'No description provided.'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Slug: {page.slug}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    {page.isPublished && (
                      <Link
                        href={publicPagePath}
                        target="_blank"
                        className="text-xs px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                      >
                        View Page
                      </Link>
                    )}
                    <Link
                      href={editPagePath}
                      className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Edit Page
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 