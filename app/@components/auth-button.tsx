"use client";

import { signIn, signOut } from "next-auth/react";
import { GithubIcon, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
interface AuthButtonsProps {
  session: object | null;
}

export function AuthButtons({ session }: AuthButtonsProps) {
  if (session) {
    return (
      <Button variant="outline" onClick={() => signOut()} className=" flex items-center">
        <LogOut className="w-6 h-6" />
        Sign out
      </Button>
    );
  }

  return (
    <Button variant="outline" className="rounded-full flex items-center animate-shimmer" onClick={() => signIn("github")}>
      <GithubIcon className="w-6 h-6" />
      Sign in with GitHub
    </Button>
  );
}
