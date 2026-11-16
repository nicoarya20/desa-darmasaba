import { proxy } from "valtio";
import type { JennaKnowledgeResponse } from "@/lib/jenna/knowledge-types";
import { developerRequest, errorMessage } from "./developer-api";

// Nomor permintaan terakhir: respons lama (muat ulang beruntun) diabaikan.
let latest = 0;

/** State Developer Console › Jenna › Pengetahuan (read-only). */
const jennaKnowledgeState = proxy({
  data: null as JennaKnowledgeResponse | null,
  loading: false,
  error: null as string | null,

  async load() {
    const req = ++latest;
    jennaKnowledgeState.loading = true;
    jennaKnowledgeState.error = null;
    try {
      const data = await developerRequest<JennaKnowledgeResponse>("/api/developer/jenna/knowledge");
      if (req === latest) jennaKnowledgeState.data = data;
    } catch (err) {
      console.error("Gagal memuat pengetahuan Jenna:", err);
      if (req === latest) jennaKnowledgeState.error = errorMessage(err, "Gagal memuat pengetahuan Jenna.");
    } finally {
      if (req === latest) jennaKnowledgeState.loading = false;
    }
  },
});

export default jennaKnowledgeState;
