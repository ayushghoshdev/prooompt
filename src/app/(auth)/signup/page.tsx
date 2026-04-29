"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { ArrowLeftIcon, SunIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const signupSchema = z
  .object({
    name: z.string().min(4, "Full name is required"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .regex(
        /(?=.*[a-z])/,
        "Password must contain at least one lowercase letter",
      )
      .regex(
        /(?=.*[A-Z])/,
        "Password must contain at least one uppercase letter",
      )
      .regex(/(?=.*\d)/, "Password must contain at least one digit"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  }>({});
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const loginWithGoogle = async () => {
    setLoadingGoogle(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  const continueSignup = async () => {
    const result = signupSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: {
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
      } = {};

      result.error.issues.forEach((issue) => {
        if (issue.path.includes("name")) {
          fieldErrors.name = issue.message;
        }
        if (issue.path.includes("email")) {
          fieldErrors.email = issue.message;
        }
        if (issue.path.includes("password")) {
          fieldErrors.password = issue.message;
        }
        if (issue.path.includes("confirmPassword")) {
          fieldErrors.confirmPassword = issue.message;
        }
      });

      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoadingEmail(true);

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
        },
      },
    });

    setLoadingEmail(false);

    if (error) {
      setErrors({ form: error.message });
      return;
    }

    sessionStorage.setItem("signupEmail", formData.email);
    sessionStorage.setItem("signupPassword", formData.password);
    router.push("/confirm");
  };

  return (
    <div className="w-full max-w-sm space-y-6 p-6">
      <div className="text-left space-y-2">
        <Image
          src="/icon.png"
          width={30}
          height={30}
          alt="Icon"
          className="transition-transform duration-1000 ease-in-out hover:rotate-360"
        />
        <h1 className="text-xl font-semibold">Create your Prooompt account</h1>
      </div>

      <div className="space-y-3">
        <div>
          <Input
            type="text"
            placeholder="Full name"
            value={formData.name}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                name: event.target.value,
              }))
            }
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name ? (
            <p className="mt-1 text-sm text-destructive">{errors.name}</p>
          ) : null}
        </div>

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

        <div>
          <Input
            type="password"
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
          {errors.password ? (
            <p className="mt-1 text-sm text-destructive">{errors.password}</p>
          ) : null}
        </div>

        <div>
          <Input
            type="password"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                confirmPassword: event.target.value,
              }))
            }
            aria-invalid={Boolean(errors.confirmPassword)}
          />
          {errors.confirmPassword ? (
            <p className="mt-1 text-sm text-destructive">
              {errors.confirmPassword}
            </p>
          ) : null}
        </div>
      </div>

      {errors.form ? (
        <p className="text-sm text-destructive">{errors.form}</p>
      ) : null}

      <Button
        onClick={continueSignup}
        className="w-full"
        disabled={loadingEmail || loadingGoogle}
      >
        {loadingEmail ? <Spinner className="size-4" /> : "Continue"}
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
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <span className="cursor-pointer font-medium text-foreground hover:underline">
            <Link href="/login">Log in</Link>
          </span>
        </p>
      </div>
    </div>
  );
}
