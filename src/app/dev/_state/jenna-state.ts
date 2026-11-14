import { proxy } from "valtio";
import { toast } from "react-toastify";
import type {
  JennaConfigResponse,
  JennaProviderTestResponse,
  JennaProviderUpdateInput,
  JennaSettingsUpdateInput,
  JennaSlot,
} from "@/lib/jenna/types";
import { developerRequest, errorMessage } from "./developer-api";

const BASE = "/api/developer/jenna";

/** Bagian pengaturan Jenna yang disimpan terpisah (tersebar di sub-halaman /dev/jenna/*). */
export type JennaSection = "status" | "identity" | "limits" | "protocol" | JennaSlot;

/** State Developer Console › Pengaturan Jenna. */
const jennaState = proxy({
  config: null as JennaConfigResponse | null,
  loading: false,
  error: null as string | null,
  /** Naik tiap load sukses; dipakai sebagai `key` form agar draf di-reset ke data server. */
  loadVersion: 0,
  /** Bagian yang sedang disimpan (satu per waktu supaya respons tidak saling menimpa). */
  saving: null as JennaSection | null,
  testingSlot: null as JennaSlot | null,
  /** Bagian yang punya perubahan belum disimpan (peringatan beforeunload & pindah halaman). */
  dirty: {} as Partial<Record<JennaSection, boolean>>,

  async load() {
    jennaState.loading = true;
    jennaState.error = null;
    try {
      jennaState.config = await developerRequest<JennaConfigResponse>(BASE);
      jennaState.dirty = {};
      jennaState.loadVersion += 1;
    } catch (err) {
      console.error("Gagal memuat pengaturan Jenna:", err);
      jennaState.error = errorMessage(err, "Gagal memuat pengaturan Jenna.");
    } finally {
      jennaState.loading = false;
    }
  },

  async saveSettings(
    section: JennaSection,
    input: JennaSettingsUpdateInput,
    successMessage: string,
  ): Promise<JennaConfigResponse | null> {
    return save(section, `${BASE}/settings`, input, successMessage, "Gagal menyimpan pengaturan Jenna.");
  },

  async saveProvider(slot: JennaSlot, input: JennaProviderUpdateInput): Promise<JennaConfigResponse | null> {
    return save(slot, `${BASE}/providers/${slot}`, input, "Provider disimpan.", "Gagal menyimpan provider.");
  },

  /** Hapus API key tersimpan slot ini; Base URL dan model tetap. */
  async clearProviderKey(slot: JennaSlot): Promise<JennaConfigResponse | null> {
    return save(slot, `${BASE}/providers/${slot}/key`, undefined, "API key dihapus.", "Gagal menghapus API key.", "DELETE");
  },

  async testProvider(slot: JennaSlot): Promise<JennaProviderTestResponse | null> {
    jennaState.testingSlot = slot;
    try {
      const result = await developerRequest<JennaProviderTestResponse>(
        `${BASE}/providers/${slot}/test`,
        { method: "POST" },
      );
      const config = jennaState.config;
      if (config) {
        config.providers = config.providers.map((p) => (p.slot === slot ? result.provider : p));
      }
      if (result.ok) toast.success(`Koneksi berhasil (${result.latencyMs} ms).`);
      else toast.error(`Koneksi gagal: ${result.message}`);
      return result;
    } catch (err) {
      console.error("Gagal menguji koneksi provider:", err);
      toast.error(errorMessage(err, "Gagal menguji koneksi provider."));
      return null;
    } finally {
      jennaState.testingSlot = null;
    }
  },

  setDirty(section: JennaSection, dirty: boolean) {
    if (Boolean(jennaState.dirty[section]) !== dirty) jennaState.dirty[section] = dirty;
  },
});

async function save(
  section: JennaSection,
  path: string,
  body: unknown,
  successMessage: string,
  failMessage: string,
  method: "PUT" | "DELETE" = "PUT",
): Promise<JennaConfigResponse | null> {
  jennaState.saving = section;
  try {
    const config = await developerRequest<JennaConfigResponse>(path, { method, body });
    jennaState.config = config;
    toast.success(successMessage);
    return config;
  } catch (err) {
    console.error(failMessage, err);
    toast.error(errorMessage(err, failMessage));
    return null;
  } finally {
    jennaState.saving = null;
  }
}

export default jennaState;
