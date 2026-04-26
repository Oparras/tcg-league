import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/permissions";

export default async function MyProfilePage() {
  const session = await requireAuth();

  redirect(`/profile/${session.user.id}`);
}
