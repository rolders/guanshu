import { getPageSession } from "@/lib/auth/lucia";
import { redirect } from "next/navigation";
import Link from "next/link";
import PageForm from "../_components/PageForm";

export default async function NewPagePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getPageSession();

  // Redirect if not logged in
  if (!session?.user) {
    redirect(`/${locale}`);
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Link
          href={`/${locale}/dashboard/pages`}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Pages
        </Link>
        <h1 className="text-3xl font-bold mt-2">Create New Page</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <PageForm locale={locale} />
      </div>
    </div>
  );
} 