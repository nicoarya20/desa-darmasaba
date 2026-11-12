import { getServerMessage } from "@/utils/api-message";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { defaultPegawaiForm, templatePegawai } from "./templates";
import type { Pegawai, PegawaiForm, StrukturStateConfig } from "./types";

/**
 * Validasi form lalu bentuk body kontrak: field form dikirim semua (kosong = dikosongkan server); gelar, tanggal
 * masuk, dan alamat tidak dikirim sehingga nilai lama di DB tidak diubah. Null bila tidak valid.
 */
function toPayload(form: PegawaiForm) {
  const cek = templatePegawai.safeParse(form);
  if (!cek.success) {
    toast.error(cek.error.issues.map((issue) => issue.message).join("\n"));
    return null;
  }
  return { ...form, namaLengkap: form.namaLengkap.trim(), posisiId: form.posisiId.trim() };
}

/** State pegawai satu struktur organisasi: list berpaginasi, detail, create/update/delete (admin). */
export function createPegawaiState(config: StrukturStateConfig) {
  const api = config.api.pegawai;
  const log = `[${config.logTag}.pegawai]`;
  const { pegawaiLabel: label, pegawaiLabelLower: lower } = config;

  const pegawai = proxy({
    findMany: {
      data: null as Pegawai[] | null,
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
      search: "",
      isActive: undefined as boolean | undefined,
      loading: false,
      /** Muat satu halaman; parameter disimpan agar refresh setelah create/update/delete memakai filter yang sama. */
      async load(page = 1, limit = 10, search = "", isActive?: boolean) {
        Object.assign(pegawai.findMany, { loading: true, page, limit, search, isActive });
        try {
          const res = await api()["find-many"].get({
            query: {
              page,
              limit,
              ...(search.trim() ? { search: search.trim() } : {}),
              ...(isActive === undefined ? {} : { isActive: String(isActive) }),
            },
          });
          const body = res.status === 200 && res.data?.success ? res.data : null;
          if (!body) toast.error(getServerMessage(res) ?? `Gagal memuat daftar ${lower}`);
          pegawai.findMany.data = body?.data ?? [];
          pegawai.findMany.total = body?.total ?? 0;
          pegawai.findMany.totalPages = body?.totalPages ?? 1;
        } catch (error) {
          console.error(`${log} Gagal memuat daftar ${lower}:`, error);
          Object.assign(pegawai.findMany, { data: [], total: 0, totalPages: 1 });
          toast.error(`Terjadi kesalahan saat memuat daftar ${lower}`);
        } finally {
          pegawai.findMany.loading = false;
        }
      },
      /** Muat ulang dengan page/limit/search/isActive terakhir. */
      async reload() {
        const { page, limit, search, isActive } = pegawai.findMany;
        await pegawai.findMany.load(page, limit, search, isActive);
      },
    },

    findUnique: {
      data: null as Pegawai | null,
      loading: false,
      async load(id: string): Promise<Pegawai | null> {
        pegawai.findUnique.loading = true;
        try {
          const res = await api()({ id }).get();
          const item = res.status === 200 && res.data?.success ? res.data.data : null;
          pegawai.findUnique.data = item;
          if (!item) toast.error(getServerMessage(res) ?? `${label} tidak ditemukan`);
          return item;
        } catch (error) {
          console.error(`${log} Gagal memuat ${lower} ${id}:`, error);
          pegawai.findUnique.data = null;
          toast.error(`Terjadi kesalahan saat memuat ${lower}`);
          return null;
        } finally {
          pegawai.findUnique.loading = false;
        }
      },
    },

    create: {
      form: defaultPegawaiForm(),
      loading: false,
      /** Kirim form create; true bila berhasil (form direset dan daftar dimuat ulang). */
      async submit(): Promise<boolean> {
        const payload = toPayload(pegawai.create.form);
        if (!payload) return false;
        pegawai.create.loading = true;
        try {
          const res = await api().create.post(payload);
          if (res.status !== 200) {
            toast.error(getServerMessage(res) ?? `Gagal menambahkan ${lower}`);
            return false;
          }
          toast.success(`${label} berhasil ditambahkan`);
          pegawai.create.resetForm();
          await pegawai.findMany.reload();
          return true;
        } catch (error) {
          console.error(`${log} Gagal menambahkan ${lower}:`, error);
          toast.error(`Terjadi kesalahan saat menambahkan ${lower}`);
          return false;
        } finally {
          pegawai.create.loading = false;
        }
      },
      resetForm() {
        pegawai.create.form = defaultPegawaiForm();
      },
    },

    update: {
      id: "",
      form: defaultPegawaiForm(),
      /** Link foto saat ini untuk pratinjau form edit; null bila belum ada foto. */
      imageLink: null as string | null,
      loading: false,
      /** Muat pegawai ke form edit; false bila tidak ditemukan. */
      async load(id: string): Promise<boolean> {
        const item = await pegawai.findUnique.load(id);
        if (!item) return false;
        pegawai.update.id = item.id;
        pegawai.update.imageLink = item.image?.link ?? null;
        pegawai.update.form = {
          namaLengkap: item.namaLengkap,
          imageId: item.imageId ?? "",
          email: item.email ?? "",
          telepon: item.telepon ?? "",
          posisiId: item.posisiId,
          isActive: item.isActive,
        };
        return true;
      },
      /** Kirim form edit; imageId dikosongkan/diganti → server menghapus foto lama. True bila berhasil. */
      async submit(): Promise<boolean> {
        const { id } = pegawai.update;
        const payload = id ? toPayload(pegawai.update.form) : null;
        if (!payload) return false;
        pegawai.update.loading = true;
        try {
          const res = await api()({ id }).put(payload);
          if (res.status !== 200) {
            toast.error(getServerMessage(res) ?? `Gagal memperbarui ${lower}`);
            return false;
          }
          toast.success(`${label} berhasil diperbarui`);
          await pegawai.findMany.reload();
          return true;
        } catch (error) {
          console.error(`${log} Gagal memperbarui ${lower} ${id}:`, error);
          toast.error(`Terjadi kesalahan saat memperbarui ${lower}`);
          return false;
        } finally {
          pegawai.update.loading = false;
        }
      },
      resetForm() {
        Object.assign(pegawai.update, { id: "", imageLink: null, form: defaultPegawaiForm() });
      },
    },

    delete: {
      loading: false,
      /** Hapus pegawai; true bila berhasil. */
      async byId(id: string): Promise<boolean> {
        pegawai.delete.loading = true;
        try {
          const res = await api().del({ id }).delete();
          if (res.status !== 200) {
            toast.error(getServerMessage(res) ?? `Gagal menghapus ${lower}`);
            return false;
          }
          toast.success(`${label} berhasil dihapus`);
          await pegawai.findMany.reload();
          return true;
        } catch (error) {
          console.error(`${log} Gagal menghapus ${lower} ${id}:`, error);
          toast.error(`Terjadi kesalahan saat menghapus ${lower}`);
          return false;
        } finally {
          pegawai.delete.loading = false;
        }
      },
    },
  });

  return pegawai;
}

export type PegawaiState = ReturnType<typeof createPegawaiState>;
