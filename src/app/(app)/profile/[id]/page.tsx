import { notFound } from "next/navigation";

import { ProfileOverview } from "@/features/profile/components/profile-overview";
import { getProfilePageData } from "@/features/profile/queries";
import { canEditProfile, requireAuth } from "@/lib/auth/permissions";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();
  const data = await getProfilePageData(id, session.user.id);

  if (!data) {
    notFound();
  }

  const isCurrentUser = await canEditProfile(data.profile.userId);

  return (
    <ProfileOverview
      data={data}
      isCurrentUser={isCurrentUser}
      viewerId={session.user.id}
    />
  );
}
