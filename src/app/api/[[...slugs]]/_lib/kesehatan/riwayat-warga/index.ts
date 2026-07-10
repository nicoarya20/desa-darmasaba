import Elysia from "elysia";
import riwayatWargaFindMany from "./find-many";

const RiwayatWarga = new Elysia({
  prefix: "/riwayatwarga",
  tags: ["Kesehatan/RiwayatWarga"],
}).get("/find-many", riwayatWargaFindMany);

export default RiwayatWarga;
