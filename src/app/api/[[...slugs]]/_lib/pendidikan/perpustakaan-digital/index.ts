import Elysia from "elysia";
import DataPerpustakaan from "./data-perpustakaan";
import KategoriBuku from "./kategori-buku";

const PerpustakaanDigital = new Elysia({
  prefix: "/perpustakaandigital",
  tags: ["Pendidikan / Perpustakaan Digital"],
})
  .use(DataPerpustakaan)
  .use(KategoriBuku);

export default PerpustakaanDigital;
