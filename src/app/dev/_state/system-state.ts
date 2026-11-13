import { proxy } from "valtio";
import type { SystemOverviewResponse } from "@/lib/jenna/types";
import { developerRequest, errorMessage } from "./developer-api";

/** State Developer Console › Ringkasan Sistem. */
const systemState = proxy({
  data: null as SystemOverviewResponse | null,
  loading: false,
  error: null as string | null,

  async load() {
    systemState.loading = true;
    systemState.error = null;
    try {
      systemState.data = await developerRequest<SystemOverviewResponse>("/api/developer/system");
    } catch (err) {
      console.error("Gagal memuat ringkasan sistem:", err);
      systemState.error = errorMessage(err, "Gagal memuat ringkasan sistem.");
    } finally {
      systemState.loading = false;
    }
  },
});

export default systemState;
