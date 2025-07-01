import Elysia from "elysia";
import PasarDesa from "./pasar-desa";
import KategoriMakanan from "./kategori-makanan";

const Ekonomi = new Elysia({
  prefix: "/api/ekonomi",
  tags: ["Ekonomi"],
})
.use(PasarDesa)
.use(KategoriMakanan)

export default Ekonomi