import { revalidateTag } from "next/cache";
import type { Context } from "elysia";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { canManageMenuVisibility } from "@/lib/auth-policy";
import { isKnownMenuKey, MENU_VISIBILITY_TAG, type MenuVisibilityRow } from "@/app/(public)/_com/menu-visibility.logic";

type UpdateItem = { menuKey: string; isVisible: boolean | null };

/** Pesan galat validasi body, atau null bila semua menuKey dikenal & tidak ganda. */
export function validateMenuVisibilityItems(items: readonly UpdateItem[]): string | null {
  if (items.length === 0) return "Daftar perubahan kosong";
  const unknown = items.map((i) => i.menuKey).filter((key) => !isKnownMenuKey(key));
  if (unknown.length > 0) return `menuKey tidak dikenal: ${unknown.join(", ")}`;
  const keys = items.map((i) => i.menuKey);
  if (new Set(keys).size !== keys.length) return "menuKey tidak boleh ganda dalam satu permintaan";
  return null;
}

/**
 * PUT bulk override visibilitas submenu publik. Hanya role "0"/"1": tanpa sesi 401, role lain 403,
 * menuKey bukan href submenu navbar 400. isVisible null = hapus override (kembali ke default).
 */
export default async function menuVisibilityUpdate(context: Context) {
  const authResult = await requireAuth();
  if (!authResult.authenticated) {
    // Bentuk error seragam { success, message } (bukan Response mentah) agar tipe Eden konsumen tetap rapi.
    const { message } = (await authResult.response.json()) as { message: string };
    context.set.status = authResult.response.status;
    return { success: false, message };
  }

  if (!canManageMenuVisibility(authResult.user.roleId)) {
    context.set.status = 403;
    return { success: false, message: "Hanya Super Admin atau Developer yang boleh mengatur visibilitas menu" };
  }

  const { items } = context.body as { items: UpdateItem[] };
  const invalid = validateMenuVisibilityItems(items);
  if (invalid) {
    context.set.status = 400;
    return { success: false, message: invalid };
  }

  const updatedById = authResult.user.id;
  await prisma.$transaction(
    items.map(({ menuKey, isVisible }) =>
      isVisible === null
        ? prisma.menuVisibility.deleteMany({ where: { menuKey } })
        : prisma.menuVisibility.upsert({
            where: { menuKey },
            create: { menuKey, isVisible, updatedById },
            update: { isVisible, updatedById },
          }),
    ),
  );
  // expire 0: navbar, pencarian & guard 404 publik langsung memakai pengaturan baru.
  revalidateTag(MENU_VISIBILITY_TAG, { expire: 0 });

  const data: MenuVisibilityRow[] = await prisma.menuVisibility.findMany({
    select: { menuKey: true, isVisible: true },
    orderBy: { menuKey: "asc" },
  });
  return { success: true, data };
}
