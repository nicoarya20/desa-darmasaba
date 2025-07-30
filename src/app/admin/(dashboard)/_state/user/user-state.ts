import { proxy } from "valtio";
import { toast } from "react-toastify";
import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const userSchema = z.object({
  nama: z.string().min(1, "Nama harus diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  roleId: z.string().optional(),
});

const defaultForm = {
  nama: "",
  email: "",
  password: "",
  roleId: "",
};

const userState = proxy({
  create: {
    form: { ...defaultForm },
    loading: false,
    async create(isAdmin: boolean = false) {
      const valid = userSchema.safeParse(userState.create.form);
      if (!valid.success) {
        const err = valid.error.issues.map((i) => i.message).join(", ");
        return toast.error(err);
      }

      try {
        userState.create.loading = true;
        const res = await ApiFetch.api.user[
          isAdmin ? "create" : "register"
        ].post(userState.create.form);

        if (res.status === 200) {
          toast.success("User berhasil dibuat");
          userState.findMany.load();
        } else {
          toast.error(res.data?.message || "Gagal membuat user");
        }
      } catch (e) {
        console.error(e);
        toast.error("Terjadi kesalahan saat membuat user");
      } finally {
        userState.create.loading = false;
      }
    },
  },

  login: {
    form: { email: "", password: "" },
    loading: false,
    async submit() {
      try {
        userState.login.loading = true;
        const res = await ApiFetch.api.user.login.post(userState.login.form);
        if (res.status === 200) {
          toast.success("Login berhasil");
          const token = res.data?.data?.token;
          if (typeof token === "string") {
            localStorage.setItem("token", token);
          }
        } else {
          toast.error(res.data?.message || "Login gagal");
        }
      } catch (e) {
        console.error(e);
        toast.error("Terjadi kesalahan saat login");
      } finally {
        userState.login.loading = false;
      }
    },
  },

  register: {
    form: { ...defaultForm },
    loading: false,
    async submit() {
      const valid = userSchema.safeParse(userState.register.form);
      if (!valid.success) {
        const err = valid.error.issues.map(i => i.message).join(", ");
        return toast.error(err);
      }

      try {
        userState.register.loading = true;
        const res = await ApiFetch.api.user.register.post(userState.register.form);

        if (res.status === 200) {
          toast.success("Registrasi berhasil, silakan login");
          userState.register.form = { ...defaultForm }; // Reset form
        } else {
          toast.error(res.data?.message || "Gagal registrasi");
        }
      } catch (e) {
        console.error(e);
        toast.error("Terjadi kesalahan saat registrasi");
      } finally {
        userState.register.loading = false;
      }
    },
  },

  findMany: {
    data: [] as Prisma.UserGetPayload<{ include: { role: true } }>[],
    loading: false,
    async load() {
      userState.findMany.loading = true;
      const res = await ApiFetch.api.user.findMany.get();
      if (res.status === 200) {
        userState.findMany.data = res.data?.data ?? [];
      }
      userState.findMany.loading = false;
    },
  },

  findUnique: {
    data: null as Prisma.UserGetPayload<{ include: { role: true } }> | null,
    loading: false,
    async load(id: string) {
      try {
        userState.findUnique.loading = true;
        const res = await fetch(`/api/user/findUnique/${id}`);
        const data = await res.json();
        if (res.status === 200) {
          userState.findUnique.data = data.data ?? null;
        }
      } catch (e) {
        console.error(e);
        toast.error("Terjadi kesalahan saat mengambil data user");
      } finally {
        userState.findUnique.loading = false;
      }
    },
  },

  update: {
    id: "",
    form: { ...defaultForm },
    loading: false,
    async load(id: string) {
      try {
        userState.update.loading = true;
        const res = await fetch(`/api/user/findUnique/${id}`);
        const data = await res.json();
        if (res.status === 200) {
          const user = data.data;
          userState.update.id = user.id;
          userState.update.form = {
            nama: user.nama,
            email: user.email,
            password: "",
            roleId: user.roleId,
          };
        }
      } catch (e) {
        console.error(e);
        toast.error("Terjadi kesalahan saat mengambil data user");
      } finally {
        userState.update.loading = false;
      }
    },
    async submit() {
      try {
        userState.update.loading = true;
        const res = await fetch(`/api/user/update/${userState.update.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userState.update.form),
        });
        const data = await res.json();
        if (res.status === 200) {
          toast.success("Berhasil update user");
          userState.findMany.load();
        } else {
          toast.error(data?.message || "Gagal update user");
        }
      } catch (e) {
        console.error(e);
        toast.error("Terjadi kesalahan saat update user");
      } finally {
        userState.update.loading = false;
      }
    },
  },
  delete: {
    loading: false,
    async submit(id: string) {
      try {
        userState.delete.loading = true;
        const res = await fetch(`/api/user/del/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        if (res.status === 200) {
          toast.success("User berhasil dihapus");
          userState.findMany.load();
        } else {
          toast.error(data?.message || "Gagal hapus user");
        }
      } catch (e) {
        console.error(e);
        toast.error("Terjadi kesalahan saat hapus user");
      } finally {
        userState.delete.loading = false;
      }
    },
  },
});

export default userState;
