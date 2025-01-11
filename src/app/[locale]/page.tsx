// src/app/[locale]/page.tsx
import { getMessages } from "next-intl/server";
import { cookies } from "next/headers";
import { WelcomeScreen } from "@/components/screens/welcome-screen";
import { LoggedInScreen } from "@/components/screens/logged-in-screen";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [messages, cookieStore] = await Promise.all([
    getMessages({ locale }),
    Promise.resolve(cookies()),
  ]);

  const isLoggedIn = Boolean(cookieStore.get("auth_session"));

  // Ensure we have the required messages
  const landingMessages = {
    welcome: messages.landing?.welcome ?? "Welcome to Base Stack",
    pleaseLogin: messages.landing?.pleaseLogin ?? "Please log in to continue",
    welcomeBack: messages.landing?.welcomeBack ?? "Welcome Back!",
    description:
      messages.landing?.description ?? "You're now logged into Base Stack",
  };

  if (!isLoggedIn) {
    return <WelcomeScreen messages={landingMessages} locale={locale} />;
  }

  return <LoggedInScreen messages={landingMessages} />;
}
