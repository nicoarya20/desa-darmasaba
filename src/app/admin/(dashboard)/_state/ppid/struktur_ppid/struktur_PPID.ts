/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  imageId: z.string().min(1, "Gambar wajib dipilih"),
});

const defaultForm = {
  name: "",
  imageId: "",
};

type StrukturPPIDForm = Prisma.StrukturPPIDGetPayload<{
  select: {
    id: true;
    name: true;
    imageId: true;
    image?: {
      select: {
        link: true;
      };
    };
  };
}>;

const stateStruktur = proxy({
  struktur: {
    data: null as StrukturPPIDForm | null,
    loading: false,
    error: null as string | null,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`/api/ppid/strukturppid/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          this.data = result.data;
          return result.data;
        } else {
          throw new Error(result.message || "Gagal mengambil data struktur");
        }
      } catch (error) {
        const errorMessage = (error as Error).message;
        this.error = errorMessage;
        console.error("Load struktur error:", errorMessage);
        toast.error("Terjadi kesalahan saat mengambil data struktur");
        return null;
      } finally {
        this.loading = false;
      }
    },

    reset() {
      this.data = null;
      this.error = null;
      this.loading = false;
    },
  },

  editStruktur: {
    id: "",
    form: { ...defaultForm },
    loading: false,
    error: null as string | null,
    isReadOnly: false,

    initialize(strukturData: StrukturPPIDForm) {
      this.id = strukturData.id;
      this.isReadOnly = false;
      this.form = {
        name: strukturData.name || "",
        imageId: strukturData.imageId || "",
      };
    },

    updateField(field: keyof typeof defaultForm, value: string) {
      this.form[field] = value;
    },

    async submit() {
      const validation = templateForm.safeParse(this.form);

      if (!validation.success) {
        const errors = validation.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        toast.error(`Form tidak valid: ${errors}`);
        return false;
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`/api/ppid/strukturppid/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.form),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();

        if (result.success) {
          toast.success("Berhasil update struktur");
          await stateStruktur.struktur.load(this.id);
          return true;
        } else {
          throw new Error(result.message || "Gagal update struktur");
        }
      } catch (error) {
        const errorMessage = (error as Error).message;
        this.error = errorMessage;
        console.error("Update struktur error:", errorMessage);
        // Pesan server (mis. 409 "Email sudah dipakai") diteruskan via Error
        toast.error(errorMessage || "Terjadi kesalahan saat update struktur");
        return false;
      } finally {
        this.loading = false;
      }
    },

    reset() {
      this.id = "";
      this.form = { ...defaultForm };
      this.error = null;
      this.loading = false;
      this.isReadOnly = false;
    },
  },

  async loadForEdit(id: string) {
    const strukturData = await this.struktur.load(id);
    if (strukturData) {
      this.editStruktur.initialize(strukturData);
    }
    return strukturData;
  },

  reset() {
    this.struktur.reset();
    this.editStruktur.reset();
  },
});

const templatePosisiOrganisasi = z.object({
  nama: z.string().min(1, "Nama harus diisi"),
  deskripsi: z.string().optional(),
  hierarki: z.number().int().positive("Hierarki harus angka positif"),
});

const posisiOrganisasiDefaultForm = {
  nama: "",
  deskripsi: "",
  hierarki: 0,
};

const posisiOrganisasi = proxy({
  create: {
    form: { ...posisiOrganisasiDefaultForm },
    loading: false,
    async submit() {
      const cek = templatePosisiOrganisasi.safeParse(this.form);
      if (!cek.success) {
        const err = cek.error.issues.map((v) => v.message).join("\n");
        return toast.error(err);
      }

      try {
        this.loading = true;
        const res = await ApiFetch.api.ppid.strukturppid.posisiorganisasi[
          "create"
        ].post(this.form);
        if (res.status === 200) {
          toast.success("Berhasil menambahkan posisi organisasi");
          posisiOrganisasi.findMany.load();
          this.reset();
        } else {
          toast.error(res.data?.message || "Gagal menambahkan posisi");
        }
      } catch (error) {
        console.error("Create error:", error);
        toast.error("Terjadi kesalahan saat menambahkan posisi");
      } finally {
        this.loading = false;
      }
    },
    reset() {
      this.form = { ...posisiOrganisasiDefaultForm };
    },
  },

  findUnique: {
    data: null as Prisma.StrukturOrganisasiPPIDGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/ppid/strukturppid/posisiorganisasi/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          posisiOrganisasi.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch posisiOrganisasi:", res.statusText);
          posisiOrganisasi.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching posisiOrganisasi:", error);
        posisiOrganisasi.findUnique.data = null;
      }
    },
  },

  edit: {
    id: "",
    form: { ...posisiOrganisasiDefaultForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      try {
        const response = await fetch(
          `/api/ppid/strukturppid/posisiorganisasi/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            nama: data.nama,
            deskripsi: data.deskripsi,
            hierarki: data.hierarki,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading posisi organisasi:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templatePosisiOrganisasi.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        this.loading = true;
        const response = await fetch(
          `/api/ppid/strukturppid/posisiorganisasi/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: this.form.nama,
              deskripsi: this.form.deskripsi,
              hierarki: this.form.hierarki,
            }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }
        const result = await response.json();
        if (result.success) {
          toast.success("Berhasil update posisi organisasi");
          await posisiOrganisasi.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(
            result.message || "Gagal mengupdate posisi organisasi"
          );
        }
      } catch (error) {
        console.error("Error updating posisi organisasi:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate posisi organisasi"
        );
        return false;
      } finally {
        this.loading = false;
      }
    },
    reset() {
      this.id = "";
      this.form = { ...posisiOrganisasiDefaultForm };
    },
  },

  findMany: {
    data: [] as Array<{
      id: string;
      nama: string;
      deskripsi: string | null;
      hierarki: number;
    }>,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit?: number, search = "") => {
      const appliedLimit = limit ?? 10;
      posisiOrganisasi.findMany.page = page;
      posisiOrganisasi.findMany.search = search;

      try {
        const query: any = { page, limit: appliedLimit };
        if (search) query.search = search;

        const res = await ApiFetch.api.ppid.strukturppid.posisiorganisasi[
          "find-many"
        ].get({ query });

        if (res.status === 200 && res.data?.success) {
          posisiOrganisasi.findMany.data = res.data.data ?? [];
          posisiOrganisasi.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          posisiOrganisasi.findMany.data = [];
          posisiOrganisasi.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch posisi organisasi paginated:", err);
        posisiOrganisasi.findMany.data = [];
        posisiOrganisasi.findMany.totalPages = 1;
      } finally {
        posisiOrganisasi.findMany.loading = false;
      }
    },
  },
  findManyAll: {
    data: [] as Array<{
      id: string;
      nama: string;
      deskripsi: string | null;
      hierarki: number;
    }>,
    loading: false,
    search: "",
    load: async (search = "") => {
      // Change to arrow function
      posisiOrganisasi.findManyAll.loading = true; // Use the full path to access the property
      posisiOrganisasi.findManyAll.search = search;
      try {
        const query: any = { search };
        if (search) query.search = search;

        const res = await ApiFetch.api.ppid.strukturppid.posisiorganisasi[
          "find-many-all"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          posisiOrganisasi.findManyAll.data = res.data.data || [];

        } else {
          console.error("Failed to load posisiOrganisasi:", res.data?.message);
          posisiOrganisasi.findManyAll.data = [];
        }
      } catch (error) {
        console.error("Error loading posisiOrganisasi:", error);
        posisiOrganisasi.findManyAll.data = [];
      } finally {
        posisiOrganisasi.findManyAll.loading = false;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        posisiOrganisasi.delete.loading = true;

        // Pakai Eden (ApiFetch) — konsisten dgn pola delete yang bekerja
        // (inovasi/program-kreatif). Eden tak set Content-Type json untuk
        // DELETE tanpa body, jadi tak memicu 400 parse-body kosong di Elysia.
        const res = await (
          ApiFetch.api.ppid.strukturppid.posisiorganisasi as any
        )["del"][id].delete();

        if (res.data?.success) {
          toast.success(res.data.message || "Posisi organisasi berhasil dihapus");
          await posisiOrganisasi.findMany.load(); // refresh list
        } else {
          toast.error(res.data?.message || "Gagal menghapus posisi organisasi");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus posisi organisasi");
      } finally {
        posisiOrganisasi.delete.loading = false;
      }
    },
  },
});

const templatePegawai = z.object({
  namaLengkap: z.string().min(1, "Nama wajib diisi"),
  gelarAkademik: z.string().min(1, "Gelar Akademik wajib diisi"),
  imageId: z.string().min(1, "Gambar wajib dipilih"),
  tanggalMasuk: z.string().min(1, "Tanggal masuk wajib diisi"), // ISO format
  email: z.string().email("Email tidak valid").optional(),
  telepon: z.string().min(1, "Telepom wajib diisi"),
  alamat: z.string().min(1, "Alamat wajib diisi"),
  posisiId: z.string().min(1, "Posisi wajib diisi"),
  isActive: z.boolean().default(true),
});

const pegawaiDefaultForm = {
  namaLengkap: "",
  gelarAkademik: "",
  imageId: "",
  tanggalMasuk: "",
  email: "",
  telepon: "",
  alamat: "",
  posisiId: "",
  isActive: true,
};

const pegawai = proxy({
  create: {
    form: { ...pegawaiDefaultForm },
    loading: false,
    async submit() {
      const cek = templatePegawai.safeParse(pegawai.create.form);
      if (!cek.success) {
        const err = cek.error.issues.map((i) => i.message).join("\n");
        toast.error(err);
        return;
      }

      try {
        pegawai.create.loading = true;
        const res = await ApiFetch.api.ppid.strukturppid.pegawai["create"].post(
          pegawai.create.form
        );
        if (res.status === 200) {
          toast.success("Pegawai berhasil ditambahkan");
          await pegawai.findMany.load();
        } else {
          toast.error(res.data?.message ?? "Gagal tambah pegawai");
        }
      } catch (error) {
        console.error("Gagal create:", error);
        toast.error("Terjadi kesalahan saat menambahkan pegawai");
      } finally {
        pegawai.create.loading = false;
      }
    },
  },

  // In struktur-organisasi.ts
  findMany: {
    data: null as
      | Prisma.PegawaiPPIDGetPayload<{
          include: {
            image: true;
            posisi: true;
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      // Change to arrow function
      pegawai.findMany.loading = true; // Use the full path to access the property
      pegawai.findMany.page = page;
      pegawai.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.ppid.strukturppid.pegawai[
          "find-many"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          pegawai.findMany.data = res.data.data || [];
          pegawai.findMany.total = res.data.total || 0;
          pegawai.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error("Failed to load pegawai:", res.data?.message);
          pegawai.findMany.data = [];
          pegawai.findMany.total = 0;
          pegawai.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading pegawai:", error);
        pegawai.findMany.data = [];
        pegawai.findMany.total = 0;
        pegawai.findMany.totalPages = 1;
      } finally {
        pegawai.findMany.loading = false;
      }
    },
  },
  findManyAll: {
    data: null as
      | Prisma.PegawaiPPIDGetPayload<{
          include: {
            image: true;
            posisi: true;
          };
        }>[]
      | null,
    loading: false,
    search: "",
    load: async (search = "") => {
      // Change to arrow function
      pegawai.findManyAll.loading = true; // Use the full path to access the property
      pegawai.findManyAll.search = search;
      try {
        const query: any = { search };
        if (search) query.search = search;

        const res = await ApiFetch.api.ppid.strukturppid.pegawai[
          "find-many-all"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          pegawai.findManyAll.data = res.data.data || [];
        } else {
          console.error("Failed to load pegawai:", res.data?.message);
          pegawai.findManyAll.data = [];
        }
      } catch (error) {
        console.error("Error loading pegawai:", error);
        pegawai.findManyAll.data = [];
      } finally {
        pegawai.findManyAll.loading = false;
      }
    },
  }, 
  findUnique: {
    data: null as
      | (Prisma.PegawaiPPIDGetPayload<{
          include: { posisi: true; image: true };
        }> & { isActive: boolean })
      | null,
    async load(id: string) {
      const res = await fetch(`/api/ppid/strukturppid/pegawai/${id}`);
      if (res.ok) {
        const json = await res.json();
        pegawai.findUnique.data = json.data
          ? {
              ...json.data,
              isActive: json.data.isActive ?? json.data.aktif ?? true, // Fallback ke aktif:true jika tidak ada data
            }
          : null;
      } else {
        pegawai.findUnique.data = null;
      }
    },
  },

  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      try {
        pegawai.delete.loading = true;
        const res = await fetch(`/api/ppid/strukturppid/pegawai/del/${id}`, {
          method: "DELETE",
        });
        const json = await res.json();
        if (res.ok) {
          toast.success(json.message ?? "Berhasil hapus pegawai");
          await pegawai.findMany.load();
        } else {
          toast.error(json.message ?? "Gagal hapus pegawai");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus");
      } finally {
        pegawai.delete.loading = false;
      }
    },
  },

  nonActive: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");
      try {
        pegawai.nonActive.loading = true;
        const res = await fetch(`/api/ppid/strukturppid/pegawai/non-active/${id}`, {
          method: "DELETE", // biasanya nonActive pakai PATCH
        });
        const json = await res.json();
        if (res.ok) {
          toast.success(json.message ?? "Pegawai berhasil dinonaktifkan");
          await pegawai.findMany.load(); // refresh data
        } else {
          toast.error(json.message ?? "Gagal menonaktifkan pegawai");
        }
      } catch (error) {
        console.error("Gagal nonActive:", error);
        toast.error("Terjadi kesalahan saat menonaktifkan pegawai");
      } finally {
        pegawai.nonActive.loading = false;
      }
    },
  },

  edit: {
    id: "",
    form: { ...pegawaiDefaultForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/ppid/strukturppid/pegawai/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            namaLengkap: data.namaLengkap,
            gelarAkademik: data.gelarAkademik,
            imageId: data.imageId,
            tanggalMasuk: data.tanggalMasuk,
            email: data.email,
            telepon: data.telepon,
            alamat: data.alamat,
            posisiId: data.posisiId,
            isActive: data.isActive,
          };
          return data; // Return the loaded data
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading berita:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async submit() {
      const cek = templatePegawai.safeParse(pegawai.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        pegawai.edit.loading = true;

        // Format tanggalMasuk to ISO string if it exists
        const formattedTanggalMasuk = this.form.tanggalMasuk
          ? new Date(this.form.tanggalMasuk).toISOString()
          : undefined;

        const response = await fetch(
          `/api/ppid/strukturppid/pegawai/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: this.id,
              namaLengkap: this.form.namaLengkap,
              gelarAkademik: this.form.gelarAkademik,
              imageId: this.form.imageId || null,
              tanggalMasuk: formattedTanggalMasuk,
              email: this.form.email,
              telepon: this.form.telepon,
              alamat: this.form.alamat,
              posisiId: this.form.posisiId,
              isActive: this.form.isActive,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();

        if (result.success) {
          toast.success("Berhasil update pegawai");
          await pegawai.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal update pegawai");
        }
      } catch (error) {
        console.error("Error updating pegawai:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update pegawai"
        );
        return false;
      } finally {
        pegawai.edit.loading = false;
      }
    },

    reset() {
      pegawai.edit.id = "";
      pegawai.edit.form = { ...pegawaiDefaultForm };
    },
  },
});

const stateStrukturPPID = proxy({
  stateStruktur,
  posisiOrganisasi,
  pegawai,
});

export default stateStrukturPPID;
