import { getDb } from "@/lib/db";

export async function getRegisterFormOptions() {
  try {
    const db = getDb();
    const stores = await db.store.findMany({
        orderBy: [{ isVerified: "desc" }, { name: "asc" }],
        select: { id: true, name: true, city: true },
      });

    return {
      stores,
    };
  } catch {
    return {
      stores: [],
    };
  }
}
