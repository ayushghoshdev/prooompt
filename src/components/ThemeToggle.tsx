"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <SunIcon
        size={32}
        weight="bold"
        className="absolute h-10 w-10 rotate-0 scale-100 dark:-rotate-90 dark:scale-0"
      />
      <MoonIcon
        size={32}
        weight="bold"
        className="absolute h-10 w-10 rotate-90 scale-0 dark:rotate-0 dark:scale-100"
      />
    </Button>
  );
}
