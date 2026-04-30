"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { EyeClosedIcon, EyeIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .regex(/(?=.*\d)/, "Password must contain at least one digit"),
});

export default function LoginPage() {
  const supabase = createClient();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    form?: string;
  }>({});
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginWithGoogle = async () => {
    setLoadingGoogle(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  const loginWithEmail = async () => {
    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};

      result.error.issues.forEach((issue) => {
        if (issue.path.includes("email")) {
          fieldErrors.email = issue.message;
        }
        if (issue.path.includes("password")) {
          fieldErrors.password = issue.message;
        }
      });

      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoadingEmail(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    setLoadingEmail(false);

    if (error) {
      setErrors({ form: error.message });
    }
  };

  return (
    <div className="w-full max-w-sm space-y-6 p-6">
      <div className="text-left space-y-2">
        <Image
          src="/icon.png"
          width="30"
          height="30"
          alt="Icon"
          className="transition-transform duration-1000 ease-in-out hover:rotate-360"
        />
        <h1 className="text-xl font-semibold">Login to Prooompt</h1>
      </div>

      <div className="space-y-3">
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                email: event.target.value,
              }))
            }
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? (
            <p className="mt-1 text-sm text-destructive">{errors.email}</p>
          ) : null}
        </div>

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                password: event.target.value,
              }))
            }
            aria-invalid={Boolean(errors.password)}
          />
          <span
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
          >
            {showPassword ? (
              <EyeClosedIcon size={16} weight="bold" />
            ) : (
              <EyeIcon size={16} weight="bold" />
            )}
          </span>
        </div>
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password}</p>
        ) : null}
      </div>

      {errors.form ? (
        <p className="text-sm text-destructive">{errors.form}</p>
      ) : null}

      <Button
        onClick={loginWithEmail}
        className="w-full"
        disabled={loadingEmail || loadingGoogle}
      >
        {loadingEmail ? <Spinner className="size-4" /> : "Log in"}
      </Button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-muted" />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Or login with
        </span>
        <div className="flex-1 h-px bg-muted" />
      </div>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={loginWithGoogle}
          className="w-full flex items-center gap-2"
          disabled={loadingEmail || loadingGoogle}
        >
          {loadingGoogle ? (
            <Spinner className="size-4" />
          ) : (
            <>
              <Image
                src="/google-icon.svg"
                width="15"
                height="15"
                alt="Google icon"
              />
              Google
            </>
          )}
        </Button>
      </div>

      <div className="text-sm not-first:space-y-1">
        <p className="cursor-pointer font-medium w-fit hover:underline">
          <Link href="forgot-password">Forgot password?</Link>
        </p>
        <p className="text-muted-foreground">
          Don't have an account?{" "}
          <span className="cursor-pointer font-medium text-foreground hover:underline">
            <Link href="signup">Sign up</Link>
          </span>
        </p>
      </div>
    </div>
  );
}
