import { proxy } from "valtio";
import type { AuditLogListResponse } from "@/app/api/[[...slugs]]/_lib/developer/audit-log";
import { type DateRange, dateRangeParams, logListQuery } from "../log/log.logic";
import { developerRequest, errorMessage } from "./developer-api";

// Nomor permintaan terakhir: respons lama (ganti filter/halaman beruntun) diabaikan.
let latest = 0;

/** State Developer Console › Log › Log Audit (read-only). */
const auditLogState = proxy({
  data: null as AuditLogListResponse | null,
  /** ISO string waktu data terakhir dimuat, acuan waktu relatif. */
  loadedAt: null as string | null,
  loading: false,
  error: null as string | null,
  page: 1,
  action: null as string | null,
  q: "",
  range: [null, null] as DateRange,
  selectedId: null as string | null,

  async load() {
    const req = ++latest;
    const { page, action, q, range } = auditLogState;
    const query = logListQuery({ page, action, q, ...dateRangeParams(range) });
    auditLogState.loading = true;
    auditLogState.error = null;
    try {
      const data = await developerRequest<AuditLogListResponse>(`/api/developer/audit-log?${query}`);
      if (req !== latest) return;
      auditLogState.data = data;
      auditLogState.loadedAt = new Date().toISOString();
    } catch (err) {
      console.error("Gagal memuat log audit:", err);
      if (req === latest) auditLogState.error = errorMessage(err, "Gagal memuat log audit.");
    } finally {
      if (req === latest) auditLogState.loading = false;
    }
  },

  setPage(page: number) {
    if (page === auditLogState.page) return;
    auditLogState.page = page;
    void auditLogState.load();
  },

  setFilters(next: { action?: string | null; q?: string; range?: DateRange }) {
    if (next.action !== undefined) auditLogState.action = next.action;
    if (next.q !== undefined) auditLogState.q = next.q;
    if (next.range !== undefined) auditLogState.range = next.range;
    auditLogState.page = 1;
    void auditLogState.load();
  },

  resetFilters() {
    auditLogState.setFilters({ action: null, q: "", range: [null, null] });
  },

  openDetail(id: string) {
    auditLogState.selectedId = id;
  },

  closeDetail() {
    auditLogState.selectedId = null;
  },
});

export default auditLogState;
