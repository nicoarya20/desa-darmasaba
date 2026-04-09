import ApiFetch from "@/lib/api-fetch";
import type { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateTujuanEdukasiForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
});

type TujuanEdukasiForm = Prisma.TujuanEdukasiLingkunganGetPayload<{
  select: {
    id: true;
    judul: true;
    deskripsi: true;
  };
}>;

const stateTujuanEdukasi = proxy({
  findById: {
    data: null as TujuanEdukasiForm | null,
    loading: false,
    initialize() {
      stateTujuanEdukasi.findById.data = {
        id: '',
        judul: '',
        deskripsi: '',
      } as TujuanEdukasiForm;
    },
    async load(id: string) {
      try {
        stateTujuanEdukasi.findById.loading = true;
        const res = await ApiFetch.api.lingkungan.edukasilingkungan.tujuanedukasilingkungan["find-by-id"].get({
          query: { id },
        });
        if (res.status === 200) {
          stateTujuanEdukasi.findById.data = res.data?.data ?? null;
        } else {
          toast.error("Gagal mengambil data tujuan edukasi");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat mengambil data tujuan edukasi");
      } finally {
        stateTujuanEdukasi.findById.loading = false;
      }
    },
  },

  update: {
    loading: false,
    async save(data: TujuanEdukasiForm) {
      const cek = templateTujuanEdukasiForm.safeParse(data);
      if (!cek.success) {
        const errors = cek.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        toast.error(`Form tidak valid: ${errors}`);
        return;
      }

      try {
        stateTujuanEdukasi.update.loading = true;
        const res = await ApiFetch.api.lingkungan.edukasilingkungan.tujuanedukasilingkungan["update"].post(data);
        if (res.status === 200) {
          toast.success("Data tujuan edukasi berhasil diubah");
          await stateTujuanEdukasi.findById.load(data.id);
        } else {
          toast.error("Gagal mengubah data tujuan edukasi");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error("Terjadi kesalahan saat mengubah data tujuan edukasi");
      } finally {
        stateTujuanEdukasi.update.loading = false;
      }
    },
  },
});

const templateMateriEdukasiLingkunganForm = z.object({
    judul: z.string().min(3, "Judul minimal 3 karakter"),
    deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
  });
  
  type MateriEdukasiLingkunganForm = Prisma.MateriEdukasiLingkunganGetPayload<{
    select: {
      id: true;
      judul: true;
      deskripsi: true;
    };
  }>;
  
  const stateMateriEdukasiLingkungan = proxy({
    findById: {
      data: null as MateriEdukasiLingkunganForm | null,
      loading: false,
      initialize() {
        stateMateriEdukasiLingkungan.findById.data = {
          id: '',
          judul: '',
          deskripsi: '',
        } as MateriEdukasiLingkunganForm;
      },
      async load(id: string) {
        try {
          stateMateriEdukasiLingkungan.findById.loading = true;
          const res = await ApiFetch.api.lingkungan.edukasilingkungan.materiedukasilingkungan["find-by-id"].get({
            query: { id },
          });
          if (res.status === 200) {
            stateMateriEdukasiLingkungan.findById.data = res.data?.data ?? null;
          } else {
            toast.error("Gagal mengambil data materi edukasi");
          }
        } catch (error) {
          console.error((error as Error).message);
          toast.error("Terjadi kesalahan saat mengambil data materi edukasi");
        } finally {
          stateMateriEdukasiLingkungan.findById.loading = false;
        }
      },
    },
  
    update: {
      loading: false,
      async save(data: MateriEdukasiLingkunganForm) {
        const cek = templateMateriEdukasiLingkunganForm.safeParse(data);
        if (!cek.success) {
          const errors = cek.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", ");
          toast.error(`Form tidak valid: ${errors}`);
          return;
        }
  
        try {
          stateMateriEdukasiLingkungan.update.loading = true;
          const res = await ApiFetch.api.lingkungan.edukasilingkungan.materiedukasilingkungan["update"].post(data);
          if (res.status === 200) {
            toast.success("Data materi edukasi berhasil diubah");
            await stateMateriEdukasiLingkungan.findById.load(data.id);
          } else {
            toast.error("Gagal mengubah data materi edukasi");
          }
        } catch (error) {
          console.error((error as Error).message);
          toast.error("Terjadi kesalahan saat mengubah data materi edukasi");
        } finally {
          stateMateriEdukasiLingkungan.update.loading = false;
        }
      },
    },
  });

  const templateContohEdukasiLingkunganForm = z.object({
    judul: z.string().min(3, "Judul minimal 3 karakter"),
    deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
  });
  
  type ContohEdukasiLingkunganForm = Prisma.ContohEdukasiLingkunganGetPayload<{
    select: {
      id: true;
      judul: true;
      deskripsi: true;
    };
  }>;
  
  const stateContohEdukasiLingkungan = proxy({
    findById: {
      data: null as ContohEdukasiLingkunganForm | null,
      loading: false,
      initialize() {
        stateContohEdukasiLingkungan.findById.data = {
          id: '',
          judul: '',
          deskripsi: '',
        } as ContohEdukasiLingkunganForm;
      },
      async load(id: string) {
        try {
          stateContohEdukasiLingkungan.findById.loading = true;
          const res = await ApiFetch.api.lingkungan.edukasilingkungan.contohkegiatandesa["find-by-id"].get({
            query: { id },
          });
          if (res.status === 200) {
            stateContohEdukasiLingkungan.findById.data = res.data?.data ?? null;
          } else {
            toast.error("Gagal mengambil data contoh edukasi");
          }
        } catch (error) {
          console.error((error as Error).message);
          toast.error("Terjadi kesalahan saat mengambil data contoh edukasi");
        } finally {
          stateContohEdukasiLingkungan.findById.loading = false;
        }
      },
    },
  
    update: {
      loading: false,
      async save(data: ContohEdukasiLingkunganForm) {
        const cek = templateContohEdukasiLingkunganForm.safeParse(data);
        if (!cek.success) {
          const errors = cek.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", ");
          toast.error(`Form tidak valid: ${errors}`);
          return;
        }
  
        try {
          stateContohEdukasiLingkungan.update.loading = true;
          const res = await ApiFetch.api.lingkungan.edukasilingkungan.contohkegiatandesa["update"].post(data);
          if (res.status === 200) {
            toast.success("Data contoh edukasi berhasil diubah");
            await stateContohEdukasiLingkungan.findById.load(data.id);
          } else {
            toast.error("Gagal mengubah data contoh edukasi");
          }
        } catch (error) {
          console.error((error as Error).message);
          toast.error("Terjadi kesalahan saat mengubah data contoh edukasi");
        } finally {
          stateContohEdukasiLingkungan.update.loading = false;
        }
      },
    },
  });


const stateEdukasiLingkungan = proxy({
    stateTujuanEdukasi,
    stateMateriEdukasiLingkungan,
    stateContohEdukasiLingkungan
})
  

export default stateEdukasiLingkungan;
