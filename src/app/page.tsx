import { redirect } from "next/navigation";

// Halaman utama situs adalah beranda publik; splash pembuka diputar di sana (GateSplash).
export default function Page() {
  redirect("/darmasaba");
}
