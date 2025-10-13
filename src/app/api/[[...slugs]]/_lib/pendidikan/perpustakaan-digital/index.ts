import Elysia from "elysia";
import DataPerpustakaan from "./data-perpustakaan";
import KategoriBuku from "./kategori-buku";
import PeminjamanBuku from "./peminjaman";

const PerpustakaanDigital = new Elysia({
  prefix: "/perpustakaandigital",
  tags: ["Pendidikan / Perpustakaan Digital"],
})
  .use(DataPerpustakaan)
  .use(KategoriBuku)
  .use(PeminjamanBuku);

export default PerpustakaanDigital;
