// src/components/ui/auth-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import { DatabaseUserAttributes } from "@/lib/auth/types";

interface AuthButtonProps {
  user?: DatabaseUserAttributes | null;
}

export function AuthButton({ user }: AuthButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];

  const handleClick = async () => {
    if (user) {
      await logout();
      router.refresh();
    } else {
      router.push(`/${locale}/auth/login` as `/${string}/auth/login`);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className="focus:outline-none"
    >
      {user ? <LogOut className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
    </Button>
  );
}
