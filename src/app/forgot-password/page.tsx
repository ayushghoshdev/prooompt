"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeftIcon, SunIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleResetPassword = async () => {
    const result = emailSchema.safeParse({ email });

    if (!result.success) {
      const fieldErrors: { email?: string } = {};

      result.error.issues.forEach((issue) => {
        if (issue.path.includes("email")) {
          fieldErrors.email = issue.message;
        }
      });

      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    // Check if email exists in profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      setLoading(false);
      setErrors({ form: "Email is not linked to an account" });
      return;
    }

    // Email exists, send reset link
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback`,
    });

    setLoading(false);

    if (error) {
      setErrors({ form: error.message });
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen">
        <header className="w-full p-4">
          <div className="mx-auto flex items-center justify-between">
            <Button asChild variant="secondary" className="pr-3">
              <Link href="/">
                <ArrowLeftIcon size={32} weight="bold" />
                Go back
              </Link>
            </Button>
            <Button variant="ghost" size="icon" aria-label="Toggle theme">
              <SunIcon size={18} weight="bold" />
            </Button>
          </div>
        </header>

        <main className="flex items-center justify-center min-h-[calc(100vh-200px)] px-6">
          <div className="w-full max-w-sm space-y-6 p-6">
            <div className="space-y-4">
              <Image
                src="/icon.png"
                width="30"
                height="30"
                alt="Icon"
                className="transition-transform duration-1000 ease-in-out hover:rotate-360"
              />
              <div className="space-y-1">
                <h1 className="text-xl font-semibold">Check your email</h1>
                <p className="text-sm text-muted-foreground">
                  Follow the instructions sent to{" "}
                  <span className="font-medium text-foreground">{email}</span>{" "}
                  to reset your password
                </p>
              </div>
            </div>

            <Button asChild className="w-full">
              <Link href="/login">Back to login</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="w-full p-4">
        <div className="mx-auto flex items-center justify-between">
          <Button asChild variant="secondary" className="pr-3">
            <Link href="/">
              <ArrowLeftIcon size={32} weight="bold" />
              Go back
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Toggle theme">
            <SunIcon size={18} weight="bold" />
          </Button>
        </div>
      </header>

      <main className="flex items-center justify-center min-h-[calc(100vh-200px)] px-6">
        <div className="w-full max-w-sm space-y-6 p-6">
          <div className="text-left space-y-1">
            <Image
              src="/icon.png"
              width="30"
              height="30"
              alt="Icon"
              className="transition-transform duration-1000 ease-in-out hover:rotate-360"
            />
            <h1 className="text-xl font-semibold">Reset your password</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and we'll send you a link to reset your password
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email ? (
                <p className="mt-1 text-sm text-destructive">{errors.email}</p>
              ) : null}
            </div>
          </div>

          {errors.form ? (
            <p className="text-sm text-destructive">{errors.form}</p>
          ) : null}

          <Button
            onClick={handleResetPassword}
            className="w-full"
            disabled={loading}
          >
            {loading ? <Spinner className="size-4" /> : "Continue"}
          </Button>

          <div className="text-sm">
            <p className="text-muted-foreground">
              Remember your password?{" "}
              <span className="cursor-pointer font-medium text-foreground hover:underline">
                <Link href="/login">Log in</Link>
              </span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
