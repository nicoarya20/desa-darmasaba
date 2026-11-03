import { wilayahDesaSchema } from "@/app/api/[[...slugs]]/_lib/desa/profile/profile_desa/wilayah/validation";
import { toast } from "react-toastify";
import { proxy } from "valtio";

const WILAYAH_ENDPOINT = "/api/desa/profile/wilayah";

/** Bentuk data wilayah desa dari GET /api/desa/profile/wilayah (luas dalam hektar). */
export type WilayahDesaData = {
  id: string;
  batasUtara: string | null;
  batasSelatan: string | null;
  batasTimur: string | null;
  batasBarat: string | null;
  luasWilayah: number | null;
  keterangan: string | null;
  petaEmbedUrl: string | null;
  updatedAt: string;
};

/** Nilai form; luasWilayah bisa string "" saat input kosong (NumberInput Mantine). */
export type WilayahDesaFormValues = {
  batasUtara: string;
  batasSelatan: string;
  batasTimur: string;
  batasBarat: string;
  luasWilayah: number | string;
  keterangan: string;
  petaEmbedUrl: string;
};

/** Nilai form dari data tersimpan; data null (belum diisi) → form kosong. */
export function toWilayahFormValues(
  data: WilayahDesaData | null,
): WilayahDesaFormValues {
  return {
    batasUtara: data?.batasUtara ?? "",
    batasSelatan: data?.batasSelatan ?? "",
    batasTimur: data?.batasTimur ?? "",
    batasBarat: data?.batasBarat ?? "",
    luasWilayah: data?.luasWilayah ?? "",
    keterangan: data?.keterangan ?? "",
    petaEmbedUrl: data?.petaEmbedUrl ?? "",
  };
}

/** Ubah nilai form ke payload API: luas kosong → null, selain itu Number(). */
export function toWilayahPayload(form: WilayahDesaFormValues) {
  const luas = form.luasWilayah;
  return {
    ...form,
    luasWilayah: luas === "" ? null : Number(luas),
  };
}

const wilayahDesa = proxy({
  findUnique: {
    data: null as WilayahDesaData | null,
    loading: false,
    error: null as string | null,

    async load() {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(WILAYAH_ENDPOINT);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || "Gagal mengambil data wilayah desa");
        }
        this.data = result.data;
        return result.data as WilayahDesaData | null;
      } catch (error) {
        const msg = (error as Error).message;
        this.error = msg;
        console.error("Load wilayah desa error:", msg);
        return null;
      } finally {
        this.loading = false;
      }
    },
  },
  update: {
    loading: false,
    error: null as string | null,

    async submit(form: WilayahDesaFormValues) {
      const payload = toWilayahPayload(form);
      const validation = wilayahDesaSchema.safeParse(payload);
      if (!validation.success) {
        toast.error(validation.error.issues[0]?.message ?? "Form tidak valid");
        return false;
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(WILAYAH_ENDPOINT, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validation.data),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success) {
          throw new Error(
            result.message || `HTTP error! status: ${response.status}`,
          );
        }

        toast.success("Data wilayah desa berhasil disimpan");
        wilayahDesa.findUnique.data = result.data;
        return true;
      } catch (error) {
        const msg = (error as Error).message;
        this.error = msg;
        console.error("Update wilayah desa error:", msg);
        toast.error(msg || "Gagal menyimpan data wilayah desa");
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});

export default wilayahDesa;
