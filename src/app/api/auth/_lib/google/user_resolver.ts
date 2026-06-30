// Petakan profil Google ke user aplikasi, lalu cari/link/buat user di DB.
// mapUserInfoToUser murni (testable). resolveOrCreateUser melakukan I/O ke Prisma.

import prisma from "@/lib/prisma";
import type { GoogleUserInfo } from "./oauth_client";

// Role default untuk user publik yang login via Google (lihat prisma/data/user/roles.json).
export const DEFAULT_USER_ROLE_ID = "5";

export type MappedGoogleUser = {
  googleId: string;
  email: string | null;
  avatarUrl: string | null;
  username: string;
};

/** Petakan respons userinfo Google ke field user aplikasi. Fungsi murni. */
export function mapUserInfoToUser(info: GoogleUserInfo): MappedGoogleUser {
  return {
    googleId: info.id,
    email: info.email ?? null,
    avatarUrl: info.picture ?? null,
    // fallback ke email lalu googleId agar username tidak pernah kosong
    username: info.name || info.email || info.id,
  };
}

export type ResolvedUser = {
  id: string;
  nomor: string | null;
  username: string;
  roleId: string;
  isActive: boolean;
};

/**
 * Urutan resolusi:
 * 1. Cari by googleId (user yang sudah pernah login Google).
 * 2. Fallback by email (mis. admin seeded yang belum punya googleId) → link googleId,
 *    PERTAHANKAN roleId existing (jangan turunkan admin jadi user biasa).
 * 3. Tidak ketemu → buat user baru roleId USER, isActive true.
 */
export async function resolveOrCreateUser(mapped: MappedGoogleUser): Promise<ResolvedUser> {
  const select = {
    id: true,
    nomor: true,
    username: true,
    roleId: true,
    isActive: true,
  } as const;

  const byGoogleId = await prisma.user.findUnique({
    where: { googleId: mapped.googleId },
    select,
  });
  if (byGoogleId) return byGoogleId;

  if (mapped.email) {
    const byEmail = await prisma.user.findUnique({
      where: { email: mapped.email },
      select,
    });
    if (byEmail) {
      // link akun Google ke user existing tanpa mengubah role
      return prisma.user.update({
        where: { id: byEmail.id },
        data: {
          googleId: mapped.googleId,
          avatarUrl: mapped.avatarUrl,
        },
        select,
      });
    }
  }

  return prisma.user.create({
    data: {
      username: mapped.username,
      email: mapped.email,
      googleId: mapped.googleId,
      avatarUrl: mapped.avatarUrl,
      roleId: DEFAULT_USER_ROLE_ID,
      isActive: true,
    },
    select,
  });
}
