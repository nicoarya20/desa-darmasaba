import { proxy } from "valtio";
import type { LoginLogListResponse } from "@/app/api/[[...slugs]]/_lib/developer/login-log";
import type { LoginLogResult } from "@/lib/login-log";
import { type DateRange, dateRangeParams, logListQuery } from "../log/log.logic";
import { developerRequest, errorMessage } from "./developer-api";

// Nomor permintaan terakhir: respons lama (ganti filter/halaman beruntun) diabaikan.
let latest = 0;

/** State Developer Console › Log › Log Login (read-only). */
const loginLogState = proxy({
  data: null as LoginLogListResponse | null,
  /** ISO string waktu data terakhir dimuat, acuan waktu relatif. */
  loadedAt: null as string | null,
  loading: false,
  error: null as string | null,
  page: 1,
  result: null as LoginLogResult | null,
  q: "",
  range: [null, null] as DateRange,

  async load() {
    const req = ++latest;
    const { page, result, q, range } = loginLogState;
    const query = logListQuery({ page, result, q, ...dateRangeParams(range) });
    loginLogState.loading = true;
    loginLogState.error = null;
    try {
      const data = await developerRequest<LoginLogListResponse>(`/api/developer/login-log?${query}`);
      if (req !== latest) return;
      loginLogState.data = data;
      loginLogState.loadedAt = new Date().toISOString();
    } catch (err) {
      console.error("Gagal memuat log login:", err);
      if (req === latest) loginLogState.error = errorMessage(err, "Gagal memuat log login.");
    } finally {
      if (req === latest) loginLogState.loading = false;
    }
  },

  setPage(page: number) {
    if (page === loginLogState.page) return;
    loginLogState.page = page;
    void loginLogState.load();
  },

  setFilters(next: { result?: LoginLogResult | null; q?: string; range?: DateRange }) {
    if (next.result !== undefined) loginLogState.result = next.result;
    if (next.q !== undefined) loginLogState.q = next.q;
    if (next.range !== undefined) loginLogState.range = next.range;
    loginLogState.page = 1;
    void loginLogState.load();
  },

  resetFilters() {
    loginLogState.setFilters({ result: null, q: "", range: [null, null] });
  },
});

export default loginLogState;
