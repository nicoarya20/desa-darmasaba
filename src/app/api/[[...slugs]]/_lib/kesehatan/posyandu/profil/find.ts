import { muatProfilPosyandu } from "./profil.data";

/** GET publik: deskripsi umum posyandu + kegiatan per klaster (tanpa data pribadi). */
export default async function profilPosyanduFind() {
  const data = await muatProfilPosyandu();
  return {
    success: true,
    message: data.profil ? "Berhasil mengambil profil posyandu" : "Profil posyandu belum diisi",
    data,
  };
}
