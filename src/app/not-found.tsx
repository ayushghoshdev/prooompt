"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HouseIcon } from "@phosphor-icons/react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-8">
      <div className="flex flex-col md:flex-row items-center">
        <h1 className="text-[250px] leading-none bg-linear-to-b md:bg-linear-to-r from-muted-foreground via-muted-foreground/40 to-transparent bg-clip-text text-transparent">
          404
        </h1>

        <div className="flex flex-col items-start max-w-sm">
          <h2 className="text-3xl font-semibold text-foreground mb-4 text-left">
            Page Not Found
          </h2>

          <p className="text-lg text-muted-foreground mb-4 text-left">
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>

          <Button asChild size="lg">
            <Link href="/">
              <HouseIcon size={32} weight="bold" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
