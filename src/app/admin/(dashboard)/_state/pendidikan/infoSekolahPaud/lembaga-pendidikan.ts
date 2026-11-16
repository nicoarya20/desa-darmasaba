/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import type { LembagaDetail } from "@/lib/lembaga-pendidikan/lembaga.types";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { SORT_BY_JENJANG } from "@/lib/jenjang-pendidikan-urutan";
import { createDetailEntriState } from "../../konten-bersama/detail-entri.state";
import { kirimEntri } from "../../konten-bersama/kirim-entri";
import { hapusUnggahanYatim, unggahGambar } from "../../konten-bersama/unggah-gambar";
import { LEMBAGA_API } from "./lembaga.anak.state";
import { cekFormLembaga, payloadDariForm, type LembagaForm, type LembagaFotoBaru } from "./lembaga.form";

const pesanError = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

/** Unggah foto baru (bila ada) lalu kembalikan id foto yang dipakai; id unggahan dicatat di `unggahan`. */
async function idFoto(baru: File | null, tersimpan: string | null, unggahan: string[]): Promise<string | null> {
  if (!baru) return tersimpan;
  const id = await unggahGambar(baru);
  unggahan.push(id);
  return id;
}

/**
 * State Lembaga Pendidikan (Info Sekolah): daftar berpaginasi, detail lengkap (admin), simpan form (dengan
 * unggah foto sekolah & bagan), hapus (soft delete).
 */
const lembagaPendidikan = proxy({
  findMany: {
    data: null as Array<
      Prisma.LembagaGetPayload<{
        include: {
          jenjangPendidikan: true;
        };
        // Sama dengan LEMBAGA_LIST_OMIT di API (find-many ringan).
        omit: { deskripsi: true; mediaSosial: true };
      }> & {
        siswa?: [];
        pengajar?: [];
      }
    > | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    /** `sortByJenjang` → baris urut PAUD, TK, SD, SMP, SMA, SMK (dipakai halaman publik; admin tetap urut nama). */
    load: async (page = 1, limit = 10, search = "", jenjangPendidikan = "", sortByJenjang = false) => {
      lembagaPendidikan.findMany.loading = true;
      lembagaPendidikan.findMany.page = page;
      lembagaPendidikan.findMany.search = search;

      try {
        const query: any = {
          page,
          limit,
          ...(search && { search }),
          ...(jenjangPendidikan && { jenjangPendidikanId: jenjangPendidikan }),
          ...(sortByJenjang && { sort: SORT_BY_JENJANG }),
        };

        const res = await ApiFetch.api.pendidikan.infosekolahpaud.lembagapendidikan["find-many"].get({ query });

        if (res.status === 200 && res.data?.success) {
          const data = Array.isArray(res.data.data) ? res.data.data : [];
          const total = typeof res.data.total === "number" ? res.data.total : 0;
          const totalPages = typeof res.data.totalPages === "number" ? res.data.totalPages : 1;

          lembagaPendidikan.findMany.data = data;
          lembagaPendidikan.findMany.total = total;
          lembagaPendidikan.findMany.totalPages = totalPages;
        } else {
          console.error(
            "Failed to load lembaga pendidikan:",
            res.data?.message || "No error message provided"
          );
          throw new Error(res.data?.message || "Failed to load lembaga pendidikan");
        }
      } catch (error) {
        console.error("Error loading lembaga pendidikan:", error);
        lembagaPendidikan.findMany.data = [];
        lembagaPendidikan.findMany.total = 0;
        lembagaPendidikan.findMany.totalPages = 1;
      } finally {
        lembagaPendidikan.findMany.loading = false;
      }
    },
  },
  findUnique: createDetailEntriState<LembagaDetail>({ url: (id) => `${LEMBAGA_API}/${encodeURIComponent(id)}`, tag: "lembaga" }),

  saving: false,
  /**
   * Simpan form (id null = tambah). Foto baru diunggah dulu dan dibersihkan bila simpan gagal.
   * Mengembalikan id lembaga, atau null bila gagal (pesan sudah ditampilkan).
   */
  async simpan(id: string | null, form: LembagaForm, fotoBaru: LembagaFotoBaru): Promise<string | null> {
    const salah = cekFormLembaga(form);
    if (salah) {
      toast.error(salah);
      return null;
    }
    lembagaPendidikan.saving = true;
    const unggahan: string[] = [];
    try {
      const foto = {
        fotoSekolahId: await idFoto(fotoBaru.fotoSekolah, form.fotoSekolahId, unggahan),
        fotoBaganStrukturId: await idFoto(fotoBaru.bagan, form.fotoBaganStrukturId, unggahan),
      };
      const savedId = await kirimEntri(LEMBAGA_API, id, payloadDariForm(form, foto), "lembaga pendidikan");
      toast.success(id ? "Lembaga pendidikan berhasil diperbarui" : "Lembaga pendidikan berhasil ditambahkan");
      return savedId;
    } catch (error) {
      console.error(`[lembaga] Gagal menyimpan lembaga ${id ?? "baru"}:`, error);
      await hapusUnggahanYatim(unggahan, "foto lembaga");
      toast.error(pesanError(error, "Gagal menyimpan lembaga pendidikan"));
      return null;
    } finally {
      lembagaPendidikan.saving = false;
    }
  },

  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        lembagaPendidikan.delete.loading = true;

        // Pakai Eden (ApiFetch) — konsisten dgn findMany di file ini. Eden
        // tak set Content-Type json untuk DELETE tanpa body (hindari 400 parse
        // Elysia) dan content-type aware saat parse respons (hindari SyntaxError
        // bila body non-JSON).
        const res = await (
          ApiFetch.api.pendidikan.infosekolahpaud.lembagapendidikan as any
        )["del"][id].delete();

        if (res.data?.success) {
          toast.success(
            res.data.message || "lembaga pendidikan berhasil dihapus"
          );
          await lembagaPendidikan.findMany.load();
        } else {
          // Eden menaruh body respons non-2xx (mis. 400 FK-block) di res.error.value,
          // bukan res.data — baca keduanya agar pesan spesifik backend tetap tampil.
          const msg =
            res.data?.message || (res.error?.value as any)?.message;
          toast.error(msg || "Gagal menghapus lembaga pendidikan");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus lembaga pendidikan");
      } finally {
        lembagaPendidikan.delete.loading = false;
      }
    },
  },
});

export default lembagaPendidikan;
