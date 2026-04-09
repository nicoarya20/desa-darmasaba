import ApiFetch from "@/lib/api-fetch";
import type { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

// ========================================= TUJUAN PROGRAM ========================================= //

const templateTujuanProgramForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
});

type TujuanProgramForm = Prisma.TujuanBimbinganBelajarDesaGetPayload<{
  select: {
    id: true;
    judul: true;
    deskripsi: true;
  };
}>;

const stateTujuanProgram = proxy({
  findById: {
    data: null as TujuanProgramForm | null,
    loading: false,
    initialize() {
      stateTujuanProgram.findById.data = {
        id: "",
        judul: "",
        deskripsi: "",
      } as TujuanProgramForm;
    },
    async load(id: string) {
      try {
        stateTujuanProgram.findById.loading = true;
        const res =
          await ApiFetch.api.pendidikan.bimbinganbelajardesa.tujuanprogram[
            "find-by-id"
          ].get({
            query: { id },
          });
        if (res.status === 200) {
          stateTujuanProgram.findById.data = res.data?.data ?? null;
        } else {
          toast.error("Gagal mengambil data tujuan program");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat mengambil data tujuan program");
      } finally {
        stateTujuanProgram.findById.loading = false;
      }
    },
  },

  update: {
    loading: false,
    async save(data: TujuanProgramForm) {
      const cek = templateTujuanProgramForm.safeParse(data);
      if (!cek.success) {
        const errors = cek.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        toast.error(`Form tidak valid: ${errors}`);
        return;
      }

      try {
        stateTujuanProgram.update.loading = true;
        const res =
          await ApiFetch.api.pendidikan.bimbinganbelajardesa.tujuanprogram[
            "update"
          ].post(data);
        if (res.status === 200) {
          toast.success("Data tujuan program berhasil diubah");
          await stateTujuanProgram.findById.load(data.id);
        } else {
          toast.error("Gagal mengubah data tujuan program");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat mengubah data tujuan program");
      } finally {
        stateTujuanProgram.update.loading = false;
      }
    },
  },
});

// ========================================= LOKASI DAN JADWAL ========================================= //

const templateLokasiDanJadwalForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
});

type LokasiDanJadwalForm = Prisma.LokasiJadwalBimbinganBelajarDesaGetPayload<{
  select: {
    id: true;
    judul: true;
    deskripsi: true;
  };
}>;

const lokasiDanJadwalState = proxy({
  findById: {
    data: null as LokasiDanJadwalForm | null,
    loading: false,
    initialize() {
      lokasiDanJadwalState.findById.data = {
        id: "",
        judul: "",
        deskripsi: "",
      } as LokasiDanJadwalForm;
    },
    async load(id: string) {
      try {
        lokasiDanJadwalState.findById.loading = true;
        const res =
          await ApiFetch.api.pendidikan.bimbinganbelajardesa.lokasidanjadwal[
            "find-by-id"
          ].get({
            query: { id },
          });
        if (res.status === 200) {
          lokasiDanJadwalState.findById.data = res.data?.data ?? null;
        } else {
          toast.error("Gagal mengambil data lokasi dan jadwal");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat mengambil data lokasi dan jadwal");
      } finally {
        lokasiDanJadwalState.findById.loading = false;
      }
    },
  },
  update: {
    loading: false,
    async save(data: LokasiDanJadwalForm) {
      const cek = templateLokasiDanJadwalForm.safeParse(data);
      if (!cek.success) {
        const errors = cek.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        toast.error(`Form tidak valid: ${errors}`);
        return;
      }

      try {
        lokasiDanJadwalState.update.loading = true;
        const res =
          await ApiFetch.api.pendidikan.bimbinganbelajardesa.lokasidanjadwal[
            "update"
          ].post(data);
        if (res.status === 200) {
          toast.success("Data lokasi dan jadwal berhasil diubah");
          await lokasiDanJadwalState.findById.load(data.id);
        } else {
          toast.error("Gagal mengubah data lokasi dan jadwal");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat mengubah data lokasi dan jadwal");
      } finally {
        lokasiDanJadwalState.update.loading = false;
      }
    },
  },
});

// ========================================= FASILITAS YANG DISEDIAKAN ========================================= //

const templateFasilitasYangDisediakanForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
});

type FasilitasYangDisediakanForm = Prisma.FasilitasBimbinganBelajarDesaGetPayload<{
  select: {
    id: true;
    judul: true;
    deskripsi: true;
  };
}>;

const fasilitasYangDisediakanState = proxy({
  findById: {
    data: null as FasilitasYangDisediakanForm | null,
    loading: false,
    initialize() {
      fasilitasYangDisediakanState.findById.data = {
        id: "",
        judul: "",
        deskripsi: "",
      } as FasilitasYangDisediakanForm;
    },
    async load(id: string) {
      try {
        fasilitasYangDisediakanState.findById.loading = true;
        const res =
          await ApiFetch.api.pendidikan.bimbinganbelajardesa.fasilitasyangdisediakan[
            "find-by-id"
          ].get({
            query: { id },
          });
        if (res.status === 200) {
          fasilitasYangDisediakanState.findById.data = res.data?.data ?? null;
        } else {
          toast.error("Gagal mengambil data fasilitas yang disediakan");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat mengambil data fasilitas yang disediakan");
      } finally {
        fasilitasYangDisediakanState.findById.loading = false;
      }
    },
  },
  update: {
    loading: false,
    async save(data: FasilitasYangDisediakanForm) {
      const cek = templateFasilitasYangDisediakanForm.safeParse(data);
      if (!cek.success) {
        const errors = cek.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        toast.error(`Form tidak valid: ${errors}`);
        return;
      }

      try {
        fasilitasYangDisediakanState.update.loading = true;
        const res =
          await ApiFetch.api.pendidikan.bimbinganbelajardesa.fasilitasyangdisediakan[
            "update"
          ].post(data);
        if (res.status === 200) {
          toast.success("Data fasilitas yang disediakan berhasil diubah");
          await fasilitasYangDisediakanState.findById.load(data.id);
        } else {
          toast.error("Gagal mengubah data fasilitas yang disediakan");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat mengubah data fasilitas yang disediakan");
      } finally {
        fasilitasYangDisediakanState.update.loading = false;
      }
    },
  },
});

const stateBimbinganBelajarDesa = proxy({
  stateTujuanProgram,
  lokasiDanJadwalState,
  fasilitasYangDisediakanState,
});

export default stateBimbinganBelajarDesa;
