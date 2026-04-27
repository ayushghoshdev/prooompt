import { createClient } from "@/lib/supabase/server";

import GuestView from "./GuestView";
import UserView from "./UserView";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <GuestView />;
  }

  return <UserView user={user} />;
}
