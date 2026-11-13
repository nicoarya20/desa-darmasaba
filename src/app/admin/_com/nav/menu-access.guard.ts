// Guard halaman admin berbasis Menu Access — PEMBATASAN UI, BUKAN KEAMANAN.
// Endpoint API CRUD per menu belum dijaga per Menu Access (hutang teknis: user yang
// tahu URL API tetap bisa memanggilnya). Keamanan sesungguhnya tetap di proxy.ts
// (login/role admin) dan requireAuth di API.
import { PROFILE_PATH, ROLE_DEVELOPER } from "@/lib/auth-policy"
import type { NavItem } from "./domains"
import { navBar, pengaturanMenu } from "./index"
import { firstAllowedPath, isPathAllowed } from "./menu-access.logic"

// Semua menu yang dikelola Menu Access/role. Path admin di luar cakupan ini sengaja
// TIDAK diblokir: /admin (root, redirect per role di layout), /admin/auth/*, /admin/csv,
// /admin/images, dan /admin/landing-page/indeks-kepuasan-masyarakat (halaman lama
// tanpa entri menu; versi aktifnya di PPID). Halaman itu tidak terikat satu menu,
// jadi memblokirnya justru memutus alur umum (login, upload) tanpa menambah keamanan.
const MANAGED_NAV: readonly NavItem[] = [...navBar, pengaturanMenu]

type GuardInput = { pathname: string; roleId: number; nav: readonly NavItem[] }

/** Tujuan redirect bila pathname tidak diizinkan nav user; null bila boleh dibuka. */
export function adminGuardRedirect({ pathname, roleId, nav }: GuardInput): string | null {
  if (String(roleId) === ROLE_DEVELOPER) return null
  if (!isPathAllowed(pathname, MANAGED_NAV)) return null
  if (isPathAllowed(pathname, nav)) return null
  // Nav kosong → keluar dari /admin (profil) supaya tidak terjadi loop redirect.
  return firstAllowedPath(nav) ?? PROFILE_PATH
}
