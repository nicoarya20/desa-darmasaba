import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateFilosofiTriHitaForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
});

type FilosofiTriHitaForm = Prisma.FilosofiTriHitaGetPayload<{
  select: {
    id: true;
    judul: true;
    deskripsi: true;
  };
}>;

const stateFilosofiTriHita = proxy({
  findById: {
    data: null as FilosofiTriHitaForm | null,
    loading: false,
    initialize() {
      stateFilosofiTriHita.findById.data = {
        id: "",
        judul: "",
        deskripsi: "",
      } as FilosofiTriHitaForm;
    },
    async load(id: string) {
      try {
        stateFilosofiTriHita.findById.loading = true;
        const res =
          await ApiFetch.api.lingkungan.konservasiadatbali.filosofitrihitakarana[
            "find-by-id"
          ].get({
            query: { id },
          });
        if (res.status === 200) {
          stateFilosofiTriHita.findById.data = res.data?.data ?? null;
        } else {
          toast.error("Gagal mengambil data filosofi tri hita karana");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error(
          "Terjadi kesalahan saat mengambil data filosofi tri hita karana"
        );
      } finally {
        stateFilosofiTriHita.findById.loading = false;
      }
    },
  },

  update: {
    loading: false,
    async save(data: FilosofiTriHitaForm) {
      const cek = templateFilosofiTriHitaForm.safeParse(data);
      if (!cek.success) {
        const errors = cek.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        toast.error(`Form tidak valid: ${errors}`);
        return;
      }

      try {
        stateFilosofiTriHita.update.loading = true;
        const res =
          await ApiFetch.api.lingkungan.konservasiadatbali.filosofitrihitakarana[
            "update"
          ].post(data);
        if (res.status === 200) {
          toast.success("Data filosofi tri hita karana berhasil diubah");
          await stateFilosofiTriHita.findById.load(data.id);
        } else {
          toast.error("Gagal mengubah data filosofi tri hita karana");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error(
          "Terjadi kesalahan saat mengubah data filosofi tri hita karana"
        );
      } finally {
        stateFilosofiTriHita.update.loading = false;
      }
    },
  },
});

const templateNilaiKonservasiAdatForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
});

type NilaiKonservasiAdatForm = Prisma.NilaiKonservasiAdatGetPayload<{
  select: {
    id: true;
    judul: true;
    deskripsi: true;
  };
}>;

const stateNilaiKonservasiAdat = proxy({
  findById: {
    data: null as NilaiKonservasiAdatForm | null,
    loading: false,
    initialize() {
      stateNilaiKonservasiAdat.findById.data = {
        id: "",
        judul: "",
        deskripsi: "",
      } as NilaiKonservasiAdatForm;
    },
    async load(id: string) {
      try {
        stateNilaiKonservasiAdat.findById.loading = true;
        const res =
          await ApiFetch.api.lingkungan.konservasiadatbali.nilaikonservasiadatbali[
            "find-by-id"
          ].get({
            query: { id },
          });
        if (res.status === 200) {
          stateNilaiKonservasiAdat.findById.data = res.data?.data ?? null;
        } else {
          toast.error("Gagal mengambil data nilai konservasi adat");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error(
          "Terjadi kesalahan saat mengambil data nilai konservasi adat"
        );
      } finally {
        stateNilaiKonservasiAdat.findById.loading = false;
      }
    },
  },

  update: {
    loading: false,
    async save(data: NilaiKonservasiAdatForm) {
      const cek = templateNilaiKonservasiAdatForm.safeParse(data);
      if (!cek.success) {
        const errors = cek.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        toast.error(`Form tidak valid: ${errors}`);
        return;
      }

      try {
        stateNilaiKonservasiAdat.update.loading = true;
        const res =
          await ApiFetch.api.lingkungan.konservasiadatbali.nilaikonservasiadatbali[
            "update"
          ].post(data);
        if (res.status === 200) {
          toast.success("Data nilai konservasi adat berhasil diubah");
          await stateNilaiKonservasiAdat.findById.load(data.id);
        } else {
          toast.error("Gagal mengubah data nilai konservasi adat");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error(
          "Terjadi kesalahan saat mengubah data nilai konservasi adat"
        );
      } finally {
        stateNilaiKonservasiAdat.update.loading = false;
      }
    },
  },
});

const templateBentukKonservasiBerdasarkanAdatForm = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
});

type BentukKonservasiBerdasarkanAdatForm =
  Prisma.BentukKonservasiBerdasarkanAdatGetPayload<{
    select: {
      id: true;
      judul: true;
      deskripsi: true;
    };
  }>;

const stateBentukKonservasiBerdasarkanAdat = proxy({
  findById: {
    data: null as BentukKonservasiBerdasarkanAdatForm | null,
    loading: false,
    initialize() {
      stateBentukKonservasiBerdasarkanAdat.findById.data = {
        id: "",
        judul: "",
        deskripsi: "",
      } as BentukKonservasiBerdasarkanAdatForm;
    },
    async load(id: string) {
      try {
        stateBentukKonservasiBerdasarkanAdat.findById.loading = true;
        const res =
          await ApiFetch.api.lingkungan.konservasiadatbali.bentukkonservasiberdasarkanadat[
            "find-by-id"
          ].get({
            query: { id },
          });
        if (res.status === 200) {
          stateBentukKonservasiBerdasarkanAdat.findById.data =
            res.data?.data ?? null;
        } else {
          toast.error(
            "Gagal mengambil data bentuk konservasi berdasarkan adat"
          );
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error(
          "Terjadi kesalahan saat mengambil data bentuk konservasi berdasarkan adat"
        );
      } finally {
        stateBentukKonservasiBerdasarkanAdat.findById.loading = false;
      }
    },
  },

  update: {
    loading: false,
    async save(data: BentukKonservasiBerdasarkanAdatForm) {
      const cek = templateBentukKonservasiBerdasarkanAdatForm.safeParse(data);
      if (!cek.success) {
        const errors = cek.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        toast.error(`Form tidak valid: ${errors}`);
        return;
      }

      try {
        stateBentukKonservasiBerdasarkanAdat.update.loading = true;
        const res =
          await ApiFetch.api.lingkungan.konservasiadatbali.bentukkonservasiberdasarkanadat[
            "update"
          ].post(data);
        if (res.status === 200) {
          toast.success(
            "Data bentuk konservasi berdasarkan adat berhasil diubah"
          );
          await stateBentukKonservasiBerdasarkanAdat.findById.load(data.id);
        } else {
          toast.error("Gagal mengubah data bentuk konservasi berdasarkan adat");
        }
      } catch (error) {
        console.error((error as Error).message);
        toast.error(
          "Terjadi kesalahan saat mengubah data bentuk konservasi berdasarkan adat"
        );
      } finally {
        stateBentukKonservasiBerdasarkanAdat.update.loading = false;
      }
    },
  },
});

const stateKonservasiAdatBali = proxy({
  stateFilosofiTriHita,
  stateNilaiKonservasiAdat,
  stateBentukKonservasiBerdasarkanAdat,
});

export default stateKonservasiAdatBali;
