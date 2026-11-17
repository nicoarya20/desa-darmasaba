// Geocoding alamat → kandidat koordinat lewat Nominatim (OpenStreetMap), dipanggil dari server agar patuh
// kebijakan pemakaian: User-Agent jelas, maks 1 request/detik global, tanpa autocomplete per ketikan.
import { z } from "zod";
import { createLimiter, type Limiter } from "@/lib/rate-limit";
import pkg from "../../../package.json";

export type GeocodeCandidate = { lat: number; lng: number; label: string };

export type GeocodeOutcome =
  | { status: "ok"; data: GeocodeCandidate[] }
  | { status: "limited"; retryAfterMs: number }
  | { status: "upstream_error" };

export const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
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

export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

export type GeocoderDeps = {
  fetch?: FetchLike;
  now?: () => number;
  timeoutMs?: number;
};

export function createGeocoder(deps: GeocoderDeps = {}) {
  const doFetch = deps.fetch ?? fetch;
  const now = deps.now ?? Date.now;
  const timeoutMs = deps.timeoutMs ?? GEOCODE_TIMEOUT_MS;
  const upstreamLimiter: Limiter = createLimiter(1, GEOCODE_UPSTREAM_INTERVAL_MS);
  const userLimiter: Limiter = createLimiter(GEOCODE_USER_PER_MINUTE, 60_000);
  const cache = new Map<string, { data: GeocodeCandidate[]; expiresAt: number }>();

  function cacheGet(key: string, t: number): GeocodeCandidate[] | null {
    const hit = cache.get(key);
    if (!hit) return null;
    if (hit.expiresAt <= t) {
      cache.delete(key);
      return null;
    }
    return hit.data;
  }

  function cacheSet(key: string, data: GeocodeCandidate[], t: number) {
    cache.delete(key);
    while (cache.size >= GEOCODE_CACHE_MAX) {
      const tertua = cache.keys().next().value;
      if (tertua === undefined) break;
      cache.delete(tertua);
    }
    cache.set(key, { data, expiresAt: t + GEOCODE_CACHE_TTL_MS });
  }

  async function callUpstream(q: string): Promise<GeocodeCandidate[] | null> {
    try {
      const res = await doFetch(buildNominatimUrl(q), {
        headers: { "User-Agent": GEOCODE_USER_AGENT, Accept: "application/json" },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) {
        console.warn(`[geocode] Nominatim HTTP ${res.status}`);
        return null;
      }
      const parsed = parseNominatimResponse(await res.json());
      if (!parsed) console.warn("[geocode] respons Nominatim bukan array");
      return parsed;
    } catch (err) {
      console.warn("[geocode] Nominatim gagal:", err instanceof Error ? err.name : "unknown");
      return null;
    }
  }

  /** Batas per-user dicek dulu (anti-abuse endpoint); cache hit tidak memakai slot throttle upstream global. */
  async function search(q: string, userId: string): Promise<GeocodeOutcome> {
    const t = now();
    const user = userLimiter.check(userId, GEOCODE_USER_PER_MINUTE, t);
    if (!user.allowed) return { status: "limited", retryAfterMs: user.retryAfterMs };

    const key = normalizeGeocodeKey(q);
    const cached = cacheGet(key, t);
    if (cached) return { status: "ok", data: cached };

    const slot = upstreamLimiter.check("nominatim", 1, t);
    if (!slot.allowed) return { status: "limited", retryAfterMs: slot.retryAfterMs };

    const data = await callUpstream(q);
    if (!data) return { status: "upstream_error" };
    cacheSet(key, data, now());
    return { status: "ok", data };
  }

  return { search };
}

export type Geocoder = ReturnType<typeof createGeocoder>;

// globalThis: satu cache + throttle per proses, tidak ter-reset oleh HMR dev.
const globalGeocoder = globalThis as typeof globalThis & { __nominatimGeocoder?: Geocoder };
export const defaultGeocoder: Geocoder = (globalGeocoder.__nominatimGeocoder ??= createGeocoder());
