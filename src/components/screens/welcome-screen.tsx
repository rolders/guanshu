"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface WelcomeScreenProps {
  messages: {
    welcome: string;
    pleaseLogin: string;
    welcomeBack: string;
    description: string;
  };
  locale: string;
}

export function WelcomeScreen({ messages, locale }: WelcomeScreenProps) {
  const t = useTranslations("auth.login");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">{messages.welcome}</h1>
        <p className="text-lg text-muted-foreground">{messages.pleaseLogin}</p>
        <Button asChild size="lg">
          <Link href={`/${locale}/auth/login`}>{t("submit")}</Link>
        </Button>
      </div>
    </main>
  );
}
