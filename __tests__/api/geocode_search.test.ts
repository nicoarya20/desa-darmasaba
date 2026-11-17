// @vitest-environment node
// GET /api/geocode/search & /reverse: geocoding admin lewat Nominatim (fetch di-mock, tanpa jaringan nyata).
import { describe, it, expect, vi, beforeEach } from "vitest";
import Elysia from "elysia";

const { requireAuthMock } = vi.hoisted(() => ({ requireAuthMock: vi.fn() }));
vi.mock("@/lib/api-auth", () => ({ requireAuth: () => requireAuthMock() }));

import {
  buildGeocodeQuery,
  buildNominatimUrl,
  buildNominatimReverseUrl,
  createGeocoder,
  normalizeGeocodeKey,
  parseNominatimResponse,
  parseNominatimReverse,
  reverseCacheKey,
  GEOCODE_USER_AGENT,
  GEOCODE_UPSTREAM_INTERVAL_MS,
  GEOCODE_USER_PER_MINUTE,
  type FetchLike,
} from "@/lib/geocode/nominatim";
import {
  createGeocodeRoutes,
  PESAN_GEOCODE_BUKAN_ADMIN,
  PESAN_GEOCODE_KOORDINAT,
  PESAN_GEOCODE_UPSTREAM,
} from "@/app/api/[[...slugs]]/_lib/geocode";

const item = (lat: string, lon: string, display_name: string) => ({ lat, lon, display_name });
const okJson = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });

const unauthorized = () => ({
  authenticated: false,
  response: new Response(JSON.stringify({ success: false, message: "Unauthorized - Silakan login terlebih dahulu" }), { status: 401 }),
});
const asRole = (roleId: string, id = "u-rekaan") => ({ authenticated: true, user: { id, roleId, isActive: true } }); // test-only

function setup(opts: { fetchImpl?: FetchLike; timeoutMs?: number } = {}) {
  let clock = 1_000_000;
  const fetchMock = vi.fn<FetchLike>(opts.fetchImpl ?? (async () => okJson([item("-8.58", "115.2", "Balai Desa Darmasaba")])));
  const geocoder = createGeocoder({ fetch: fetchMock, now: () => clock, timeoutMs: opts.timeoutMs });
  const app = new Elysia({ prefix: "/api" }).use(createGeocodeRoutes(geocoder));
  const call = (q?: string) =>
    app.handle(new Request(`http://localhost/api/geocode/search${q === undefined ? "" : `?q=${encodeURIComponent(q)}`}`));
  const callReverse = (query: string) => app.handle(new Request(`http://localhost/api/geocode/reverse${query}`));
  return { fetchMock, geocoder, call, callReverse, advance: (ms: number) => (clock += ms) };
}

beforeEach(() => {
  requireAuthMock.mockReset();
  requireAuthMock.mockResolvedValue(asRole("1"));
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("buildGeocodeQuery", () => {
  it("menambah konteks wilayah bila belum ada", () => {
    expect(buildGeocodeQuery("  Jl. Raya No. 1 ")).toBe("Jl. Raya No. 1, Darmasaba, Badung, Bali");
  });
  it.each(["Balai Desa DARMASABA", "Pasar Badung", "Denpasar, bali"])("tidak menambah konteks: %s", (q) => {
    expect(buildGeocodeQuery(q)).toBe(q);
  });
  it("URL berisi parameter Nominatim yang diwajibkan", () => {
    const url = new URL(buildNominatimUrl("Balai Desa"));
    expect(url.origin + url.pathname).toBe("https://nominatim.openstreetmap.org/search");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      q: "Balai Desa, Darmasaba, Badung, Bali",
      format: "jsonv2",
      limit: "5",
      countrycodes: "id",
      "accept-language": "id",
      viewbox: "115.15,-8.52,115.24,-8.62",
      bounded: "0",
    });
  });
  it("normalisasi kunci cache: lowercase + spasi dirapatkan", () => {
    expect(normalizeGeocodeKey("  Balai   DESA ")).toBe("balai desa");
  });
});

describe("parseNominatimResponse", () => {
  it("membuang item tak valid dan memetakan lat/lon/display_name", () => {
    const hasil = parseNominatimResponse([
      item("-8.58", "115.2", "Balai Desa"),
      item("abc", "115.2", "lat bukan angka"),
      item("95", "115.2", "lat di luar rentang"),
      item("-8.5", "200", "lon di luar rentang"),
      { lat: "-8.5", lon: "115.2" },
      item("-8.5", "115.2", "   "),
      "bukan objek",
    ]);
    expect(hasil).toEqual([{ lat: -8.58, lng: 115.2, label: "Balai Desa" }]);
  });
  it("maksimal 5 kandidat dan label dipotong 200 karakter", () => {
    const panjang = "x".repeat(300);
    const hasil = parseNominatimResponse(Array.from({ length: 8 }, () => item("-8.5", "115.2", panjang)));
    expect(hasil).toHaveLength(5);
    expect(hasil![0].label).toHaveLength(200);
  });
  it("respons bukan array → null", () => {
    expect(parseNominatimResponse({ error: "x" })).toBeNull();
  });
});

describe("createGeocoder", () => {
  it("mengirim User-Agent generik + Accept JSON", async () => {
    const { fetchMock, geocoder } = setup();
    await geocoder.search("Balai Desa", "u1");
    const init = fetchMock.mock.calls[0][1];
    expect(init.headers).toEqual({ "User-Agent": GEOCODE_USER_AGENT, Accept: "application/json" });
    expect(GEOCODE_USER_AGENT).toMatch(/^desa-darmasaba-admin\/\d+\.\d+\.\d+ \(geocoding\)$/);
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("cache hit (query ter-normalisasi) tidak memanggil fetch lagi dan tidak memakai throttle", async () => {
    const { fetchMock, geocoder } = setup();
    const a = await geocoder.search("Balai Desa", "u1");
    const b = await geocoder.search("  balai   DESA ", "u1");
    expect(a).toEqual(b);
    expect(b.status).toBe("ok");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throttle global: query baru < 1,1 detik → dibatasi; setelah jeda boleh lagi", async () => {
    const { fetchMock, geocoder, advance } = setup();
    await geocoder.search("Balai Desa", "u1");
    advance(500);
    const dibatasi = await geocoder.search("Pasar Desa", "u2");
    expect(dibatasi).toEqual({ status: "limited", retryAfterMs: GEOCODE_UPSTREAM_INTERVAL_MS - 500 });
    advance(GEOCODE_UPSTREAM_INTERVAL_MS);
    expect((await geocoder.search("Pasar Desa", "u2")).status).toBe("ok");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("batas per-user", async () => {
    const { geocoder } = setup();
    for (let i = 0; i < GEOCODE_USER_PER_MINUTE; i++) await geocoder.search("Balai Desa", "u1");
    expect((await geocoder.search("Balai Desa", "u1")).status).toBe("limited");
    expect((await geocoder.search("Balai Desa", "u2")).status).toBe("ok");
  });

  it("HTTP 500 → upstream_error dan tidak di-cache", async () => {
    const { fetchMock, geocoder, advance } = setup({ fetchImpl: async () => new Response("boom", { status: 500 }) });
    expect(await geocoder.search("Balai Desa", "u1")).toEqual({ status: "upstream_error" });
    advance(GEOCODE_UPSTREAM_INTERVAL_MS);
    await geocoder.search("Balai Desa", "u1");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("timeout → upstream_error", async () => {
    const hang: FetchLike = (_url, init) =>
      new Promise((_, reject) => init.signal?.addEventListener("abort", () => reject(init.signal!.reason)));
    const { geocoder } = setup({ fetchImpl: hang, timeoutMs: 20 });
    expect(await geocoder.search("Balai Desa", "u1")).toEqual({ status: "upstream_error" });
  });

  it("respons tak valid (bukan JSON / bukan array) → upstream_error", async () => {
    const { geocoder } = setup({ fetchImpl: async () => new Response("<html>", { status: 200 }) });
    expect(await geocoder.search("Balai Desa", "u1")).toEqual({ status: "upstream_error" });
    const kedua = setup({ fetchImpl: async () => okJson({ error: "x" }) });
    expect(await kedua.geocoder.search("Balai Desa", "u1")).toEqual({ status: "upstream_error" });
  });
});

describe("GET /api/geocode/search", () => {
  it("401 tanpa sesi", async () => {
    requireAuthMock.mockResolvedValue(unauthorized());
    const { call, fetchMock } = setup();
    const res = await call("Balai Desa");
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ success: false, message: "Unauthorized - Silakan login terlebih dahulu" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("403 bukan admin (role 5)", async () => {
    requireAuthMock.mockResolvedValue(asRole("5"));
    const { call, fetchMock } = setup();
    const res = await call("Balai Desa");
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ success: false, message: PESAN_GEOCODE_BUKAN_ADMIN });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([undefined, "", "  ab  ", "x".repeat(201)])("400 untuk q tidak valid: %j", async (q) => {
    const { call, fetchMock } = setup();
    const res = await call(q);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(typeof body.message).toBe("string");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("200 dengan kandidat (q di-trim)", async () => {
    const { call, fetchMock } = setup();
    const res = await call("   Balai Desa   ");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, data: [{ lat: -8.58, lng: 115.2, label: "Balai Desa Darmasaba" }] });
    expect(new URL(fetchMock.mock.calls[0][0]).searchParams.get("q")).toBe("Balai Desa, Darmasaba, Badung, Bali");
  });

  it("200 dengan data kosong bukan error", async () => {
    const { call } = setup({ fetchImpl: async () => okJson([]) });
    const res = await call("Tempat Antah Berantah");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, data: [] });
  });

  it("429 + Retry-After (detik, bulat ke atas)", async () => {
    const { call, advance } = setup();
    await call("Balai Desa");
    advance(50);
    const res = await call("Pasar Desa");
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("2");
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(typeof body.message).toBe("string");
  });

  it("502 tanpa membocorkan detail upstream", async () => {
    const { call } = setup({ fetchImpl: async () => new Response("rahasia upstream", { status: 503 }) });
    const res = await call("Balai Desa");
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ success: false, message: PESAN_GEOCODE_UPSTREAM });
  });
});

// Contoh nyata Nominatim untuk lat -8.564811, lon 115.203235.
const reverseJalan = {
  category: "highway",
  type: "residential",
  name: "Jalan Tugu Pahlawan",
  display_name: "Jalan Tugu Pahlawan, Sibangkaja, Abiansemal, Badung, Bali, 80352, Indonesia",
  address: {
    road: "Jalan Tugu Pahlawan",
    village: "Sibangkaja",
    town: "Abiansemal",
    region: "Badung",
    state: "Bali",
    postcode: "80352",
    country: "Indonesia",
    country_code: "id",
  },
};
const reversePoi = {
  category: "amenity",
  name: "Kantor Desa Darmasaba",
  display_name: "Kantor Desa Darmasaba, Jalan Raya Darmasaba, Darmasaba, Abiansemal, Badung, Bali, Indonesia",
  address: { amenity: "Kantor Desa Darmasaba", road: "Jalan Raya Darmasaba", village: "Darmasaba", town: "Abiansemal" },
};
const reverseFetch = (body: unknown = reverseJalan) => async () => okJson(body);

describe("parseNominatimReverse", () => {
  it("menyusun alamat dari address (contoh nyata, jalan → nama null)", () => {
    expect(parseNominatimReverse(reverseJalan)).toEqual({
      ok: true,
      data: { alamat: "Jalan Tugu Pahlawan, Sibangkaja, Abiansemal", nama: null },
    });
  });

  it("road + house_number, dusun, dan duplikat berurutan dibuang", () => {
    const hasil = parseNominatimReverse({
      category: "building",
      address: { road: "Jalan Raya", house_number: "12", hamlet: "Banjar Gede", village: "Darmasaba", city: "Darmasaba" },
    });
    expect(hasil).toEqual({ ok: true, data: { alamat: "Jalan Raya No. 12, Banjar Gede, Darmasaba", nama: null } });
  });

  it("prioritas kunci: neighbourhood/suburb/city_district bila yang utama tidak ada", () => {
    const hasil = parseNominatimReverse({
      address: { neighbourhood: "Lingkungan A", quarter: "Q", suburb: "Kelurahan B", city_district: "Kec C", city: "Kota D" },
    });
    expect(hasil).toEqual({ ok: true, data: { alamat: "Lingkungan A, Kelurahan B, Kec C", nama: null } });
  });

  it("address kosong → 3 bagian pertama display_name", () => {
    const hasil = parseNominatimReverse({ display_name: "Satu, Dua , Tiga, Empat, Lima", address: { country: "Indonesia" } });
    expect(hasil).toEqual({ ok: true, data: { alamat: "Satu, Dua, Tiga", nama: null } });
  });

  it("alamat & nama dipotong 200 karakter", () => {
    const panjang = "x".repeat(300);
    const hasil = parseNominatimReverse({ category: "amenity", name: panjang, address: { road: panjang } });
    expect(hasil.ok && hasil.data?.alamat).toHaveLength(200);
    const kedua = parseNominatimReverse({ category: "amenity", name: panjang, address: { village: "Darmasaba" } });
    expect(kedua.ok && kedua.data?.nama).toHaveLength(200);
  });

  it("nama hanya untuk POI", () => {
    expect(parseNominatimReverse(reversePoi)).toEqual({
      ok: true,
      data: { alamat: "Jalan Raya Darmasaba, Darmasaba, Abiansemal", nama: "Kantor Desa Darmasaba" },
    });
  });

  it.each(["highway", "place", "boundary", "landuse", "natural", "waterway", "railway"])(
    "kategori %s → nama null",
    (category) => {
      const hasil = parseNominatimReverse({ ...reversePoi, category });
      expect(hasil.ok && hasil.data?.nama).toBeNull();
    },
  );

  it("nama sama dengan road → null walau kategori POI", () => {
    const hasil = parseNominatimReverse({ ...reverseJalan, category: "amenity" });
    expect(hasil.ok && hasil.data?.nama).toBeNull();
  });

  it("respons { error } → data null (tidak ditemukan)", () => {
    expect(parseNominatimReverse({ error: "Unable to geocode" })).toEqual({ ok: true, data: null });
  });

  it.each([[[]], ["teks"], [null], [{}], [{ address: {} }], [{ display_name: "  " }]])(
    "bentuk tak dikenal → ok:false: %j",
    (json) => {
      expect(parseNominatimReverse(json)).toEqual({ ok: false });
    },
  );
});

describe("createGeocoder().reverse", () => {
  it("URL reverse berisi parameter Nominatim + header sama dengan search", async () => {
    const { fetchMock, geocoder } = setup({ fetchImpl: reverseFetch() });
    await geocoder.reverse(-8.564811, 115.203235, "u1");
    const [rawUrl, init] = fetchMock.mock.calls[0];
    expect(rawUrl).toBe(buildNominatimReverseUrl(-8.564811, 115.203235));
    const url = new URL(rawUrl);
    expect(url.origin + url.pathname).toBe("https://nominatim.openstreetmap.org/reverse");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      format: "jsonv2",
      lat: "-8.564811",
      lon: "115.203235",
      zoom: "18",
      addressdetails: "1",
      "accept-language": "id",
    });
    expect(init.headers).toEqual({ "User-Agent": GEOCODE_USER_AGENT, Accept: "application/json" });
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("cache hit untuk koordinat beda < 1 m (5 desimal)", async () => {
    const { fetchMock, geocoder } = setup({ fetchImpl: reverseFetch() });
    const a = await geocoder.reverse(-8.564811, 115.203232, "u1");
    const b = await geocoder.reverse(-8.5648114, 115.2032324, "u1");
    expect(b).toEqual(a);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(reverseCacheKey(-8.5648114, 115.2032324)).toBe("-8.56481,115.20323");
  });

  it("hasil tidak ditemukan (null) juga di-cache", async () => {
    const { fetchMock, geocoder } = setup({ fetchImpl: reverseFetch({ error: "Unable to geocode" }) });
    expect(await geocoder.reverse(-9, 116, "u1")).toEqual({ status: "ok", data: null });
    expect(await geocoder.reverse(-9, 116, "u1")).toEqual({ status: "ok", data: null });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throttle global dipakai bersama search", async () => {
    const { fetchMock, geocoder, advance } = setup({
      fetchImpl: async (url) => (url.includes("/reverse") ? okJson(reverseJalan) : okJson([item("-8.58", "115.2", "Balai")])),
    });
    await geocoder.search("Balai Desa", "u1");
    advance(500);
    expect(await geocoder.reverse(-8.56, 115.2, "u2")).toEqual({
      status: "limited",
      retryAfterMs: GEOCODE_UPSTREAM_INTERVAL_MS - 500,
    });
    advance(GEOCODE_UPSTREAM_INTERVAL_MS);
    expect((await geocoder.reverse(-8.56, 115.2, "u2")).status).toBe("ok");
    advance(500);
    expect((await geocoder.search("Pasar Desa", "u1")).status).toBe("limited");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("batas per-user dipakai bersama search", async () => {
    const { geocoder } = setup({ fetchImpl: reverseFetch() });
    for (let i = 0; i < GEOCODE_USER_PER_MINUTE; i++) await geocoder.reverse(-8.56, 115.2, "u1");
    expect((await geocoder.search("Balai Desa", "u1")).status).toBe("limited");
    expect((await geocoder.reverse(-8.56, 115.2, "u1")).status).toBe("limited");
    expect((await geocoder.reverse(-8.56, 115.2, "u2")).status).toBe("ok");
  });

  it("HTTP error / bentuk tak dikenal → upstream_error dan tidak di-cache", async () => {
    const { fetchMock, geocoder, advance } = setup({ fetchImpl: async () => new Response("boom", { status: 500 }) });
    expect(await geocoder.reverse(-8.56, 115.2, "u1")).toEqual({ status: "upstream_error" });
    advance(GEOCODE_UPSTREAM_INTERVAL_MS);
    await geocoder.reverse(-8.56, 115.2, "u1");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const kedua = setup({ fetchImpl: reverseFetch([]) });
    expect(await kedua.geocoder.reverse(-8.56, 115.2, "u1")).toEqual({ status: "upstream_error" });
  });
});

describe("GET /api/geocode/reverse", () => {
  it("401 tanpa sesi", async () => {
    requireAuthMock.mockResolvedValue(unauthorized());
    const { callReverse, fetchMock } = setup({ fetchImpl: reverseFetch() });
    const res = await callReverse("?lat=-8.56&lng=115.2");
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ success: false, message: "Unauthorized - Silakan login terlebih dahulu" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("403 bukan admin (role 5)", async () => {
    requireAuthMock.mockResolvedValue(asRole("5"));
    const { callReverse, fetchMock } = setup({ fetchImpl: reverseFetch() });
    const res = await callReverse("?lat=-8.56&lng=115.2");
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ success: false, message: PESAN_GEOCODE_BUKAN_ADMIN });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(["", "?lat=-8.56", "?lng=115.2", "?lat=&lng=115.2", "?lat=abc&lng=115.2", "?lat=91&lng=115.2", "?lat=-8.56&lng=-181", "?lat=Infinity&lng=115.2", "?lat=NaN&lng=1"])(
    "400 untuk koordinat tidak valid: %s",
    async (query) => {
      const { callReverse, fetchMock } = setup({ fetchImpl: reverseFetch() });
      const res = await callReverse(query);
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ success: false, message: PESAN_GEOCODE_KOORDINAT });
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("200 dengan alamat (batas rentang inklusif diterima)", async () => {
    const { callReverse, fetchMock } = setup({ fetchImpl: reverseFetch() });
    const res = await callReverse("?lat=-8.564811&lng=115.203235");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      data: { alamat: "Jalan Tugu Pahlawan, Sibangkaja, Abiansemal", nama: null },
    });
    expect(new URL(fetchMock.mock.calls[0][0]).searchParams.get("lon")).toBe("115.203235");
    const batas = setup({ fetchImpl: reverseFetch() });
    expect((await batas.callReverse("?lat=-90&lng=180")).status).toBe(200);
  });

  it("200 dengan data null bila tidak ditemukan", async () => {
    const { callReverse } = setup({ fetchImpl: reverseFetch({ error: "Unable to geocode" }) });
    const res = await callReverse("?lat=-9&lng=116");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, data: null });
  });

  it("429 + Retry-After (detik, bulat ke atas), juga setelah /search", async () => {
    const { call, callReverse, advance } = setup({
      fetchImpl: async (url) => (url.includes("/reverse") ? okJson(reverseJalan) : okJson([item("-8.58", "115.2", "Balai")])),
    });
    await call("Balai Desa");
    advance(50);
    const res = await callReverse("?lat=-8.56&lng=115.2");
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("2");
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(typeof body.message).toBe("string");
  });

  it("502 tanpa membocorkan detail upstream", async () => {
    const { callReverse } = setup({ fetchImpl: async () => new Response("rahasia upstream", { status: 503 }) });
    const res = await callReverse("?lat=-8.56&lng=115.2");
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ success: false, message: PESAN_GEOCODE_UPSTREAM });
  });
});
