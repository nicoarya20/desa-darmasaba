import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

/**
 * Rute non-publik yang tidak perlu dirayapi: panel admin, API, konsol developer, alur akun (login, registrasi,
 * profil, gateway `/auth/callback`) dan sisa alur OTP yang kini dialihkan proxy ke login.
 */
const DISALLOWED_PATHS: readonly string[] = [
  "/admin",
  "/api",
  "/dev",
  "/login",
  "/registrasi",
  "/profile",
  "/auth",
  "/validasi",
  "/waiting-room",
];

/** robots.txt: izinkan situs publik, tutup rute non-publik, tunjuk sitemap.xml. Noindex stg = plan-seo Fase A. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: [...DISALLOWED_PATHS] },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
