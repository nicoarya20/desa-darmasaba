import ApiFetch from "@/lib/api-fetch";
import { getServerMessage } from "@/utils/api-message";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";
import { uploadBumdesImage } from "./bumdes-image";

export type ProfilBumdesData = {
  id: string;
  nama: string;
  deskripsi: string;
  alamat: string | null;
  kontak: string | null;
  tahunBerdiri: number | null;
  imageId: string | null;
  image: { id: string; name: string; link: string } | null;
};

const templateProfil = z.object({
  nama: z.string().trim().min(1, "Nama BUMDes wajib diisi"),
  deskripsi: z.string().trim().min(1, "Deskripsi wajib diisi"),
});

const profilDefaultForm = {
  nama: "",
  deskripsi: "",
  alamat: "",
  kontak: "",
  tahunBerdiri: null as number | null,
};

/** State profil BUMDes (singleton): `load` dipakai halaman publik + admin, `save` hanya admin. */
const profilBumdes = proxy({
  data: null as ProfilBumdesData | null,
  loading: false,
  loaded: false,
  async load() {
    profilBumdes.loading = true;
    try {
      const res = await ApiFetch.api.ekonomi.bumdes.profil.get();
      profilBumdes.data = res.status === 200 ? ((res.data?.data as ProfilBumdesData | null) ?? null) : null;
    } catch {
      // Gagal jaringan diperlakukan sebagai profil kosong agar halaman tidak menggantung di loading.
      profilBumdes.data = null;
    } finally {
      profilBumdes.loading = false;
      profilBumdes.loaded = true;
    }
  },

  form: { ...profilDefaultForm },
  /** Salin data tersimpan ke form edit (kosongkan form bila profil belum pernah diisi). */
  fillForm() {
    const d = profilBumdes.data;
    profilBumdes.form = d
      ? {
          nama: d.nama,
          deskripsi: d.deskripsi,
          alamat: d.alamat ?? "",
          kontak: d.kontak ?? "",
          tahunBerdiri: d.tahunBerdiri,
        }
      : { ...profilDefaultForm };
  },

  saving: false,
  /** Simpan profil (upsert); `newImage` opsional diunggah dulu. Mengembalikan true bila berhasil. */
  async save(newImage: File | null): Promise<boolean> {
    const cek = templateProfil.safeParse(profilBumdes.form);
    if (!cek.success) {
      toast.error(cek.error.issues.map((i) => i.message).join("\n"));
      return false;
    }

    profilBumdes.saving = true;
    try {
      const imageId = newImage ? await uploadBumdesImage(newImage) : (profilBumdes.data?.imageId ?? null);
      const { alamat, kontak, tahunBerdiri } = profilBumdes.form;
      const res = await ApiFetch.api.ekonomi.bumdes.profil.put({
        nama: cek.data.nama,
        deskripsi: cek.data.deskripsi,
        alamat,
        kontak,
        tahunBerdiri,
        imageId,
      });
      if (res.status !== 200) {
        toast.error(getServerMessage(res) ?? "Gagal menyimpan profil BUMDes");
        return false;
      }
      toast.success("Profil BUMDes berhasil disimpan");
      await profilBumdes.load();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan profil BUMDes");
      return false;
    } finally {
      profilBumdes.saving = false;
    }
  },
});

export default profilBumdes;
