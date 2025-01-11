// src/components/welcome-screen.tsx
// Welcome screen component shown to unauthenticated users

"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

// Props interface for the WelcomeScreen component
interface WelcomeScreenProps {
  messages: {
    welcome: string;
    pleaseLogin: string;
  };
  locale: string;
}

// Component that displays a welcome message and login button for unauthenticated users
export function WelcomeScreen({ messages, locale }: WelcomeScreenProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">{messages.welcome}</h1>
        <p className="text-lg text-muted-foreground">{messages.pleaseLogin}</p>
        <Button asChild size="lg">
          <Link href={`/${locale}/auth/login`}>Log In</Link>
        </Button>
      </div>
    </main>
  );
}
