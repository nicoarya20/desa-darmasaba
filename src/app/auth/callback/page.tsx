import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { defaultRouteForRole } from "@/lib/auth-policy";

// Gateway setelah login Google (Better Auth callbackURL menunjuk ke sini).
// Baca sesi server-side lalu arahkan sesuai role: admin → dashboard, user → /profile.
// Tanpa sesi (mis. akses langsung) → kembali ke /login.
export default async function AuthCallbackPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const roleId = (session.user as { roleId?: string }).roleId ?? "5";
  redirect(defaultRouteForRole(roleId));
}
