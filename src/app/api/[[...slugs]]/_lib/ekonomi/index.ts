import Elysia from "elysia";
import PasarDesa from "./pasar-desa";
import LowonganKerja from "./lowongan-kerja";
import ProgramKemiskinan from "./program-kemiskinan";
import KategoriProduk from "./pasar-desa/kategori-produk";

const Ekonomi = new Elysia({
  prefix: "/api/ekonomi",
  tags: ["Ekonomi"],
})
.use(PasarDesa)
.use(KategoriProduk)
.use(LowonganKerja)
.use(ProgramKemiskinan)

export default Ekonomi