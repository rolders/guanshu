import { getMessages } from "next-intl/server";
import { getPageSession } from "@/lib/auth/lucia";
import { redirect } from "next/navigation";
import { DatabaseUserAttributes } from "@/lib/auth/types";

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

  // Get user attributes from session
  const userAttributes: DatabaseUserAttributes | null =
    session?.user && isSessionUser(session.user)
      ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
          createdAt: new Date(), // We don't have these in the session
          updatedAt: new Date(), // We don't have these in the session
        }
      : null;

  // Redirect if user is not authorized
  if (!userAttributes || (userAttributes.role !== "GUEST" && userAttributes.role !== "ADMIN")) {
    redirect(`/${locale}`);
  }

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-card rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Welcome</h2>
          <p className="text-muted-foreground">
            Hello, {userAttributes.name || userAttributes.email}!
          </p>
        </div>
        <div className="p-6 bg-card rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Role</h2>
          <p className="text-muted-foreground">
            Your role is: {userAttributes.role}
          </p>
        </div>
        <div className="p-6 bg-card rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Account</h2>
          <p className="text-muted-foreground">
            Email: {userAttributes.email}
          </p>
        </div>
      </div>
    </main>
  );
} 