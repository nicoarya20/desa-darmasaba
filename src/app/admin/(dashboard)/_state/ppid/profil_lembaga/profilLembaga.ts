import { toast } from "react-toastify";
import { proxy } from "valtio";

/** Endpoint profil lembaga PPID (GET publik, PUT khusus admin). */
const PROFIL_LEMBAGA_API = "/api/ppid/profillembagappid";

/** Profil lembaga PPID dari API; bagian yang belum diisi admin bernilai null. */
export type ProfilLembaga = {
  id: string;
  deskripsi: string | null;
  tujuan: string | null;
  tugasFungsi: string | null;
  gambarAlurId: string | null;
  gambarAlur: { id: string; link: string; realName: string } | null;
};

/** Isian yang dikirim saat simpan; `gambarAlurId` null melepas gambar, undefined membiarkannya. */
export type ProfilLembagaForm = {
  deskripsi: string;
  tujuan: string;
  tugasFungsi: string;
  gambarAlurId?: string | null;
};

const stateProfilLembagaPPID = proxy({
  find: {
    data: null as ProfilLembaga | null,
    loading: false,
    error: null as string | null,

    /** Muat profil lembaga aktif; `data` tetap null bila belum diisi atau gagal (galat dicatat di `error`). */
    async load() {
      this.loading = true;
      this.error = null;
      try {
        const res = await fetch(`${PROFIL_LEMBAGA_API}/find`);
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.message || `HTTP ${res.status}`);
        this.data = result.data ?? null;
        return this.data;
      } catch (err) {
        const msg = (err as Error).message;
        this.error = msg;
        console.error("Gagal memuat profil lembaga PPID:", msg);
        return null;
      } finally {
        this.loading = false;
      }
    },
  },

  save: {
    loading: false,

    /** Simpan (buat atau perbarui) profil lembaga; true bila berhasil, toast menjelaskan hasilnya. */
    async submit(form: ProfilLembagaForm): Promise<boolean> {
      this.loading = true;
      try {
        const res = await fetch(`${PROFIL_LEMBAGA_API}/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const result = await res.json().catch(() => ({}));
        if (!res.ok || !result.success) throw new Error(result.message || `HTTP ${res.status}`);
        stateProfilLembagaPPID.find.data = result.data ?? null;
        toast.success("Profil lembaga berhasil disimpan");
        return true;
      } catch (err) {
        console.error("Gagal menyimpan profil lembaga PPID:", (err as Error).message);
        toast.error("Gagal menyimpan profil lembaga");
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});

export default stateProfilLembagaPPID;
