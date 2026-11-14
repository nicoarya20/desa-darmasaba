import { proxy } from "valtio";
import { toast } from "react-toastify";
import {
  JENNA_CONVERSATION_PAGE,
  type JennaConversationDeleteResponse,
  type JennaConversationDetail,
  type JennaConversationListResponse,
  type JennaStatsResponse,
} from "@/lib/jenna/admin-types";
import { pageAfterDelete } from "../jenna/percakapan/percakapan.logic";
import { developerRequest, errorMessage } from "./developer-api";

const BASE = "/api/developer/jenna";

// Nomor permintaan terakhir per jenis: respons lama (klik halaman beruntun) diabaikan.
const latest = { stats: 0, list: 0, detail: 0 };

/** State Developer Console › Jenna › Percakapan. */
const jennaConversationsState = proxy({
  stats: null as JennaStatsResponse | null,
  statsLoading: false,
  statsError: null as string | null,

  list: null as JennaConversationListResponse | null,
  listLoading: false,
  listError: null as string | null,
  page: 1,
  limit: JENNA_CONVERSATION_PAGE.defaultLimit as number,
  /** Filter "pengunjung yang sama": 8 karakter pertama sessionHash. */
  session: null as string | null,

  detailId: null as string | null,
  detail: null as JennaConversationDetail | null,
  detailLoading: false,
  detailError: null as string | null,
  deleting: false,

  async loadStats() {
    const req = ++latest.stats;
    jennaConversationsState.statsLoading = true;
    jennaConversationsState.statsError = null;
    try {
      const stats = await developerRequest<JennaStatsResponse>(`${BASE}/stats`);
      if (req === latest.stats) jennaConversationsState.stats = stats;
    } catch (err) {
      console.error("Gagal memuat statistik Jenna:", err);
      if (req === latest.stats) jennaConversationsState.statsError = errorMessage(err, "Gagal memuat statistik Jenna.");
    } finally {
      if (req === latest.stats) jennaConversationsState.statsLoading = false;
    }
  },

  async loadList() {
    const req = ++latest.list;
    const { page, limit, session } = jennaConversationsState;
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (session) params.set("session", session);
    jennaConversationsState.listLoading = true;
    jennaConversationsState.listError = null;
    try {
      const list = await developerRequest<JennaConversationListResponse>(`${BASE}/conversations?${params}`);
      if (req === latest.list) jennaConversationsState.list = list;
    } catch (err) {
      console.error("Gagal memuat daftar percakapan Jenna:", err);
      if (req === latest.list) jennaConversationsState.listError = errorMessage(err, "Gagal memuat daftar percakapan.");
    } finally {
      if (req === latest.list) jennaConversationsState.listLoading = false;
    }
  },

  refresh() {
    void jennaConversationsState.loadStats();
    void jennaConversationsState.loadList();
  },

  setPage(page: number) {
    if (page === jennaConversationsState.page) return;
    jennaConversationsState.page = page;
    void jennaConversationsState.loadList();
  },

  setSession(session: string | null) {
    if (session === jennaConversationsState.session) return;
    jennaConversationsState.session = session;
    jennaConversationsState.page = 1;
    void jennaConversationsState.loadList();
  },

  async openDetail(id: string) {
    const req = ++latest.detail;
    jennaConversationsState.detailId = id;
    jennaConversationsState.detail = null;
    jennaConversationsState.detailError = null;
    jennaConversationsState.detailLoading = true;
    try {
      const detail = await developerRequest<JennaConversationDetail>(
        `${BASE}/conversations/${encodeURIComponent(id)}`,
      );
      if (req === latest.detail) jennaConversationsState.detail = detail;
    } catch (err) {
      console.error("Gagal memuat detail percakapan Jenna:", err);
      if (req === latest.detail) jennaConversationsState.detailError = errorMessage(err, "Gagal memuat percakapan.");
    } finally {
      if (req === latest.detail) jennaConversationsState.detailLoading = false;
    }
  },

  closeDetail() {
    latest.detail += 1;
    jennaConversationsState.detailId = null;
    jennaConversationsState.detail = null;
    jennaConversationsState.detailError = null;
    jennaConversationsState.detailLoading = false;
  },

  async deleteConversation(id: string): Promise<boolean> {
    jennaConversationsState.deleting = true;
    try {
      await developerRequest<JennaConversationDeleteResponse>(`${BASE}/conversations/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      toast.success("Percakapan dihapus permanen.");
      jennaConversationsState.closeDetail();
      const { list, page, limit } = jennaConversationsState;
      if (list) jennaConversationsState.page = pageAfterDelete(page, limit, Math.max(0, list.total - 1));
      jennaConversationsState.refresh();
      return true;
    } catch (err) {
      console.error("Gagal menghapus percakapan Jenna:", err);
      toast.error(errorMessage(err, "Gagal menghapus percakapan."));
      return false;
    } finally {
      jennaConversationsState.deleting = false;
    }
  },
});

export default jennaConversationsState;
