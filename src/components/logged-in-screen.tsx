"use client";

interface LoggedInScreenProps {
  messages: {
    welcomeBack: string;
    description: string;
  };
}

export function LoggedInScreen({ messages }: LoggedInScreenProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">{messages.welcomeBack}</h1>
        <p className="text-lg text-muted-foreground">{messages.description}</p>
      </div>
    </main>
  );
}
