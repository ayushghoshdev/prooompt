"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  ChatCircleIcon,
  CaretDownIcon,
  SignInIcon,
  GearSixIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type User = {
  id: string;
  email?: string;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
  };
};

export default function TopRightActions() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user as User | null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user as User | null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) {
    return (
      <header className="fixed top-4 right-4 z-50 flex items-center">
        <Button variant="ghost" size="icon">
          <ChatCircleIcon size={32} weight="bold" />
        </Button>
        <ThemeToggle />
      </header>
    );
  }

  return (
    <header className="fixed top-4 right-4 z-50 flex items-center">
      {user ? (
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-16">
                <div className="relative h-4 w-4 overflow-hidden rounded-full bg-muted">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata.full_name || "User"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <CaretDownIcon size={16} weight="bold" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-25" align="center">
              <DropdownMenuGroup>
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <GearSixIcon size={32} weight="bold" /> Settings
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>

              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleLogout}
                >
                  <SignOutIcon size={32} weight="bold" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <Link href="/login">
          <Button>
            <SignInIcon size={32} weight="bold" />
            <p className="mb-0.5">Login</p>
          </Button>
        </Link>
      )}

      <ThemeToggle />
    </header>
  );
}
