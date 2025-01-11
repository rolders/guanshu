"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
        {process.env.NODE_ENV === "development" && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            <pre>{error.message}</pre>
            {error.stack && <pre className="mt-2">{error.stack}</pre>}
          </div>
        )}
      </div>
      <Button onClick={reset} variant="default">
        {t("tryAgain")}
      </Button>
    </div>
  );
}
