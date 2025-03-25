import { getMessages } from "next-intl/server";
import { getPageSession } from "@/lib/auth/lucia";
import { redirect } from "next/navigation";
import { DatabaseUserAttributes } from "@/lib/auth/types";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserPages } from "@/lib/actions/pages";

// Type guard for session user
interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "GUEST" | "ADMIN";
}

function isSessionUser(user: unknown): user is SessionUser {
  if (!user || typeof user !== "object") return false;
  const u = user as Record<string, unknown>;
  return (
    typeof u.id === "string" &&
    typeof u.email === "string" &&
    (typeof u.name === "string" || u.name === null) &&
    typeof u.role === "string" &&
    ["USER", "GUEST", "ADMIN"].includes(u.role)
  );
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [messages, session] = await Promise.all([
    getMessages({ locale }),
    getPageSession(),
  ]);

  // Create a user object from session for display purposes only
  // We're not using this as a DatabaseUserAttributes due to date handling
  const userInfo =
    session?.user && isSessionUser(session.user)
      ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
        }
      : null;

  // Redirect if user is not authorized
  if (!userInfo || (userInfo.role !== "USER" && userInfo.role !== "ADMIN")) {
    redirect(`/${locale}`);
  }

  // Fetch user pages summary
  const pagesResult = await getUserPages();
  const pageCount = pagesResult.success && pagesResult.pages ? pagesResult.pages.length : 0;

  // Create a unique key for the server component to prevent hydration issues
  const serverKey = Date.now().toString();

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Hello, {userInfo.name || userInfo.email}!
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You have {pageCount} {pageCount === 1 ? 'page' : 'pages'}
            </p>
            <div className="flex space-x-2">
              <Link
                href={`/${locale}/dashboard/pages`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Manage Pages
              </Link>
              <Link
                href={`/${locale}/dashboard/pages/new`}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create New Page
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Role: {userInfo.role}<br />
              Email: {userInfo.email}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-2xl font-bold mb-4">Quick Links</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href={`/${locale}/dashboard/pages`}
          className="p-4 bg-indigo-100 hover:bg-indigo-200 rounded-lg border border-indigo-200 text-center"
        >
          <h3 className="font-medium">Pages</h3>
          <p className="text-sm text-gray-600">Manage your aggregator pages</p>
        </Link>
        
        <Link
          href={`/${locale}/dashboard/pages/new`}
          className="p-4 bg-green-100 hover:bg-green-200 rounded-lg border border-green-200 text-center"
        >
          <h3 className="font-medium">New Page</h3>
          <p className="text-sm text-gray-600">Create a new aggregator page</p>
        </Link>
      </div>
    </main>
  );
} 