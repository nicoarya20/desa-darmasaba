import { authStore } from "@/store/authStore";

/** Logout dari browser (layout admin & /dev). Selalu berakhir di /login, termasuk bila API gagal. */
export async function logoutAndRedirect(): Promise<void> {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    const result = await response.json();

    if (result.success) {
      localStorage.removeItem("auth_nomor");
      localStorage.removeItem("auth_kodeId");
      localStorage.removeItem("auth_username");
    } else {
      console.error("Logout failed:", result.message);
    }
  } catch (error) {
    console.error("Error during logout:", error);
  }
  authStore.setUser(null);
  window.location.href = "/login";
}
