import ApiFetch from "@/lib/api-fetch";
import { Prisma } from "@prisma/client";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { z } from "zod";

const templateAdministrasiOnlineForm = z.object({
  name: z.string().min(1, "Nama minimal 1 karakter"),
  alamat: z.string().min(1, "Alamat minimal 1 karakter"),
  nomorTelepon: z.string().min(1, "Nomor telepon minimal 1 karakter"),
  jenisLayananId: z.string().min(1, "Jenis layanan minimal 1 karakter"),
});

const defaultAdministrasiOnlineForm = {
  name: "",
  alamat: "",
  nomorTelepon: "",
  jenisLayananId: "",
};

const administrasiOnline = proxy({
  create: {
    form: { ...defaultAdministrasiOnlineForm },
    loading: false,
    async create() {
      const cek = templateAdministrasiOnlineForm.safeParse(
        administrasiOnline.create.form
      );
      if (!cek.success) {
        const err = `[${cek.error.issues
          .map((v) => `${v.path.join(".")}`)
          .join("\n")}] required`;
        toast.error(err);
        return false;
      }
      try {
        administrasiOnline.create.loading = true;
        const res =
          await ApiFetch.api.inovasi.layananonlinedesa.administrasionline[
            "create"
          ].post(administrasiOnline.create.form);
        if (res.status === 200) {
          administrasiOnline.findMany.load();
          toast.success("Data berhasil ditambahkan");
          return true;
        }
        toast.error("Gagal menambahkan data");
        return false;
      } catch (error) {
        console.log(error);
        toast.error("Gagal menambahkan data");
        return false;
      } finally {
        administrasiOnline.create.loading = false;
      }
    },
  },
  findMany: {
    data: null as Array<
      Prisma.AdministrasiOnlineGetPayload<{
        include: {
          jenisLayanan: true;
        };
      }>
    > | null,
    page: 1,
    totalPages: 1,
    loading: false,
    search: "",
    async load(page = 1, limit = 10, search = "") {
      administrasiOnline.findMany.loading = true;
      administrasiOnline.findMany.page = page;
      administrasiOnline.findMany.search = search;
      try {
        const res =
          await ApiFetch.api.inovasi.layananonlinedesa.administrasionline[
            "find-many"
          ].get({
            query: {
              page,
              limit,
              search,
            },
          });

        if (res.status === 200 && res.data?.success) {
          administrasiOnline.findMany.data = res.data.data ?? [];
          administrasiOnline.findMany.totalPages = res.data.totalPages ?? 1;
        }
      } catch (err) {
        console.error("Gagal fetch administrasi online paginated:", err);
      } finally {
        administrasiOnline.findMany.loading = false;
      }
    },
  },
  findUnique: {
    data: null as Prisma.AdministrasiOnlineGetPayload<{
      include: {
        jenisLayanan: true;
      };
    }> | null,
    async load(id: string) {
      try {
        const res = await fetch(
          `/api/inovasi/layananonlinedesa/administrasionline/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          administrasiOnline.findUnique.data = data.data ?? null;
        } else {
          console.error("Failed to fetch administrasi online:", res.statusText);
          administrasiOnline.findUnique.data = null;
        }
      } catch (error) {
        console.error("Error fetching administrasi online:", error);
        administrasiOnline.findUnique.data = null;
      }
    },
  },
  delete: {
    loading: false,
    async byId(id: string) {
      if (!id) return toast.warn("ID tidak valid");

      try {
        administrasiOnline.delete.loading = true;

        const response = await fetch(
          `/api/inovasi/layananonlinedesa/administrasionline/del/${id}`,
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
            result.message || "Administrasi online berhasil dihapus"
          );
          await administrasiOnline.findMany.load();
        } else {
          toast.error(result?.message || "Gagal menghapus administrasi online");
        }
      } catch (error) {
        console.error("Gagal delete:", error);
        toast.error("Terjadi kesalahan saat menghapus administrasi online");
      } finally {
        administrasiOnline.delete.loading = false;
      }
    },
  },
});

export default administrasiOnline;
