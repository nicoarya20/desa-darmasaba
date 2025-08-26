/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateForm = z.object({
  name: z.string().min(1, "Nama minimal 1 karakter"),
  icon: z.string().min(1, "Icon minimal 1 karakter"),
});

const defaultForm = {
  name: "",
  icon: "",
};

const pengelolaanSampah = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create() {
      const cek = templateForm.safeParse(pengelolaanSampah.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        pengelolaanSampah.create.loading = true;
        const res = await ApiFetch.api.lingkungan.pengelolaansampah[
          "create"
        ].post(pengelolaanSampah.create.form);
        if (res.status === 200) {
          pengelolaanSampah.findMany.load();
          return toast.success("success create");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        pengelolaanSampah.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as any[] | null,
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      // Change to arrow function
      pengelolaanSampah.findMany.loading = true; // Use the full path to access the property
      pengelolaanSampah.findMany.page = page;
      pengelolaanSampah.findMany.search = search;
      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        const res = await ApiFetch.api.lingkungan.pengelolaansampah[
          "find-many"
        ].get({
          query,
        });

        if (res.status === 200 && res.data?.success) {
          pengelolaanSampah.findMany.data = res.data.data || [];
          pengelolaanSampah.findMany.total = res.data.total || 0;
          pengelolaanSampah.findMany.totalPages = res.data.totalPages || 1;
        } else {
          console.error(
            "Failed to load pengelolaan sampah:",
            res.data?.message
          );
          pengelolaanSampah.findMany.data = [];
          pengelolaanSampah.findMany.total = 0;
          pengelolaanSampah.findMany.totalPages = 1;
        }
      } catch (error) {
        console.error("Error loading pengelolaan sampah:", error);
        pengelolaanSampah.findMany.data = [];
        pengelolaanSampah.findMany.total = 0;
        pengelolaanSampah.findMany.totalPages = 1;
      } finally {
        pengelolaanSampah.findMany.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultForm },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/lingkungan/pengelolaansampah/${id}`,
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
            name: data.name,
            icon: data.icon,
          };
          return data;
        } else {
          throw new Error(result?.message || "Gagal mengambil data");
        }
      } catch (error) {
        console.error("Error loading pengelolaan sampah:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
      }
    },

    async submit() {
      const id = this.id;
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
      const cek = templateForm.safeParse(this.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }
      this.loading = true;
      try {
        const response = await fetch(
          `/api/lingkungan/pengelolaansampah/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.form),
          }
        );
        const result = await response.json();
        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Gagal update data");
        }
        toast.success("Berhasil update data!");
        await pengelolaanSampah.findMany.load();
        return result.data;
      } catch (error) {
        console.error("Error update data:", error);
        toast.error("Gagal update data pengelolaan sampah");
      } finally {
        this.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.ProgramKreatifGetPayload<{
      omit: { isActive: true };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/lingkungan/pengelolaansampah/${id}`);
        if (res.ok) {
          const data = await res.json();
          pengelolaanSampah.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          pengelolaanSampah.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error loading pengelolaan sampah:", error);
        pengelolaanSampah.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        pengelolaanSampah.delete.loading = true;

        const response = await fetch(
          `/api/lingkungan/pengelolaansampah/del/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(
            result.message || "pengelolaan sampah berhasil dihapus"
          );
          await pengelolaanSampah.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus pengelolaan sampah");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus pengelolaan sampah");
      } finally {
        pengelolaanSampah.delete.loading = false;
      }
    },
  },
});

const templateKeteranganSampahForm = z.object({
  name: z.string().min(1, "Nama minimal 1 karakter"),
  alamat: z.string().min(1, "Alamat minimal 1 karakter"),
  namaTempatMaps: z.string().min(1, "Nama Tempat Maps minimal 1 karakter"),
  lat: z.number(),
  lng: z.number(),
});

const defaultKeteranganSampahForm = {
  name: "",
  alamat: "",
  namaTempatMaps: "",
  lat: 0,
  lng: 0,
};


const keteranganSampah = proxy({
  create: {
    form: { ...defaultKeteranganSampahForm },
    loading: false,
    async create() {
      const cek = templateKeteranganSampahForm.safeParse(
        keteranganSampah.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }
      try {
        keteranganSampah.create.loading = true;
        const res =
          await ApiFetch.api.lingkungan.pengelolaansampah.keteranganbankterdekat[
            "create"
          ].post(keteranganSampah.create.form);
        if (res.status === 200) {
          keteranganSampah.findMany.load();
          return toast.success("Data berhasil ditambahkan");
        }
        return toast.error("Gagal menambahkan data");
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
      } finally {
        keteranganSampah.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.KeteranganBankSampahTerdekatGetPayload<{
          omit: { isActive: true };
        }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.lingkungan.pengelolaansampah.keteranganbankterdekat[
        "find-many"
      ].get();
      if (res.status === 200) {
        keteranganSampah.findMany.data = res.data?.data ?? [];
      }
    },
  },
  findUnique: {
      data: null as Prisma.KeteranganBankSampahTerdekatGetPayload<{
        omit: { isActive: true };
      }> | null,
      async load(id: string) {
        try {
          const res = await fetch(`/api/lingkungan/pengelolaansampah/keteranganbankterdekat/${id}`);
          if (res.ok) {
            const data = await res.json();
            keteranganSampah.findUnique.data = data.data ?? null;
          } else {
            console.error("Failed to fetch data", res.status, res.statusText);
            keteranganSampah.findUnique.data = null;
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          keteranganSampah.findUnique.data = null;
        }
      },
    },
    delete: {
        loading: false,
        async byId(id: string) {
          if (!id) return toast.warn("ID tidak valid");
    
          try {
            keteranganSampah.delete.loading = true;
    
            const response = await fetch(`/api/lingkungan/pengelolaansampah/keteranganbankterdekat/del/${id}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            });
    
            const result = await response.json();
    
            if (response.ok && result?.success) {
              toast.success(result.message || "Keterangan sampah berhasil dihapus");
              await keteranganSampah.findMany.load(); // refresh list
            } else {
              toast.error(result?.message || "Gagal menghapus keterangan sampah");
            }
          } catch (error) {
            console.error("Gagal delete:", error);
            toast.error("Terjadi kesalahan saat menghapus keterangan sampah");
          } finally {
            keteranganSampah.delete.loading = false;
          }
        },
      },
      edit: {
          id: "",
          form: { ...defaultKeteranganSampahForm },
          loading: false,
      
          async load(id: string) {
            if (!id) {
              toast.warn("ID tidak valid");
              return null;
            }
      
            try {
              const response = await fetch(`/api/lingkungan/pengelolaansampah/keteranganbankterdekat/${id}`, {
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
                  name: data.name,
                  alamat: data.alamat,
                  namaTempatMaps: data.namaTempatMaps,
                  lat: data.lat,
                  lng: data.lng,
                };
                return data;
              } else {
                throw new Error(result?.message || "Gagal memuat data");
              }
            } catch (error) {
              console.error("Error loading keterangan sampah:", error);
              toast.error(
                error instanceof Error ? error.message : "Gagal memuat data"
              );
              return null;
            }
          },
      
          async update() {
            const cek = templateKeteranganSampahForm.safeParse(keteranganSampah.edit.form);
            if (!cek.success) {
              const err = `[${cek.error.issues
                .map((v) => `${v.path.join(".")}`)
                .join("\n")}] required`;
              return toast.error(err);
            }
      
            try {
              keteranganSampah.edit.loading = true;
              const response = await fetch(
                `/api/lingkungan/pengelolaansampah/keteranganbankterdekat/${this.id}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    name: this.form.name,
                    alamat: this.form.alamat,
                    namaTempatMaps: this.form.namaTempatMaps,
                    lat: this.form.lat,
                    lng: this.form.lng,
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
                toast.success("Berhasil update keterangan sampah");
                await keteranganSampah.findMany.load(); // refresh list
                return true;
              } else {
                throw new Error(result.message || "Gagal mengupdate keterangan sampah");
              }
            } catch (error) {
              console.error("Error updating keterangan sampah:", error);
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Gagal mengupdate keterangan sampah"
              );
              return false;
            } finally {
              keteranganSampah.edit.loading = false;
            }
          },
          reset() {
            keteranganSampah.edit.id = "";
            keteranganSampah.edit.form = { ...defaultKeteranganSampahForm };
          },
        },
});

const pengelolaanSampahState = proxy({
  pengelolaanSampah,
  keteranganSampah,
});

export default pengelolaanSampahState;
