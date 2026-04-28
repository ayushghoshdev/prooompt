import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

import GuestView from "./GuestView";
import UserView from "./UserView";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { code?: string | string[] };
}) {
  const params = await searchParams;

  const code = Array.isArray(params.code) ? params.code[0] : params.code;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Error swapping code:", error.message);
      redirect(`/login?error=auth_failed`);
    }

    redirect(`/`);
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <GuestView />;
  }

  return <UserView user={user} />;
}
