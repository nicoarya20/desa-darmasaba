import Elysia, { t, type Context } from "elysia";
import { isAdminRole } from "@/lib/auth-policy";
import { defaultGeocoder, type Geocoder, type GeocodeOutcome, type ReverseGeocodeOutcome } from "@/lib/geocode/nominatim";
import { requireRole } from "../guard";

export const GEOCODE_Q_MIN = 3;
export const GEOCODE_Q_MAX = 200;
export const PESAN_GEOCODE_BUKAN_ADMIN = "Hanya admin yang boleh mencari lokasi di peta";
export const PESAN_GEOCODE_UPSTREAM = "Layanan pencarian lokasi sedang tidak tersedia";
export const PESAN_GEOCODE_KOORDINAT = "Koordinat tidak valid: lat harus -90..90 dan lng -180..180";

type GeocodeContext<Q> = Pick<Context, "set"> & { query: Q };

function parseKoordinat(raw: string | undefined, batas: number): number | null {
  if (raw === undefined || raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= -batas && n <= batas ? n : null;
}

function balas(context: Pick<Context, "set">, hasil: GeocodeOutcome | ReverseGeocodeOutcome) {
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
}

// GET di luar ADMIN_ONLY_GET_PATHS tidak dijaga route.ts, jadi sesi + role admin dicek di handler.
export function createGeocodeRoutes(geocoder: Geocoder) {
  return new Elysia({ prefix: "/geocode", tags: ["Geocode"] })
    .get(
      "/search",
      async (context: GeocodeContext<{ q?: string }>) => {
        const guard = await requireRole(context, isAdminRole, PESAN_GEOCODE_BUKAN_ADMIN);
        if (!guard.ok) return guard.body;

        const q = (context.query.q ?? "").trim();
        if (q.length < GEOCODE_Q_MIN || q.length > GEOCODE_Q_MAX) {
          context.set.status = 400;
          return { success: false, message: `Kata kunci lokasi harus ${GEOCODE_Q_MIN}–${GEOCODE_Q_MAX} karakter` };
        }

        return balas(context, await geocoder.search(q, guard.user.id));
      },
      { query: t.Object({ q: t.Optional(t.String()) }) },
    )
    .get(
      "/reverse",
      async (context: GeocodeContext<{ lat?: string; lng?: string }>) => {
        const guard = await requireRole(context, isAdminRole, PESAN_GEOCODE_BUKAN_ADMIN);
        if (!guard.ok) return guard.body;

        const lat = parseKoordinat(context.query.lat, 90);
        const lng = parseKoordinat(context.query.lng, 180);
        if (lat === null || lng === null) {
          context.set.status = 400;
          return { success: false, message: PESAN_GEOCODE_KOORDINAT };
        }

        return balas(context, await geocoder.reverse(lat, lng, guard.user.id));
      },
      { query: t.Object({ lat: t.Optional(t.String()), lng: t.Optional(t.String()) }) },
    );
}

const Geocode = createGeocodeRoutes(defaultGeocoder);

export default Geocode;
