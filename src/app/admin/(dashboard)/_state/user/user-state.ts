import { proxy } from 'valtio'
import { toast } from 'react-toastify'
import ApiFetch from '@/lib/api-fetch'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// 1. Validasi Zod
const userSchema = z.object({
  nama: z.string().min(1, 'Nama harus diisi'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  roleId: z.string().optional(),
})

const defaultForm = { nama: '', email: '', password: '', roleId: '' }

// 2. State Valtio
const userState = proxy({
  // Register
  register: {
    form: { ...defaultForm },
    loading: false,
    async submit() {
      const valid = userSchema.omit({ roleId: true }).safeParse(userState.register.form)
      if (!valid.success) {
        const err = valid.error.issues.map(i => i.message).join(', ')
        return toast.error(err)
      }
      try {
        userState.register.loading = true
        const res = await ApiFetch.api.user.register.post(userState.register.form)
        if (res.status === 200) {
          toast.success('Registrasi berhasil, silakan login')
          userState.register.form = { ...defaultForm } // reset
        } else {
          toast.error(res.data?.message || 'Gagal registrasi')
        }
      } catch (e) {
        console.error(e)
        toast.error('Terjadi kesalahan saat registrasi')
      } finally {
        userState.register.loading = false
      }
    },
  },

  // Login
  login: {
    form: { email: '', password: '' },
    loading: false,
    async submit() {
      try {
        userState.login.loading = true
        const res = await ApiFetch.api.user.login.post(userState.login.form)
        if (res.status === 200) {
          toast.success('Login berhasil')
          const token = res.data?.data?.token
          if (typeof token === 'string') {
            localStorage.setItem('token', token)
            // Optional: simpan user role untuk otorisasi
            const user = res.data?.data?.user
            localStorage.setItem('user', JSON.stringify(user))
          }
        } else {
          toast.error(res.data?.message || 'Login gagal')
        }
      } catch (e) {
        console.error(e)
        toast.error('Terjadi kesalahan saat login')
      } finally {
        userState.login.loading = false
      }
    },
  },

  // CRUD User (untuk admin)
  create: {
    form: { ...defaultForm },
    loading: false,
    async create(isAdmin = false) {
      const valid = userSchema.safeParse(userState.create.form)
      if (!valid.success) {
        const err = valid.error.issues.map(i => i.message).join(', ')
        return toast.error(err)
      }
      try {
        userState.create.loading = true
        const endpoint = isAdmin ? 'create' : 'register'
        const res = await ApiFetch.api.user[endpoint].post(userState.create.form)
        if (res.status === 200) {
          toast.success('User berhasil dibuat')
          userState.findMany.load() // refresh list
          userState.create.form = { ...defaultForm } // reset form
        } else {
          toast.error(res.data?.message || 'Gagal membuat user')
        }
      } catch (e) {
        console.error(e)
        toast.error('Gagal membuat user')
      } finally {
        userState.create.loading = false
      }
    },
  },

  // Find Many
  findMany: {
    data: [] as Prisma.UserGetPayload<{ include: { role: true } }>[],
    loading: false,
    async load() {
      this.loading = true
      try {
        const res = await ApiFetch.api.user.findMany.get()
        if (res.status === 200) {
          this.data = res.data?.data || []
        }
      } catch (e) {
        console.error(e)
        toast.error('Gagal muat data user')
      } finally {
        this.loading = false
      }
    },
  },

  // Find Unique
  findUnique: {
    data: null as Prisma.UserGetPayload<{ include: { role: true } }> | null,
    loading: false,
    async load(id: string) {
      this.loading = true
      try {
        const res = await fetch(`/api/user/findUnique/${id}`)
        const data = await res.json()
        if (res.status === 200) {
          this.data = data.data
        } else {
          toast.error(data.message)
        }
      } catch (e) {
        console.error(e)
        toast.error('Gagal ambil data user')
      } finally {
        this.loading = false
      }
    },
  },

  // Update
  update: {
    id: '',
    form: { ...defaultForm },
    loading: false,
    async load(id: string) {
      this.loading = true
      try {
        const res = await fetch(`/api/user/findUnique/${id}`)
        const data = await res.json()
        if (res.status === 200) {
          const user = data.data
          this.id = user.id
          this.form = {
            nama: user.nama,
            email: user.email,
            password: '', // jangan kirim password lama
            roleId: user.roleId,
          }
        }
      } catch (e) {
        console.error(e)
        toast.error('Gagal muat data')
      } finally {
        this.loading = false
      }
    },
    async submit() {
      this.loading = true
      try {
        const res = await fetch(`/api/user/update/${this.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form),
        })
        const data = await res.json()
        if (res.status === 200) {
          toast.success('Update berhasil')
          userState.findMany.load()
        } else {
          toast.error(data.message || 'Gagal update')
        }
      } catch (e) {
        console.error(e)
        toast.error('Gagal update user')
      } finally {
        this.loading = false
      }
    },
  },

  // Delete (Soft Delete)
  delete: {
    loading: false,
    async submit(id: string) {
      this.loading = true
      try {
        const res = await fetch(`/api/user/del/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        })
        const data = await res.json()
        if (res.status === 200) {
          toast.success('User dinonaktifkan')
          userState.findMany.load()
        } else {
          toast.error(data.message || 'Gagal hapus')
        }
      } catch (e) {
        console.error(e)
        toast.error('Gagal hapus user')
      } finally {
        this.loading = false
      }
    },
  },
})

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
        const res =
          await ApiFetch.api.role[
            "create"
          ].post(roleState.create.form);
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
    loading: false,
    async load() {
      const res =
        await ApiFetch.api.role[
          "findMany"
        ].get();
      if (res.status === 200) {
        roleState.findMany.data = res.data?.data ?? [];
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
        const res = await fetch(
          `/api/role/${id}`
        );
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

        const response = await fetch(
          `/api/role/del/${id}`,
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
            result.message || "Data role berhasil dihapus"
          );
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
        const response = await fetch(
          `/api/role/${id}`,
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
          };
          return data; // Return the loaded data
        } else {
          throw new Error(result?.message || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error loading role:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat data"
        );
        return null;
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

        const response = await fetch(
          `/api/role/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.form.name,
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
})

export default user