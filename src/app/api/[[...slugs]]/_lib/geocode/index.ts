import Elysia, { t, type Context } from "elysia";
import { isAdminRole } from "@/lib/auth-policy";
import { defaultGeocoder, type Geocoder } from "@/lib/geocode/nominatim";
import { requireRole } from "../guard";

export const GEOCODE_Q_MIN = 3;
export const GEOCODE_Q_MAX = 200;
export const PESAN_GEOCODE_BUKAN_ADMIN = "Hanya admin yang boleh mencari lokasi di peta";
export const PESAN_GEOCODE_UPSTREAM = "Layanan pencarian lokasi sedang tidak tersedia";

// GET di luar ADMIN_ONLY_GET_PATHS tidak dijaga route.ts, jadi sesi + role admin dicek di handler.
export function createGeocodeRoutes(geocoder: Geocoder) {
  return new Elysia({ prefix: "/geocode", tags: ["Geocode"] }).get(
    "/search",
    async (context: Pick<Context, "set"> & { query: { q?: string } }) => {
      const guard = await requireRole(context, isAdminRole, PESAN_GEOCODE_BUKAN_ADMIN);
      if (!guard.ok) return guard.body;

      const q = (context.query.q ?? "").trim();
      if (q.length < GEOCODE_Q_MIN || q.length > GEOCODE_Q_MAX) {
        context.set.status = 400;
        return { success: false, message: `Kata kunci lokasi harus ${GEOCODE_Q_MIN}–${GEOCODE_Q_MAX} karakter` };
      }

      const hasil = await geocoder.search(q, guard.user.id);
      if (hasil.status === "limited") {
        const detik = Math.max(1, Math.ceil(hasil.retryAfterMs / 1000));
        context.set.status = 429;
        context.set.headers["Retry-After"] = String(detik);
        return { success: false, message: `Terlalu banyak pencarian lokasi. Coba lagi dalam ${detik} detik.` };
      }
      if (hasil.status === "upstream_error") {
        context.set.status = 502;
        return { success: false, message: PESAN_GEOCODE_UPSTREAM };
      }
      return { success: true, data: hasil.data };
    },
    { query: t.Object({ q: t.Optional(t.String()) }) },
  );
}

const Geocode = createGeocodeRoutes(defaultGeocoder);

export default Geocode;
