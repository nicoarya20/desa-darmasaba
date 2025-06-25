import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateGrafikKepuasan = z.object({
  label: z.string().min(2, "Label harus diisi"),
  jumlah: z.string().min(1, "Jumlah harus diisi"),
});

type GrafikKepuasan = Prisma.GrafikKepuasanGetPayload<{
  select: {
    label: true;
    jumlah: true;
  };
}>;

const defaultForm: GrafikKepuasan = {
  label: "",
  jumlah: ""
};

const grafikkepuasan = proxy({
  create: {
    form: defaultForm,
    loading: false,
    async create() {
      const cek = templateGrafikKepuasan.safeParse(grafikkepuasan.create.form);
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return null;
      }
      try {
        grafikkepuasan.create.loading = true;
        const res = await ApiFetch.api.kesehatan.grafikkepuasan["create"].post(grafikkepuasan.create.form);
    
        if (res.status === 200) {
          const id = res.data?.data?.id;
          if (id) {
            toast.success("Success create");
            grafikkepuasan.create.form = {
              label: "",
              jumlah: "",
            };
            grafikkepuasan.findMany.load();
            return id;
          }
        }
        toast.error("failed create");
        return null;
      } catch (error) {
        console.log((error as Error).message);
        return null;
      } finally {
        grafikkepuasan.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as
      | Prisma.GrafikKepuasanGetPayload<{ omit: { isActive: true } }>[]
      | null,
    async load() {
      const res = await ApiFetch.api.kesehatan.grafikkepuasan[
        "find-many"
      ].get();
      if (res.status === 200) {
        grafikkepuasan.findMany.data = res.data?.data ?? [];
      }
    },
  },
  findUnique: {
    data: null as Prisma.GrafikKepuasanGetPayload<{
       omit: { isActive: true } 
      }> | null,
    async load(id: string) {
      try {
        const res = await fetch(`/api/kesehatan/grafikkepuasan/${id}`);
        if (res.ok) {
          const data = await res.json();
          grafikkepuasan.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch grafikkepuasan:", res.statusText);
          grafikkepuasan.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching grafikkepuasan:", error);
        grafikkepuasan.findUnique.data = null;
      }
    },
  },
  update: {
    id: "",
    form: {...defaultForm},
    loading: false,
    async byId() {
    },
  async submit() {
    const id = this.id;
    if (!id) {
      toast.warn("ID tidak valid");
      return null;
    }
    const cek = templateGrafikKepuasan.safeParse(grafikkepuasan.update.form);
    if (!cek.success) {
      const err = `[${cek.error.issues
        .map((v) => `${v.path.join(".")}`)
        .join("\n")}] required`;
      return toast.error(err);
    }
    try {
      this.loading = true;
      const response = await fetch(`/api/kesehatan/grafikkepuasan/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.form),
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Gagal update data");
      }

      toast.success("Berhasil update data!");

      // ✅ Optional: refresh list kalau kamu langsung ke halaman list
      await grafikkepuasan.findMany.load();

      return result.data;
    } catch (error) {
      console.error("Error update data:", error);
      toast.error("Gagal update data grafik kepuasan");
    } finally {
      this.loading = false;
    }
  },
},
delete: {
  loading: false,
  async byId(id: string) {
    if (!id) {
      return toast.warn("ID tidak valid");
    }
    try {
      grafikkepuasan.delete.loading = true;

      const response = await fetch(`/api/kesehatan/grafikkepuasan/del/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok && result?.success) {
        toast.success(
          result.message || "Grafik kepuasan berhasil dihapus"
        );
        await grafikkepuasan.findMany.load(); // refresh list
      } else {
        toast.error(
          result?.message || "Gagal menghapus grafik kepuasan"
        );
      }
    } catch (error) {
      console.error("Gagal delete:", error);
      toast.error("Terjadi kesalahan saat menghapus grafik kepuasan");
    } finally {
      grafikkepuasan.delete.loading = false;
    }
  }
}
});

export default grafikkepuasan;
