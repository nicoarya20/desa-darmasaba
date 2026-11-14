import { proxy } from "valtio";
import type { JennaUsageResponse } from "@/lib/jenna/usage-types";
import { developerRequest, errorMessage } from "./developer-api";

// Nomor permintaan terakhir: respons lama (klik "Perbarui" beruntun) diabaikan.
let latest = 0;

/** State Developer Console › Jenna › Penggunaan (read-only). */
const jennaUsageState = proxy({
  data: null as JennaUsageResponse | null,
  loading: false,
  error: null as string | null,

  async load() {
    const req = ++latest;
    jennaUsageState.loading = true;
    jennaUsageState.error = null;
    try {
      const data = await developerRequest<JennaUsageResponse>("/api/developer/jenna/usage");
      if (req === latest) jennaUsageState.data = data;
    } catch (err) {
      console.error("Gagal memuat penggunaan Jenna:", err);
      if (req === latest) jennaUsageState.error = errorMessage(err, "Gagal memuat penggunaan Jenna.");
    } finally {
      if (req === latest) jennaUsageState.loading = false;
    }
  },
});

export default jennaUsageState;
