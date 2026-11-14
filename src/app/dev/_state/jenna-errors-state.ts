import { proxy } from "valtio";
import type { JennaErrorLogDays, JennaErrorLogItem, JennaErrorLogResponse } from "@/lib/jenna/usage-types";
import {
  beginLoad,
  beginLoadMore,
  canLoadMore,
  errorLogQuery,
  initialErrorLog,
  loadFailed,
  loadMoreFailed,
  loadMoreSucceeded,
  loadSucceeded,
} from "../jenna/log-error/log-error.logic";
import { developerRequest, errorMessage } from "./developer-api";

const PATH = "/api/developer/jenna/errors";

// Satu nomor untuk muat awal dan "muat lebih banyak": halaman lanjutan yang tiba setelah rentang diganti diabaikan.
let latest = 0;

/** State Developer Console › Jenna › Log Error (read-only). */
const jennaErrorsState = proxy({
  log: initialErrorLog(),
  /** Giliran yang ditampilkan drawer; dipertahankan saat drawer menutup supaya isinya tidak kosong di tengah animasi. */
  selected: null as JennaErrorLogItem | null,
  detailOpen: false,

  async load(days: JennaErrorLogDays = jennaErrorsState.log.days) {
    const req = ++latest;
    jennaErrorsState.log = beginLoad(jennaErrorsState.log, days);
    try {
      const res = await developerRequest<JennaErrorLogResponse>(`${PATH}?${errorLogQuery(days, null)}`);
      if (req === latest) jennaErrorsState.log = loadSucceeded(jennaErrorsState.log, res);
    } catch (err) {
      console.error("Gagal memuat log error Jenna:", err);
      if (req === latest) {
        jennaErrorsState.log = loadFailed(jennaErrorsState.log, errorMessage(err, "Gagal memuat log error Jenna."));
      }
    }
  },

  setDays(days: JennaErrorLogDays) {
    if (days === jennaErrorsState.log.days) return;
    void jennaErrorsState.load(days);
  },

  async loadMore() {
    const { log } = jennaErrorsState;
    if (!canLoadMore(log)) return;
    const req = ++latest;
    jennaErrorsState.log = beginLoadMore(log);
    try {
      const res = await developerRequest<JennaErrorLogResponse>(`${PATH}?${errorLogQuery(log.days, log.nextCursor)}`);
      if (req === latest) jennaErrorsState.log = loadMoreSucceeded(jennaErrorsState.log, res);
    } catch (err) {
      console.error("Gagal memuat lanjutan log error Jenna:", err);
      if (req === latest) {
        jennaErrorsState.log = loadMoreFailed(
          jennaErrorsState.log,
          errorMessage(err, "Gagal memuat giliran berikutnya."),
        );
      }
    }
  },

  openDetail(item: JennaErrorLogItem) {
    jennaErrorsState.selected = item;
    jennaErrorsState.detailOpen = true;
  },

  closeDetail() {
    jennaErrorsState.detailOpen = false;
  },
});

export default jennaErrorsState;
