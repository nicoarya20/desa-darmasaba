/* eslint-disable @typescript-eslint/no-explicit-any */
import { KATEGORI_EVENT_DEFAULT } from "@/lib/agenda-desa";
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  nama: z.string().min(1, "Nama event harus diisi"),
  tanggal: z.string().min(1, "Tanggal harus diisi"),
  lokasi: z.string().min(1, "Lokasi harus diisi"),
  deskripsi: z.string().optional(),
  kategori: z.string().min(1, "Kategori harus dipilih"),
  tanggalSelesai: z.string().optional(),
});

const defaultForm = {
  nama: "",
  tanggal: "",
  lokasi: "",
  deskripsi: "",
  kategori: KATEGORI_EVENT_DEFAULT as string,
  tanggalSelesai: "",
};

/** Filter opsional list agenda (publik); nilai kosong/undefined tidak dikirim. */
export type AgendaFilter = {
  kategori?: string;
  tahun?: number;
  bulan?: number;
  mendatang?: boolean;
};

/** Pesan error bila tanggal selesai (YYYY-MM-DD) lebih awal dari tanggal mulai; null bila valid. */
function errorRentangTanggal(form: { tanggal: string; tanggalSelesai?: string }): string | null {
  if (form.tanggalSelesai && form.tanggalSelesai < form.tanggal) {
    return "Tanggal selesai tidak boleh sebelum tanggal mulai";
  }
  return null;
}

let findManyRequestId = 0; // abaikan respons lama bila filter berganti cepat

const eventBudayaState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(eventBudayaState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      const errTanggal = errorRentangTanggal(eventBudayaState.create.form);
      if (errTanggal) return toast.error(errTanggal);

      try {
        eventBudayaState.create.loading = true;
        const res = await ApiFetch.api.desa["eventbudaya"]["create"].post(
          eventBudayaState.create.form
        );
        if (res.status === 200 && res.data?.success) {
          eventBudayaState.findMany.load();
          toast.success("Event budaya berhasil disimpan!");
          eventBudayaState.create.form = { ...defaultForm };
          return true;
        }
        toast.error(res.data?.message || "Gagal menyimpan event budaya");
        return false;
      } catch (error) {
        console.error(error);
        toast.error("Gagal menyimpan event budaya");
        return false;
      } finally {
        eventBudayaState.create.loading = false;
      }
    },
  },

  findMany: {
    data: null as Prisma.EventBudayaGetPayload<object>[] | null,
    page: 1,
    totalPages: 1,
    total: 0,
    /** Jumlah agenda per bulan (indeks 0 = Januari); null bila filter tahun tidak dipakai. */
    ringkasanBulan: null as number[] | null,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "", filter: AgendaFilter = {}) => {
      const requestId = ++findManyRequestId;
      eventBudayaState.findMany.loading = true;
      eventBudayaState.findMany.page = page;
      eventBudayaState.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        if (filter.kategori) query.kategori = filter.kategori;
        if (filter.tahun) query.tahun = filter.tahun;
        if (filter.bulan) query.bulan = filter.bulan;
        if (filter.mendatang) query.mendatang = true;

        const res = await ApiFetch.api.desa["eventbudaya"]["find-many"].get({ query });
        if (requestId !== findManyRequestId) return;

        if (res.status === 200 && res.data?.success) {
          eventBudayaState.findMany.data = res.data.data ?? [];
          eventBudayaState.findMany.total = res.data.total ?? 0;
          eventBudayaState.findMany.totalPages = res.data.totalPages ?? 1;
          eventBudayaState.findMany.ringkasanBulan =
            "ringkasanBulan" in res.data ? (res.data.ringkasanBulan as number[]) : null;
        } else {
          eventBudayaState.findMany.data = [];
          eventBudayaState.findMany.total = 0;
          eventBudayaState.findMany.totalPages = 1;
          eventBudayaState.findMany.ringkasanBulan = null;
        }
      } catch (error) {
        if (requestId !== findManyRequestId) return;
        console.error("Error loading event budaya:", error);
        eventBudayaState.findMany.data = [];
      } finally {
        if (requestId === findManyRequestId) eventBudayaState.findMany.loading = false;
      }
    },
  },

  findUnique: {
    data: null as Prisma.EventBudayaGetPayload<object> | null,
    loading: false,
    async load(id: string) {
      if (!id) return;
      this.loading = true;
      try {
        const res = await fetch(`/api/desa/eventbudaya/${id}`);
        if (res.ok) {
          const result = await res.json();
          eventBudayaState.findUnique.data = result.data ?? null;
        }
      } catch (error) {
        console.error("Error fetching event budaya:", error);
      } finally {
        this.loading = false;
      }
    },
  },

  edit: {
    id: "",
    form: { ...defaultForm },
    original: { ...defaultForm }, // snapshot data awal untuk tombol Batal
    loading: false,

    async load(id: string) {
      if (!id) return;
      try {
        eventBudayaState.edit.loading = true;
        const res = await fetch(`/api/desa/eventbudaya/${id}`);
        const result = await res.json();
        if (result?.success) {
          const data = result.data;
          eventBudayaState.edit.id = data.id;
          const loadedForm = {
            nama: data.nama,
            tanggal: data.tanggal
              ? new Date(data.tanggal).toISOString().split("T")[0]
              : "",
            lokasi: data.lokasi,
            deskripsi: data.deskripsi ?? "",
            kategori: data.kategori ?? KATEGORI_EVENT_DEFAULT,
            tanggalSelesai: data.tanggalSelesai
              ? new Date(data.tanggalSelesai).toISOString().split("T")[0]
              : "",
          };
          eventBudayaState.edit.form = { ...loadedForm };
          eventBudayaState.edit.original = { ...loadedForm };
        }
      } catch (error) {
        console.error("Error loading event budaya for edit:", error);
      } finally {
        eventBudayaState.edit.loading = false;
      }
    },

    async save() {
      const cek = templateForm.safeParse(eventBudayaState.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }
      const errTanggal = errorRentangTanggal(eventBudayaState.edit.form);
      if (errTanggal) {
        toast.error(errTanggal);
        return false;
      }

      try {
        eventBudayaState.edit.loading = true;
        const res = await fetch(
          `/api/desa/eventbudaya/${eventBudayaState.edit.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eventBudayaState.edit.form),
          }
        );
        const result = await res.json();
        if (result.success) {
          toast.success("Event budaya berhasil diupdate");
          eventBudayaState.findMany.load();
          return true;
        }
        toast.error(result.message);
        return false;
      } catch (error) {
        console.error(error);
        return false;
      } finally {
        eventBudayaState.edit.loading = false;
      }
    },

    // kembalikan form ke data awal (dipakai tombol Batal), tetap di halaman edit
    restore() {
      eventBudayaState.edit.form = { ...eventBudayaState.edit.original };
      toast.info("Form dikembalikan ke data awal");
    },

    reset() {
      eventBudayaState.edit.id = "";
      eventBudayaState.edit.form = { ...defaultForm };
      eventBudayaState.edit.original = { ...defaultForm };
    },
  },

  findUpcoming: {
    data: null as Prisma.EventBudayaGetPayload<object>[] | null,
    loading: false,
    async load() {
      eventBudayaState.findUpcoming.loading = true;
      try {
        const res = await fetch("/api/desa/eventbudaya/find-upcoming");
        const result = await res.json();
        if (result?.success) {
          eventBudayaState.findUpcoming.data = result.data ?? [];
        } else {
          eventBudayaState.findUpcoming.data = [];
        }
      } catch (error) {
        console.error("Error loading upcoming events:", error);
        eventBudayaState.findUpcoming.data = [];
      } finally {
        eventBudayaState.findUpcoming.loading = false;
      }
    },
  },

  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      try {
        eventBudayaState.delete.loading = true;
        const res = await fetch(`/api/desa/eventbudaya/del/${id}`, {
          method: "DELETE",
        });
        const result = await res.json();
        if (res.ok && result?.success) {
          toast.success(result.message || "Event budaya berhasil dihapus");
          await eventBudayaState.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus event budaya");
        }
      } catch (error) {
        console.error(error);
        toast.error("Gagal menghapus event budaya");
      } finally {
        eventBudayaState.delete.loading = false;
      }
    },
  },
});

export default eventBudayaState;
