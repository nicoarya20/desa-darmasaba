import { proxy } from "valtio";
import { z } from "zod";
import { toast } from "react-toastify";
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";

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
        const res = await ApiFetch.api.ekonomi["struktur-organisasi"]["posisi-organisasi"]["create"].post(
          this.form
        );
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
        const response = await fetch(`/api/ekonomi/struktur-organisasi/posisi-organisasi/${id}`, {
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
          `/api/ekonomi/struktur-organisasi/posisi-organisasi/${this.id}`,
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
    async load() {
      try {
        const res = await ApiFetch.api.ekonomi["struktur-organisasi"]["posisi-organisasi"]["find-many"].get();
        if (res.status === 200) {
          // The API now returns the id field, so we can use it directly
          this.data = res.data?.data ?? [];
        }
      } catch (error) {
        console.error("Find many error:", error);
        this.data = [];
      }
    },
  },

  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        posisiOrganisasi.delete.loading = true;

        const response = await fetch(
          `/api/ekonomi/struktur-organisasi/posisi-organisasi/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Posisi organisasi berhasil dihapus");
          await posisiOrganisasi.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus posisi organisasi");
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
    gelarAkademik: z.string().optional(),
    imageId: z.string().optional(),
    tanggalMasuk: z.string().optional(), // ISO format
    email: z.string().email("Email tidak valid").optional(),
    telepon: z.string().optional(),
    alamat: z.string().optional(),
    posisiId: z.string().min(1, "Posisi wajib diisi"),
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
  };
  
  const pegawai = proxy({
    create: {
      form: { ...pegawaiDefaultForm },
      loading: false,
      async submit() {
        const cek = templatePegawai.safeParse(pegawai.create.form);
        if (!cek.success) {
          const err = cek.error.issues.map(i => i.message).join("\n");
          toast.error(err);
          return;
        }
  
        try {
          pegawai.create.loading = true;
          const res = await ApiFetch.api.ekonomi["struktur-organisasi"]["pegawai"]["create"].post(
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
  
    findMany: {
      data: null as Prisma.PegawaiGetPayload<{ include: { posisi: true } }>[] | null,
      async load() {
        const res = await ApiFetch.api.ekonomi["struktur-organisasi"]["pegawai"]["find-many"].get();
        if (res.status === 200) {
          pegawai.findMany.data = res.data?.data ?? [];
        }
      },
    },
  
    findUnique: {
      data: null as Prisma.PegawaiGetPayload<{ include: { posisi: true } }> | null,
      async load(id: string) {
        const res = await fetch(`/api/ekonomi/strukturorganisasi/pegawai/${id}`);
        if (res.ok) {
          const json = await res.json();
          pegawai.findUnique.data = json.data ?? null;
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
          const res = await fetch(`/api/ekonomi/strukturorganisasi/pegawai/del/${id}`, {
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
  
    edit: {
      id: "",
      form: { ...pegawaiDefaultForm },
      loading: false,
      async load(id: string) {
        const res = await fetch(`/api/organisasi/pegawai/${id}`);
        const json = await res.json();
        if (res.ok && json.success) {
          pegawai.edit.id = json.data.id;
          pegawai.edit.form = {
            namaLengkap: json.data.namaLengkap ?? "",
            gelarAkademik: json.data.gelarAkademik ?? "",
            imageId: json.data.imageId ?? "",
            tanggalMasuk: json.data.tanggalMasuk?.slice(0, 10) ?? "",
            email: json.data.email ?? "",
            telepon: json.data.telepon ?? "",
            alamat: json.data.alamat ?? "",
            posisiId: json.data.posisiId,
          };
        } else {
          toast.error("Gagal memuat data");
        }
      },
  
      async submit() {
        const cek = templatePegawai.safeParse(pegawai.edit.form);
        if (!cek.success) {
          const err = cek.error.issues.map(i => i.message).join("\n");
          toast.error(err);
          return;
        }
  
        try {
          pegawai.edit.loading = true;
          const res = await fetch(`/api/ekonomi/strukturorganisasi/pegawai/${pegawai.edit.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pegawai.edit.form),
          });
          const json = await res.json();
          if (res.ok) {
            toast.success(json.message ?? "Berhasil update pegawai");
            await pegawai.findMany.load();
          } else {
            toast.error(json.message ?? "Gagal update pegawai");
          }
        } catch (error) {
          console.error("Gagal update:", error);
          toast.error("Terjadi kesalahan saat update");
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


// Schema Zod untuk form validasi
const templateHubunganOrganisasiForm = z.object({
  atasanId: z.string().min(1, "Atasan wajib dipilih"),
  bawahanId: z.string().min(1, "Bawahan wajib dipilih"),
  tipe: z.string().optional(),
});

// Default form state
const defaultHubunganOrganisasiForm = {
  atasanId: "",
  bawahanId: "",
  tipe: "",
};

// ====================== STATE ===========================
const hubunganOrganisasi = proxy({
  create: {
    form: { ...defaultHubunganOrganisasiForm },
    loading: false,
    async create() {
      const cek = templateHubunganOrganisasiForm.safeParse(
        hubunganOrganisasi.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}: ${v.message}`)
          .join("\n")}]`;
        return toast.error(err);
      }

      try {
        hubunganOrganisasi.create.loading = true;
        const res = await ApiFetch.api.ekonomi["struktur-organisasi"]["hubungan-organisasi"]["create"].post(hubunganOrganisasi.create.form);

        if (res.status === 200 && res.data?.success) {
          hubunganOrganisasi.findMany.load();
          return toast.success("Berhasil menambahkan hubungan organisasi");
        } else {
          return toast.error(res.data?.message || "Gagal menambahkan data");
        }
      } catch (error) {
        console.error("Create Error:", error);
        toast.error("Terjadi kesalahan saat menambahkan");
      } finally {
        hubunganOrganisasi.create.loading = false;
      }
    },
  },

  findMany: {
    data: null as Array<{
      id: string;
      atasanId: string;
      bawahanId: string;
      tipe?: string | null;
      atasan: {
        id: string;
        namaLengkap: string;
        gelarAkademik: string | null;
        imageId: string | null;
        tanggalMasuk: Date | null;
        email: string | null;
        telepon: string | null;
        alamat: string | null;
        posisiId: string;
        aktif: boolean;
        createdAt: Date;
        updatedAt: Date;
      };
      bawahan: {
        id: string;
        namaLengkap: string;
        gelarAkademik: string | null;
        imageId: string | null;
        tanggalMasuk: Date | null;
        email: string | null;
        telepon: string | null;
        alamat: string | null;
        posisiId: string;
        aktif: boolean;
        createdAt: Date;
        updatedAt: Date;
      };
    }> | null,

    async load() {
      try {
        const res = await ApiFetch.api.ekonomi["struktur-organisasi"]["hubungan-organisasi"]["find-many"].get();

        if (res.status === 200 && res.data?.success) {
          hubunganOrganisasi.findMany.data = res.data.data || [];
        } else {
          hubunganOrganisasi.findMany.data = [];
        }
      } catch (error) {
        console.error("Fetch list error:", error);
        toast.error("Gagal memuat data hubungan organisasi");
        hubunganOrganisasi.findMany.data = [];
      }
    },
  },

  findUnique: {
    data: null as {
      id: string;
      atasanId: string;
      bawahanId: string;
      tipe?: string | null;
      atasan?: {
        id: string;
        namaLengkap: string;
        gelarAkademik: string | null;
        imageId: string;
        tanggalMasuk: Date | null;
        email: string | null;
        telepon: string | null;
        alamat: string | null;
        posisiId: string;
        aktif: boolean;
        createdAt: Date;
        updatedAt: Date;
      };
      bawahan?: {
        id: string;
        namaLengkap: string;
        gelarAkademik: string | null;
        imageId: string;
        tanggalMasuk: Date | null;
        email: string | null;
        telepon: string | null;
        alamat: string | null;
        posisiId: string;
        aktif: boolean;
        createdAt: Date;
        updatedAt: Date;
      };
    } | null,

    async load(id: string) {
      try {
        const res = await fetch(`/api/ekonomi/strukturorganisasi/hubunganorganisasi/${id}`);
        const result = await res.json();

        if (res.ok && result?.success) {
          hubunganOrganisasi.findUnique.data = result.data;
        } else {
          hubunganOrganisasi.findUnique.data = null;
          toast.error(result?.message || "Gagal mengambil data");
        }
      } catch (error) {
        console.error("Find unique error:", error);
        hubunganOrganisasi.findUnique.data = null;
      }
    },
  },

  edit: {
    id: "",
    form: { ...defaultHubunganOrganisasiForm },
    loading: false,

    async load(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        const res = await fetch(`/api/ekonomi/strukturorganisasi/hubunganorganisasi/${id}`);
        const result = await res.json();

        if (res.ok && result?.success) {
          const data = result.data;
          this.id = data.id;
          this.form = {
            atasanId: data.atasanId,
            bawahanId: data.bawahanId,
            tipe: data.tipe || "",
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading:", error);
        toast.error(error instanceof Error ? error.message : "Gagal memuat data");
        return null;
      }
    },

    async update() {
      const cek = templateHubunganOrganisasiForm.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}: ${v.message}`)
          .join("\n")}]`;
        return toast.error(err);
      }

      try {
        this.loading = true;
        const res = await fetch(
          `/api/ekonomi/strukturorganisasi/hubunganorganisasi/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.form),
          }
        );

        const result = await res.json();
        if (res.ok && result.success) {
          await hubunganOrganisasi.findMany.load();
          toast.success("Berhasil mengupdate hubungan organisasi");
          return true;
        } else {
          throw new Error(result?.message || "Gagal mengupdate");
        }
      } catch (error) {
        console.error("Update error:", error);
        toast.error(error instanceof Error ? error.message : "Gagal update");
        return false;
      } finally {
        this.loading = false;
      }
    },

    reset() {
      hubunganOrganisasi.edit.id = "";
      hubunganOrganisasi.edit.form = { ...defaultHubunganOrganisasiForm };
    },
  },

  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        hubunganOrganisasi.delete.loading = true;
        const res = await fetch(`/api/strukturorganisasi/hubungan-organisasi/${id}`, {
          method: "DELETE",
        });

        const result = await res.json();
        if (res.ok && result?.success) {
          toast.success("Hubungan organisasi berhasil dihapus");
          hubunganOrganisasi.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus hubungan organisasi");
        }
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Terjadi kesalahan saat menghapus");
      } finally {
        hubunganOrganisasi.delete.loading = false;
      }
    },
  },
});

  const strukturorganisasiState = proxy({
    posisiOrganisasi,
    pegawai,
    hubunganOrganisasi
  })

export default strukturorganisasiState;
