/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  nama: z.string().min(1, "Nama minimal 1 karakter"),
  jarakKeDesa: z.string().min(1, "Jarak minimal 1 karakter"),
  alamat: z.string().min(1, "Alamat minimal 1 karakter"),
  nomorTelepon: z.string().min(1, "Nomor Telepon minimal 1 karakter"),
  jamOperasional: z.string().min(1, "Jam Operasional minimal 1 karakter"),
  embedMapUrl: z.string().min(1, "Embed Map Url minimal 1 karakter"),
  namaTempatMaps: z.string().min(1, "Nama Tempat Maps minimal 1 karakter"),
  alamatMaps: z.string().min(1, "Alamat Maps minimal 1 karakter"),
  linkPetunjukArah: z.string().min(1, "Link Petunjuk Arah minimal 1 karakter"),
  layananPolsekId: z.array(z.string()).min(1, "Pilih minimal 1 layanan polsek"),
});

const defaultForm = {
  nama: "",
  jarakKeDesa: "",
  alamat: "",
  nomorTelepon: "",
  jamOperasional: "",
  embedMapUrl: "",
  namaTempatMaps: "",
  alamatMaps: "",
  linkPetunjukArah: "",
  layananPolsekId: [] as string[],
};

const polsekTerdekatState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(polsekTerdekatState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        polsekTerdekatState.create.loading = true;
        const res = await ApiFetch.api.keamanan.polsekterdekat["create"].post(
          polsekTerdekatState.create.form
        );
        if (res.status === 200) {
          polsekTerdekatState.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        polsekTerdekatState.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.PolsekTerdekatGetPayload<{
          include: {
            layananPolsek: true;
            LayananToPolsek: {
              include: {
                layanan: true;
              }
            }
          };
        }>[]
      | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      polsekTerdekatState.findMany.loading = true; // ✅ Akses langsung via nama path
      polsekTerdekatState.findMany.page = page;
      polsekTerdekatState.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.keamanan.polsekterdekat["find-many"].get(
          { query }
        );

        if (res.status === 200 && res.data?.success) {
          polsekTerdekatState.findMany.data = res.data.data ?? [];
          polsekTerdekatState.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          polsekTerdekatState.findMany.data = [];
          polsekTerdekatState.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch polsek terdekat paginated:", err);
        polsekTerdekatState.findMany.data = [];
        polsekTerdekatState.findMany.totalPages = 1;
      } finally {
        polsekTerdekatState.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.PolsekTerdekatGetPayload<{
      include: { 
        layananPolsek: true;
        LayananToPolsek: {
          include: {
            layanan: true;
          }
        }
       };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/keamanan/polsekterdekat/${id}`);
        if (res.ok) {
          const data = await res.json();
          polsekTerdekatState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          polsekTerdekatState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Gagal fetch detail polsek terdekat:", error);
        polsekTerdekatState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        polsekTerdekatState.delete.loading = true;

        const response = await fetch(`/api/keamanan/polsekterdekat/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Polsek terdekat berhasil dihapus");
          await polsekTerdekatState.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus polsek terdekat");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus polsek terdekat");
      } finally {
        polsekTerdekatState.delete.loading = false;
      }
    },
  },
  edit: {
    id: "",
    form: { ...defaultForm },
    loading: false,

    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/keamanan/polsekterdekat/${id}`, {
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
            jarakKeDesa: data.jarakKeDesa,
            alamat: data.alamat,
            nomorTelepon: data.nomorTelepon,
            jamOperasional: data.jamOperasional,
            embedMapUrl: data.embedMapUrl,
            namaTempatMaps: data.namaTempatMaps,
            alamatMaps: data.alamatMaps,
            linkPetunjukArah: data.linkPetunjukArah,
            // API findUnique mengembalikan relasi LayananToPolsek, bukan field layananPolsekId
            layananPolsekId:
              data.LayananToPolsek?.map((l: any) => l.layananId) ?? [],
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading polsek terdekat:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async update() {
      const cek = templateForm.safeParse(polsekTerdekatState.edit.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        polsekTerdekatState.edit.loading = true;
        const response = await fetch(
          `/api/keamanan/polsekterdekat/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: this.form.nama,
              jarakKeDesa: this.form.jarakKeDesa,
              alamat: this.form.alamat,
              nomorTelepon: this.form.nomorTelepon,
              jamOperasional: this.form.jamOperasional,
              embedMapUrl: this.form.embedMapUrl,
              namaTempatMaps: this.form.namaTempatMaps,
              alamatMaps: this.form.alamatMaps,
              linkPetunjukArah: this.form.linkPetunjukArah,
              layananPolsekId: this.form.layananPolsekId,
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
          toast.success("Berhasil update polsek terdekat");
          await polsekTerdekatState.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal mengupdate polsek terdekat");
        }
      } catch (error) {
        console.error("Error updating polsek terdekat:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengupdate polsek terdekat"
        );
        return false;
      } finally {
        polsekTerdekatState.edit.loading = false;
      }
    },
    reset() {
      polsekTerdekatState.edit.id = "";
      polsekTerdekatState.edit.form = { ...defaultForm };
    },
  },
  findFirst: {
    data: null as Prisma.PolsekTerdekatGetPayload<{
      include: {
        layananPolsek: true;
      };
    }> | null,
    loading: false,
    load: async () => {
      // Changed to arrow function
      polsekTerdekatState.findFirst.loading = true;
      try {
        const res = await ApiFetch.api.keamanan.polsekterdekat[
          "find-first"
        ].get();
        if (res.status === 200 && res.data?.success) {
          polsekTerdekatState.findFirst.data = res.data.data || null;
        } else {
          polsekTerdekatState.findFirst.data = null;
        }
      } catch (err) {
        console.error("Gagal fetch polsek terdekat terbaru:", err);
      } finally {
        polsekTerdekatState.findFirst.loading = false;
      }
    },
  },
});

const templateFormLayananPolsek = z.object({
  nama: z.string().min(1, "Nama harus diisi"),
});

const defaultFormLayananPolsek = {
  nama: "",
};

const layananPolsek = proxy({
  create: {
    form: { ...defaultFormLayananPolsek },
    loading: false,
    async create() {
      const cek = templateFormLayananPolsek.safeParse(
        layananPolsek.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        layananPolsek.create.loading = true;
        const res = await ApiFetch.api.keamanan["layananpolsek"][
          "create"
        ].post(layananPolsek.create.form);
        if (res.status === 200) {
          layananPolsek.findManyAll.load();
          return toast.success("Data Kategori Berita Berhasil Dibuat");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log(error);
        return toast.error("failed create");
      } finally {
        layananPolsek.create.loading = false;
      }
    },
  },
  findMany: {
      data: null as
        | Prisma.LayananPolsekGetPayload<{
            omit: {
              isActive: true;
            };
          }>[]
        | null,
      page: 1,
      totalPages: 1,
      loading: false,
      search: "",
     load: async (page = 1, limit = 10, search = "") => {
        layananPolsek.findMany.loading = true; // ✅ Akses langsung via nama path
        layananPolsek.findMany.page = page;
        layananPolsek.findMany.search = search;
    
        try {
          const query: any = { page, limit };
          if (search) query.search = search;
      
          const res = await ApiFetch.api.keamanan["layananpolsek"]["findMany"].get({ query });
      
          if (res.status === 200 && res.data?.success) {
            layananPolsek.findMany.data = res.data.data ?? [];
            layananPolsek.findMany.totalPages = res.data.totalPages ?? 1;
          } else {
            layananPolsek.findMany.data = [];
            layananPolsek.findMany.totalPages = 1;
          }
        } catch (err) {
          console.error("Gagal fetch layanan polsek paginated:", err);
          layananPolsek.findMany.data = [];
          layananPolsek.findMany.totalPages = 1;
        } finally {
          layananPolsek.findMany.loading = false;
        }
      },
    },
  findManyAll: {
    data: [] as Prisma.LayananPolsekGetPayload<{ omit: { isActive: true } }>[],
    loading: false,

    async load() {
      this.loading = true;
      try {
        const res = await ApiFetch.api.keamanan["layananpolsek"][
          "findManyAll"
        ].get();

        if (res.status === 200 && res.data?.success) {
          this.data = (res.data.data ?? []).map((item: any) => ({
            id: String(item.id),
            nama: String(item.nama || ""),
            createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
            updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
            deletedAt: item.deletedAt ? new Date(item.deletedAt) : null,
          }));
        } else {
          this.data = [];
        }
      } catch (error) {
        console.error("Gagal fetch layanan polsek:", error);
        this.data = [];
      } finally {
        this.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.LayananPolsekGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(`/api/keamanan/layananpolsek/${id}`);
        if (res.ok) {
          const data = await res.json();
          layananPolsek.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          layananPolsek.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        layananPolsek.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async delete(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        layananPolsek.delete.loading = true;

        const response = await fetch(`/api/keamanan/layananpolsek/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(
            result.message || "Data layanan polsek berhasil dihapus"
          );
          await layananPolsek.findManyAll.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus Data layanan polsek");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus Data layanan polsek");
      } finally {
        layananPolsek.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultFormLayananPolsek },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(`/api/keamanan/layananpolsek/${id}`, {
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
          };
          return data; // Return the loaded data
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading layanan polsek:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },
    async update() {
      const cek = templateFormLayananPolsek.safeParse(
        layananPolsek.update.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        layananPolsek.update.loading = true;

        const response = await fetch(
          `/api/keamanan/layananpolsek/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: this.form.nama,
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
          toast.success("Berhasil update data layanan polsek");
          await layananPolsek.findManyAll.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal update data layanan polsek");
        }
      } catch (error) {
        console.error("Error updating data layanan polsek:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update data layanan polsek"
        );
        return false;
      } finally {
        layananPolsek.update.loading = false;
      }
    },
    reset() {
      layananPolsek.update.id = "";
      layananPolsek.update.form = { ...defaultFormLayananPolsek };
    },
  },
});

const statePolsekTerdekat = proxy({
  polsekTerdekatState,
  layananPolsek,
});

export default statePolsekTerdekat;
