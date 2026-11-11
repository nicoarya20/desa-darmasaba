import Elysia from "elysia";
import PegawaiPerangkatDesa from "./pegawai";
import PosisiPerangkatDesa from "./posisi";

/** API Struktur Perangkat Desa (`/desa/strukturperangkat`) — tabel sendiri, terpisah dari PPID/BumDes. */
const StrukturPerangkatDesa = new Elysia({
  prefix: "/strukturperangkat",
  tags: ["Desa/Struktur Perangkat Desa"],
})
  .use(PosisiPerangkatDesa)
  .use(PegawaiPerangkatDesa);

export default StrukturPerangkatDesa;
