"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [errors, setErrors] = useState<{ pin?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("signupEmail");
    const storedPassword = sessionStorage.getItem("signupPassword");

    if (!storedEmail) {
      router.replace("/signup");
      return;
    }

    setEmail(storedEmail);
    setPassword(storedPassword ?? "");
  }, [router]);

  const confirmSignup = async () => {
    if (!pin.trim()) {
      setErrors({ pin: "Enter the code sent to your email." });
      return;
    }

    if (!email) {
      router.replace("/signup");
      return;
    }

    setErrors({});
    setLoading(true);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: pin.trim(),
      type: "signup",
    });

    if (verifyError) {
      setLoading(false);
      setErrors({ form: verifyError.message });
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setErrors({ form: signInError.message });
      return;
    }

    sessionStorage.removeItem("signupEmail");
    sessionStorage.removeItem("signupPassword");
    router.push("/");
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
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Verify your email</h1>
          <p className="text-sm text-muted-foreground">
            Enter the code sent to{" "}
            <span className="font-medium text-foreground">
              {email || "your email"}
            </span>
            .
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Input
            type="text"
            placeholder="6-digit code"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            aria-invalid={Boolean(errors.pin)}
          />
          {errors.pin ? (
            <p className="mt-1 text-sm text-destructive">{errors.pin}</p>
          ) : null}
        </div>
      </div>

      {errors.form ? (
        <p className="text-sm text-destructive">{errors.form}</p>
      ) : null}

      <Button onClick={confirmSignup} className="w-full" disabled={loading}>
        {loading ? <Spinner className="size-4" /> : "Verify"}
      </Button>

      <div className="text-sm text-muted-foreground">
        <p>
          If you did not receive the code,{" "}
          <span className="cursor-pointer font-medium text-foreground hover:underline">
            <Link href="/signup">try again</Link>
          </span>
        </p>
      </div>
    </div>
  );
}
