import type { ProfilPosyanduData } from "@/lib/posyandu/posyandu-konten.types";
import type { SasaranKlaster } from "@/lib/posyandu/posyandu-konten.validation";
import { getServerMessage } from "@/utils/api-message";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { hapusUnggahanYatim, unggahGambar } from "../../konten-bersama/unggah-gambar";
import { cekFormProfil, payloadDariProfil, type ProfilPosyanduForm } from "./posyandu-profil.form";

const URL_PROFIL = "/api/kesehatan/posyandu/profil";
const TAG = "profil posyandu";

const pesanError = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

/** State admin "Profil & Klaster" posyandu: muat profil + klaster, simpan sekaligus (unggah gambar dulu). */
const profilPosyanduState = proxy({
  data: null as ProfilPosyanduData | null,
  loading: false,
  gagal: false,
  saving: false,

  /** Muat profil & klaster; gagal → `gagal` true + toast. */
  async load() {
    profilPosyanduState.loading = true;
    profilPosyanduState.gagal = false;
    try {
      const res = await fetch(URL_PROFIL);
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(getServerMessage(json) ?? `Gagal memuat profil posyandu (HTTP ${res.status})`);
      profilPosyanduState.data = json.data as ProfilPosyanduData;
    } catch (error) {
      profilPosyanduState.gagal = true;
      toast.error(pesanError(error, "Gagal memuat profil posyandu"));
    } finally {
      profilPosyanduState.loading = false;
    }
  },

  /** Simpan profil + 3 klaster; `gambarBaru` diunggah dulu dan dibersihkan bila penyimpanan gagal. */
  async simpan(form: ProfilPosyanduForm, gambarBaru: Partial<Record<SasaranKlaster, File>>): Promise<boolean> {
    const error = cekFormProfil(form);
    if (error) {
      toast.error(error);
      return false;
    }
    profilPosyanduState.saving = true;
    const terunggah: Partial<Record<SasaranKlaster, string>> = {};
    try {
      for (const [sasaran, file] of Object.entries(gambarBaru) as [SasaranKlaster, File][]) {
        terunggah[sasaran] = await unggahGambar(file);
      }
      const res = await fetch(URL_PROFIL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadDariProfil(form, terunggah)),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(getServerMessage(json) ?? `Gagal menyimpan profil posyandu (HTTP ${res.status})`);
      profilPosyanduState.data = json.data as ProfilPosyanduData;
      toast.success(json.message ?? "Profil posyandu berhasil disimpan");
      return true;
    } catch (err) {
      await hapusUnggahanYatim(Object.values(terunggah), TAG);
      toast.error(pesanError(err, "Gagal menyimpan profil posyandu"));
      return false;
    } finally {
      profilPosyanduState.saving = false;
    }
  },
});

export default profilPosyanduState;
