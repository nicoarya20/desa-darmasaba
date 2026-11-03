/* eslint-disable @typescript-eslint/no-explicit-any */
import { proxy } from "valtio";
import { toast } from "react-toastify";
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// State Valtio
const userState = proxy({
  // Find Many — tab Admin (roleGroup "admin") atau semua user (menu-access, tanpa roleGroup)
  findMany: {
    data: [] as Prisma.UserGetPayload<{ include: { role: true } }>[],
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "", roleGroup?: "admin" | "warga") => {
      userState.findMany.loading = true; // ✅ Akses langsung via nama path
      userState.findMany.page = page;
      userState.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;
        if (roleGroup) query.roleGroup = roleGroup;

        const res = await ApiFetch.api.user["findMany"].get({ query });

        if (res.status === 200 && res.data?.success) {
          userState.findMany.data = res.data.data ?? [];
          userState.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          userState.findMany.data = [];
          userState.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch user paginated:", err);
        userState.findMany.data = [];
        userState.findMany.totalPages = 1;
      } finally {
        userState.findMany.loading = false;
      }
    },
  },

  // Find Many — tab Warga (roleGroup "warga"): warga publik hasil login Google (role 5)
  warga: {
    data: [] as Prisma.UserGetPayload<{ include: { role: true } }>[],
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      userState.warga.loading = true;
      userState.warga.page = page;
      userState.warga.search = search;

      try {
        const query: any = { page, limit, roleGroup: "warga" };
        if (search) query.search = search;

        const res = await ApiFetch.api.user["findMany"].get({ query });

        if (res.status === 200 && res.data?.success) {
          userState.warga.data = res.data.data ?? [];
          userState.warga.totalPages = res.data.totalPages ?? 1;
        } else {
          userState.warga.data = [];
          userState.warga.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch warga paginated:", err);
        userState.warga.data = [];
        userState.warga.totalPages = 1;
      } finally {
        userState.warga.loading = false;
      }
    },
  },

  // Find Unique
  findUnique: {
    data: null as Prisma.UserGetPayload<{ include: { role: true } }> | null,
    loading: false,
    async load(id: string) {
      this.loading = true;
      try {
        const res = await fetch(`/api/user/findUnique/${id}`);
        const data = await res.json();
        if (res.status === 200) {
          this.data = data.data;
        } else {
          toast.error(data.message);
        }
      } catch (e) {
        console.error(e);
        toast.error("Gagal ambil data user");
      } finally {
        this.loading = false;
      }
    },
  },

  // Delete (Soft Delete)
  delete: {
    loading: false,
    async submit(id: string) {
      this.loading = true;
      try {
        const res = await fetch(`/api/user/del/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (res.status === 200) {
          toast.success("User dinonaktifkan");
          userState.findMany.load();
        } else {
          toast.error(data.message || "Gagal hapus");
        }
      } catch (e) {
        console.error(e);
        toast.error("Gagal hapus user");
      } finally {
        this.loading = false;
      }
    },
  },
  deleteUser: {
    loading: false,
  
    // Mengembalikan boolean sukses. Sengaja TIDAK me-reload list di sini:
    // caller (list admin) yang me-reload dengan filter benar (roleGroup="admin",
    // halaman & search saat ini). Reload internal tanpa argumen dulu membuang
    // filter itu sehingga daftar admin tercampur warga & pindah ke page 1.
    async delete(id: string): Promise<boolean> {
      if (!id) {
        toast.warn("ID tidak valid");
        return false;
      }

      try {
        userState.deleteUser.loading = true;

        // Pakai Eden (ApiFetch) — konsisten dgn pola delete yang bekerja
        // (inovasi/program-kreatif). Eden tak set Content-Type json untuk
        // DELETE tanpa body, jadi tak memicu 400 parse-body kosong di Elysia.
        const res = await (ApiFetch.api.user as any)["delUser"][id].delete();

        if (res.data?.success) {
          toast.success(res.data.message || "User berhasil dihapus permanen");
          return true;
        }

        toast.error(res.data?.message || "Gagal menghapus user");
        return false;
      } catch (error) {
        console.error("Gagal delete user:", error);
        toast.error("Terjadi kesalahan saat menghapus user");
        return false;
      } finally {
        userState.deleteUser.loading = false;
      }
    },
  },  
  // Di file userState.ts atau dimana state user berada

update: {
  loading: false,

  async submit(payload: { id: string; isActive?: boolean; roleId?: string }) {
    this.loading = true;
    try {
      const res = await fetch(`/api/user/updt`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 200 && data.success) {
        // ✅ Tampilkan pesan yang berbeda jika role berubah
        if (data.roleChanged) {
          toast.success(
            `${data.message}\n\nUser akan logout otomatis dalam beberapa detik.`,
            {
              autoClose: 5000,
            }
          );
        } else {
          toast.success(data.message);
        }

        // Refresh list
        await userState.findMany.load(
          userState.findMany.page,
          10,
          userState.findMany.search
        );

        return true; // ✅ Return success untuk handling di component
      } else {
        toast.error(data.message || "Gagal update user");
        return false;
      }
    } catch (e) {
      console.error("❌ Error update user:", e);
      toast.error("Gagal update user");
      return false;
    } finally {
      this.loading = false;
    }
  },
},
});

const templateRole = z.object({
  name: z.string().min(1, "Nama harus diisi"),
});

const defaultRole = {
  name: "",
};

const roleState = proxy({
  create: {
    form: { ...defaultRole },
    loading: false,
    async create() {
      const cek = templateRole.safeParse(roleState.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        return toast.error(err);
      }

      try {
        roleState.create.loading = true;
        const res = await ApiFetch.api.role["create"].post(
          roleState.create.form
        );
        if (res.status === 200) {
          roleState.findMany.load();
          return toast.success("Data role Berhasil Dibuat");
        }
        console.log(res);
        return toast.error("failed create");
      } catch (error) {
        console.log(error);
        return toast.error("failed create");
      } finally {
        roleState.create.loading = false;
      }
    },
  },
  findMany: {
    data: [] as Prisma.RoleGetPayload<{
      omit: {
        isActive: true;
      };
    }>[],
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    load: async (page = 1, limit = 10, search = "") => {
      roleState.findMany.loading = true; // ✅ Akses langsung via nama path
      roleState.findMany.page = page;
      roleState.findMany.search = search;

      try {
        const query: any = { page, limit };
        if (search) query.search = search;

        const res = await ApiFetch.api.role["findMany"].get({ query });

        if (res.status === 200 && res.data?.success) {
          roleState.findMany.data = res.data.data ?? [];
          roleState.findMany.totalPages = res.data.totalPages ?? 1;
        } else {
          roleState.findMany.data = [];
          roleState.findMany.totalPages = 1;
        }
      } catch (err) {
        console.error("Gagal fetch role paginated:", err);
        roleState.findMany.data = [];
        roleState.findMany.totalPages = 1;
      } finally {
        roleState.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.RoleGetPayload<{
      omit: {
        isActive: true;
      };
    }> | null,
    loading: false,
    async load(id: string) {
      try {
        const res = await fetch(`/api/role/${id}`);
        if (res.ok) {
          const data = await res.json();
          roleState.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch data", res.status, res.statusText);
          roleState.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        roleState.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async delete(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        roleState.delete.loading = true;

        const response = await fetch(`/api/role/del/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result?.success) {
          toast.success(result.message || "Data role berhasil dihapus");
          await roleState.findMany.load(); // refresh list
        } else {
          toast.error(result?.message || "Gagal menghapus Data role");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus Data role");
      } finally {
        roleState.delete.loading = false;
      }
    },
  },
  update: {
    id: "",
    form: { ...defaultRole },
    loading: false,
    async load(id: string) {
      if (!id) {
        toast.warn("ID tidak valid");
        return null;
      }
    
      try {
        const response = await fetch(`/api/role/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
    
        const result = await response.json();
    
        if (result?.success) {
          const data = result.data;
    
          // langsung set melalui root state, bukan this
          roleState.update.id = data.id;
          roleState.update.form = {
            name: data.name,
          };
    
          return data;
        }
      } catch (error) {
        console.error("Error loading role:", error);
        toast.error("Gagal memuat data");
      }
    },    
    async update() {
      const cek = templateRole.safeParse(roleState.update.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }

      try {
        roleState.update.loading = true;

        const response = await fetch(`/api/role/${this.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: this.form.name,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();

        if (result.success) {
          toast.success("Berhasil update data role");
          await roleState.findMany.load(); // refresh list
          return true;
        } else {
          throw new Error(result.message || "Gagal update data role");
        }
      } catch (error) {
        console.error("Error updating data role:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat update data role"
        );
        return false;
      } finally {
        roleState.update.loading = false;
      }
    },
    reset() {
      roleState.update.id = "";
      roleState.update.form = { ...defaultRole };
    },
  },
});

const user = proxy({
  userState,
  roleState,
});

export default user;
