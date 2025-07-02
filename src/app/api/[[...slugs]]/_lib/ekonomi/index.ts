import Elysia from "elysia";
import PasarDesa from "./pasar-desa";
import KategoriMakanan from "./kategori-makanan";
import LowonganKerja from "./lowongan-kerja";

const Ekonomi = new Elysia({
  prefix: "/api/ekonomi",
  tags: ["Ekonomi"],
})
.use(PasarDesa)
.use(KategoriMakanan)
.use(LowonganKerja)

export default Ekonomi