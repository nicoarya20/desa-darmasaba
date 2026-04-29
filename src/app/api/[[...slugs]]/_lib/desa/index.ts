import Elysia from "elysia";
import Berita from "./berita";
import Pengumuman from "./pengumuman";
import ProfileDesa from "./profile/profile_desa";
import PotensiDesa from "./potensi";
import GalleryFoto from "./gallery/foto";
import GalleryVideo from "./gallery/video";
import LayananDesa from "./layanan";
import Penghargaan from "./penghargaan";
import KategoriPotensi from "./potensi/kategori-potensi";
import KategoriBerita from "./berita/kategori-berita";
import KategoriPengumuman from "./pengumuman/kategori-pengumuman";
import MantanPerbekel from "./profile/profile-mantan-perbekel";
import AjukanPermohonan from "./layanan/ajukan_permohonan";
import Musik from "./musik";
import KegiatanDesa from "./kegiatan-desa";


const Desa = new Elysia({ prefix: "/desa", tags: ["Desa"] })
  .use(Berita)
  .use(Pengumuman)
  .use(ProfileDesa)
  .use(PotensiDesa)
  .use(GalleryFoto)
  .use(GalleryVideo)
  .use(MantanPerbekel)
  .use(LayananDesa)
  .use(Penghargaan)
  .use(KategoriPotensi)
  .use(KategoriBerita)
  .use(KategoriPengumuman)
  .use(AjukanPermohonan)
  .use(Musik)
  .use(KegiatanDesa)


export default Desa;
