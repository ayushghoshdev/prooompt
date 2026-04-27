"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

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

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div>
      <img
        src={profile?.profilePicture}
        alt="profile picture"
        width={80}
        height={80}
      />

      <p>Email: {profile?.email}</p>
      <p>Name: {profile?.name}</p>

      <Button onClick={logout}>Logout</Button>
    </div>
  );
}
