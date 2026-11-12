import Elysia from "elysia";
import Berita from "./berita";
import Pengumuman from "./pengumuman";
import ProfileDesa from "./profile/profile_desa";
import PotensiDesa from "./potensi";
import GalleryFoto from "./gallery/foto";
import GalleryVideo from "./gallery/video";
import LayananDesa from "./layanan";
import KategoriPotensi from "./potensi/kategori-potensi";
import KategoriBerita from "./berita/kategori-berita";
import KategoriPengumuman from "./pengumuman/kategori-pengumuman";
import MantanPerbekel from "./profile/profile-mantan-perbekel";
import AjukanPermohonan from "./layanan/ajukan_permohonan";
import Musik from "./musik";
import KegiatanDesa from "./kegiatan-desa";
import KategoriKegiatan from "./kegiatan-desa/kategori-kegiatan";
import EventBudaya from "./event-budaya";
import Banjar from "./banjar";
import DokumenPerencanaan from "./dokumen-perencanaan";
import StrukturPerangkatDesa from "./struktur-perangkat";


const Desa = new Elysia({ prefix: "/desa", tags: ["Desa"] })
  .use(Berita)
  .use(Pengumuman)
  .use(ProfileDesa)
  .use(PotensiDesa)
  .use(GalleryFoto)
  .use(GalleryVideo)
  .use(MantanPerbekel)
  .use(LayananDesa)
  .use(KategoriPotensi)
  .use(KategoriBerita)
  .use(KategoriPengumuman)
  .use(AjukanPermohonan)
  .use(Musik)
  .use(KegiatanDesa)
  .use(KategoriKegiatan)
  .use(EventBudaya)
  .use(Banjar)
  .use(DokumenPerencanaan)
  .use(StrukturPerangkatDesa)


export default Desa;
