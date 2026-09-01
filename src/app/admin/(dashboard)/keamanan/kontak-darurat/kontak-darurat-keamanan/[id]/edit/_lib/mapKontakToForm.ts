import { IconKey } from "@/app/admin/(dashboard)/_com/iconMap";

export type KontakDaruratFormData = {
  name: string;
  icon: IconKey | "";
  kategoriId: string[];
};

/**
 * Bentuk data mentah dari GET /kontakdaruratkeamanan/:id yang relevan
 * untuk mengisi form edit.
 */
export type KontakDaruratApiData = {
  nama?: string | null;
  icon?: string | null;
  // FK tunggal ke relasi `kategori` — BUKAN daftar kontak yang dipilih.
  kategoriId?: unknown;
  // Daftar kontak yang dipilih tersimpan di relasi junction ini.
  kontakItems?: Array<{ kontakItemId: string }> | null;
};

/**
 * Petakan data API kontak darurat keamanan ke bentuk form edit.
 *
 * Daftar "Kontak Item" (MultiSelect) diambil dari relasi `kontakItems`
 * (`kontakItemId`), bukan dari scalar `kategoriId` yang hanya berupa satu FK.
 * Bug lama: page membaca `data.kategoriId` langsung sebagai array sehingga
 * MultiSelect selalu kosong saat membuka form edit.
 */
export function mapKontakToForm(
  data: KontakDaruratApiData | null | undefined
): KontakDaruratFormData {
  return {
    name: data?.nama || "",
    icon: (data?.icon as IconKey) || "",
    kategoriId: Array.isArray(data?.kategoriId)
      ? (data?.kategoriId as string[])
      : data?.kontakItems?.map((item) => item.kontakItemId) || [],
  };
}
