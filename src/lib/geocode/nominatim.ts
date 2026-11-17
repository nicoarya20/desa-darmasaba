// Geocoding alamat → kandidat koordinat lewat Nominatim (OpenStreetMap), dipanggil dari server agar patuh
// kebijakan pemakaian: User-Agent jelas, maks 1 request/detik global, tanpa autocomplete per ketikan.
import { z } from "zod";
import { createLimiter, type Limiter } from "@/lib/rate-limit";
import pkg from "../../../package.json";

export type GeocodeCandidate = { lat: number; lng: number; label: string };

export type ReverseGeocodeResult = { alamat: string; nama: string | null };

type Muat<T> = { ok: true; data: T } | { ok: false };

type GeocodeResult<T> =
  | { status: "ok"; data: T }
  | { status: "limited"; retryAfterMs: number }
  | { status: "upstream_error" };

export type GeocodeOutcome = GeocodeResult<GeocodeCandidate[]>;
/** data null = Nominatim tidak menemukan alamat di titik itu (mis. di laut), bukan error. */
export type ReverseGeocodeOutcome = GeocodeResult<ReverseGeocodeResult | null>;

export const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
export const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";
export const GEOCODE_MAX_RESULTS = 5;
export const GEOCODE_LABEL_MAX = 200;
export const GEOCODE_TIMEOUT_MS = 5000;
export const GEOCODE_UPSTREAM_INTERVAL_MS = 1100;
export const GEOCODE_USER_PER_MINUTE = 20;
export const GEOCODE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const GEOCODE_CACHE_MAX = 200;
export const GEOCODE_USER_AGENT = `desa-darmasaba-admin/${pkg.version} (geocoding)`;

const DARMASABA_VIEWBOX = "115.15,-8.52,115.24,-8.62";
const KONTEKS_WILAYAH = ", Darmasaba, Badung, Bali";
const PENANDA_WILAYAH = /darmasaba|badung|bali/i;

/** Tambah konteks wilayah bila teks belum menyebut Darmasaba/Badung/Bali. */
export function buildGeocodeQuery(q: string): string {
  const teks = q.trim();
  return PENANDA_WILAYAH.test(teks) ? teks : `${teks}${KONTEKS_WILAYAH}`;
}

export function normalizeGeocodeKey(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, " ");
}

export function buildNominatimUrl(q: string): string {
  const params = new URLSearchParams({
    q: buildGeocodeQuery(q),
    format: "jsonv2",
    limit: String(GEOCODE_MAX_RESULTS),
    countrycodes: "id",
    "accept-language": "id",
    viewbox: DARMASABA_VIEWBOX,
    bounded: "0",
  });
  return `${NOMINATIM_SEARCH_URL}?${params.toString()}`;
}

const koordinat = (min: number, max: number) =>
  z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((n) => Number.isFinite(n) && n >= min && n <= max);

const nominatimItemSchema = z.object({
  lat: koordinat(-90, 90),
  lon: koordinat(-180, 180),
  display_name: z.string().trim().min(1),
});

/** Respons bukan array → null (tak valid). Item tak valid dibuang; maks 5 kandidat. */
export function parseNominatimResponse(json: unknown): GeocodeCandidate[] | null {
  if (!Array.isArray(json)) return null;
  const hasil: GeocodeCandidate[] = [];
  for (const raw of json) {
    const item = nominatimItemSchema.safeParse(raw);
    if (!item.success) continue;
    hasil.push({ lat: item.data.lat, lng: item.data.lon, label: item.data.display_name.slice(0, GEOCODE_LABEL_MAX) });
    if (hasil.length >= GEOCODE_MAX_RESULTS) break;
  }
  return hasil;
}

/** Dibulatkan 5 desimal (~1 m) agar klik berdekatan memakai cache yang sama. */
export function reverseCacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(5)},${lng.toFixed(5)}`;
}

export function buildNominatimReverseUrl(lat: number, lng: number): string {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(lat),
    lon: String(lng),
    zoom: "18",
    addressdetails: "1",
    "accept-language": "id",
  });
  return `${NOMINATIM_REVERSE_URL}?${params.toString()}`;
}

const KATEGORI_BUKAN_POI = new Set(["highway", "place", "boundary", "landuse", "natural", "waterway", "railway"]);

const nominatimReverseErrorSchema = z.object({ error: z.union([z.string(), z.record(z.string(), z.unknown())]) });

const nominatimReverseSchema = z.object({
  display_name: z.string().optional().catch(undefined),
  name: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
  address: z.record(z.string(), z.unknown()).optional().catch(undefined),
});

function teks(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function susunAlamat(address: Record<string, unknown>, displayName: string | undefined): string {
  const pertama = (...keys: string[]) => keys.map((k) => teks(address[k])).find(Boolean);
  const road = teks(address.road);
  const nomor = teks(address.house_number);
  const bagian = [
    road && nomor ? `${road} No. ${nomor}` : road,
    pertama("hamlet", "neighbourhood", "quarter"),
    pertama("village", "suburb"),
    pertama("town", "city_district", "city", "county"),
  ].filter((b): b is string => Boolean(b));
  const unik = bagian.filter((b, i) => i === 0 || b.toLowerCase() !== bagian[i - 1].toLowerCase());
  const alamat = unik.length
    ? unik.join(", ")
    : (displayName ?? "")
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean)
        .slice(0, 3)
        .join(", ");
  return alamat.slice(0, GEOCODE_LABEL_MAX);
}

/** `{ error }` → data null (tidak ditemukan); bentuk tak dikenal / tanpa alamat sama sekali → ok:false (upstream error). */
export function parseNominatimReverse(json: unknown): Muat<ReverseGeocodeResult | null> {
  if (nominatimReverseErrorSchema.safeParse(json).success) return { ok: true, data: null };
  if (typeof json !== "object" || json === null || Array.isArray(json)) return { ok: false };
  const parsed = nominatimReverseSchema.safeParse(json);
  if (!parsed.success) return { ok: false };
  const { display_name, name, category, address = {} } = parsed.data;

  const alamat = susunAlamat(address, teks(display_name));
  if (!alamat) return { ok: false };

  const namaTempat = teks(name);
  const road = teks(address.road);
  const isPoi = category !== undefined && !KATEGORI_BUKAN_POI.has(category);
  const nama =
    namaTempat && isPoi && namaTempat.toLowerCase() !== road?.toLowerCase() ? namaTempat.slice(0, GEOCODE_LABEL_MAX) : null;
  return { ok: true, data: { alamat, nama } };
}

export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

export type GeocoderDeps = {
  fetch?: FetchLike;
  now?: () => number;
  timeoutMs?: number;
};

function createTtlCache<T>() {
  const store = new Map<string, { data: T; expiresAt: number }>();
  return {
    get(key: string, t: number): { data: T } | undefined {
      const hit = store.get(key);
      if (!hit) return undefined;
      if (hit.expiresAt <= t) {
        store.delete(key);
        return undefined;
      }
      return { data: hit.data };
    },
    set(key: string, data: T, t: number) {
      store.delete(key);
      while (store.size >= GEOCODE_CACHE_MAX) {
        const tertua = store.keys().next().value;
        if (tertua === undefined) break;
        store.delete(tertua);
      }
      store.set(key, { data, expiresAt: t + GEOCODE_CACHE_TTL_MS });
    },
  };
}

export function createGeocoder(deps: GeocoderDeps = {}) {
  const doFetch = deps.fetch ?? fetch;
  const now = deps.now ?? Date.now;
  const timeoutMs = deps.timeoutMs ?? GEOCODE_TIMEOUT_MS;
  // Dipakai bersama search & reverse: kebijakan Nominatim berlaku per aplikasi.
  const upstreamLimiter: Limiter = createLimiter(1, GEOCODE_UPSTREAM_INTERVAL_MS);
  const userLimiter: Limiter = createLimiter(GEOCODE_USER_PER_MINUTE, 60_000);
  const searchCache = createTtlCache<GeocodeCandidate[]>();
  const reverseCache = createTtlCache<ReverseGeocodeResult | null>();

  async function fetchNominatim(url: string): Promise<Muat<unknown>> {
    try {
      const res = await doFetch(url, {
        headers: { "User-Agent": GEOCODE_USER_AGENT, Accept: "application/json" },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) {
        console.warn(`[geocode] Nominatim HTTP ${res.status}`);
        return { ok: false };
      }
      return { ok: true, data: await res.json() };
    } catch (err) {
      console.warn("[geocode] Nominatim gagal:", err instanceof Error ? err.name : "unknown");
      return { ok: false };
    }
  }

  /** Batas per-user dicek dulu (anti-abuse endpoint); cache hit tidak memakai slot throttle upstream global. */
  async function throttled<T>(
    userId: string,
    key: string,
    cache: ReturnType<typeof createTtlCache<T>>,
    load: () => Promise<Muat<T>>,
  ): Promise<GeocodeResult<T>> {
    const t = now();
    const user = userLimiter.check(userId, GEOCODE_USER_PER_MINUTE, t);
    if (!user.allowed) return { status: "limited", retryAfterMs: user.retryAfterMs };

    const cached = cache.get(key, t);
    if (cached) return { status: "ok", data: cached.data };

    const slot = upstreamLimiter.check("nominatim", 1, t);
    if (!slot.allowed) return { status: "limited", retryAfterMs: slot.retryAfterMs };

    const hasil = await load();
    if (!hasil.ok) return { status: "upstream_error" };
    cache.set(key, hasil.data, now());
    return { status: "ok", data: hasil.data };
  }

  function search(q: string, userId: string): Promise<GeocodeOutcome> {
    return throttled(userId, normalizeGeocodeKey(q), searchCache, async () => {
      const res = await fetchNominatim(buildNominatimUrl(q));
      if (!res.ok) return res;
      const parsed = parseNominatimResponse(res.data);
      if (!parsed) {
        console.warn("[geocode] respons Nominatim bukan array");
        return { ok: false };
      }
      return { ok: true, data: parsed };
    });
  }

  function reverse(lat: number, lng: number, userId: string): Promise<ReverseGeocodeOutcome> {
    return throttled(userId, reverseCacheKey(lat, lng), reverseCache, async () => {
      const res = await fetchNominatim(buildNominatimReverseUrl(lat, lng));
      if (!res.ok) return res;
      const parsed = parseNominatimReverse(res.data);
      if (!parsed.ok) console.warn("[geocode] respons reverse Nominatim tak dikenal");
      return parsed;
    });
  }

  return { search, reverse };
}

export type Geocoder = ReturnType<typeof createGeocoder>;

// globalThis: satu cache + throttle per proses, tidak ter-reset oleh HMR dev.
const globalGeocoder = globalThis as typeof globalThis & { __nominatimGeocoder?: Geocoder };
export const defaultGeocoder: Geocoder = (globalGeocoder.__nominatimGeocoder ??= createGeocoder());
