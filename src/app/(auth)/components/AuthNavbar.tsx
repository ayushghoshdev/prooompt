"use client";

import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, SunIcon } from "@phosphor-icons/react";
import Link from "next/link";

export default function AuthNavbar() {
  return (
    <header className="w-full p-4">
      <div className="mx-auto flex items-center justify-between">
        <Button asChild variant="secondary" className="pr-3">
          <Link href="/">
            <ArrowLeftIcon size={32} weight="bold" />
            Go back
          </Link>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
