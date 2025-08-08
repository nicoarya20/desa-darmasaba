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


const Desa = new Elysia({ prefix: "/api/desa", tags: ["Desa"] })
  .use(Berita)
  .use(Pengumuman)
  .use(ProfileDesa)
  .use(PotensiDesa)
  .use(GalleryFoto)
  .use(GalleryVideo)
  .use(LayananDesa)
  .use(Penghargaan)
  .use(KategoriPotensi)
  .use(KategoriBerita)
  .use(KategoriPengumuman)

export default Desa;
