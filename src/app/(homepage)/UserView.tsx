"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import AiPromptBox from "./components/AiPromptBox";

export default function UserView({ user }: { user: User }) {
  const supabase = createClient();

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const getProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, email, profilePicture")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setProfile(data);
      }
    };

    if (user?.id) {
      getProfile();
    }
  }, [user]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl space-y-2">
        <h1 className="text-2xl font-medium">
          What can I help with, {profile?.name.split(" ")[0]}?
        </h1>
        <AiPromptBox />
      </div>
    </div>
  );
}
