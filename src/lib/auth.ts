import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import prisma from "./prisma";
import { env } from "./env";
import { ROLE_SUPER_ADMIN, ROLE_USER, resolveRoleForNewUser } from "./auth-policy";

// Pola mengikuti base-template2 (standar tim), dengan 3 penyesuaian:
//  (A) TANPA secondaryStorage (Redis) — session store Postgres saja.
//  (B) emailAndPassword.enabled = false — Google-only.
//  (C) rateLimit.storage = "database" (base-template2 pakai "secondary-storage").
// Role di-map: base-template2 `role`(enum)/`blocked` → `roleId`(string)/`isActive`.
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL || `http://localhost:${env.PORT}`,

  // ─── Google-only ───────────────────────────────────
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  // ─── Account linking ───────────────────────────────
  // User Google lama (dibuat sistem manual sebelum migrasi) sudah ada di tabel
  // `users` by email, tapi belum punya row `account` Better Auth. Google memverifikasi
  // email, jadi aman dijadikan trusted provider → auto-link ke user existing
  // (mencegah error account_not_linked untuk user lama).
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      // User lama dibuat sistem manual tanpa set emailVerified (=false di DB).
      // Google sudah memverifikasi email, jadi tak perlu syarat verifikasi email
      // LOKAL untuk meng-link — cukup email cocok + provider trusted (Google).
      requireLocalEmailVerified: false,
    },
  },

  // ─── Session (Postgres, tanpa Redis) ───────────────
  session: {
    expiresIn: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
    storeSessionInDatabase: true,
    // Cookie cache dimatikan: role/isActive bisa berubah kapan saja
    // (mis. admin promote lewat tab Warga) — cache akan serve role lama.
    cookieCache: {
      enabled: false,
    },
  },

  // ─── Map ke schema User existing desa-darmasaba ────
  // `username`/`avatarUrl` sudah ada → dipetakan ke core field Better Auth
  // (`name`/`image`) supaya tak menduplikasi kolom.
  user: {
    modelName: "user",
    fields: {
      name: "username",
      image: "avatarUrl",
    },
    additionalFields: {
      roleId: {
        type: "string",
        required: false,
        defaultValue: ROLE_USER,
        input: false,
      },
      isActive: {
        // Google user baru LANGSUNG aktif → /profile (keputusan user).
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
    },
  },

  // ─── User BARU dari SUPER_ADMIN_EMAILS → roleId "1" sejak sesi pertama ─
  databaseHooks: {
    user: {
      create: {
        before: async (userData) => {
          const email = (userData as { email?: string }).email ?? "";
          const roleId = resolveRoleForNewUser(email, env.SUPER_ADMIN_EMAILS);
          if (roleId !== ROLE_USER) {
            return { data: { ...userData, roleId } };
          }
        },
      },
    },
  },

  // ─── After sign-in: tolak user non-aktif + promote existing super admin ─
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const isSignIn =
        ctx.path === "/sign-in/social" || ctx.path?.startsWith?.("/callback/");
      if (!isSignIn) return;

      const newSession = ctx.context.newSession;
      if (!newSession) return;

      const user = await prisma.user.findUnique({
        where: { id: newSession.user.id },
        select: { isActive: true, email: true, roleId: true },
      });

      // Tolak login user non-aktif (dinonaktifkan admin) — hapus session Better Auth
      // yang barusan dibuat supaya tak ada sesi valid tersisa.
      if (user && user.isActive === false) {
        await prisma.session
          .delete({ where: { id: newSession.session.id } })
          .catch(() => {});
        throw new APIError("FORBIDDEN", {
          message: "Akun Anda nonaktif. Hubungi administrator.",
        });
      }

      // Promote existing user ∈ SUPER_ADMIN_EMAILS (env ditambah setelah user ada).
      if (
        env.SUPER_ADMIN_EMAILS.includes(user?.email ?? "") &&
        user?.roleId !== ROLE_SUPER_ADMIN
      ) {
        await prisma.user.update({
          where: { id: newSession.user.id },
          data: { roleId: ROLE_SUPER_ADMIN },
        });
      }
    }),
  },

  // ─── Security ──────────────────────────────────────
  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
    crossSubDomainCookies: {
      enabled: false,
    },
  },

  // ─── Rate limit (storage database — tanpa Redis) ───
  rateLimit: {
    enabled: env.NODE_ENV === "production",
    window: 60,
    max: 10,
    storage: "database",
  },

  trustedOrigins: [
    env.BETTER_AUTH_URL || `http://localhost:${env.PORT}`,
    `http://localhost:${env.PORT}`,
  ],
});

export type Auth = typeof auth;
