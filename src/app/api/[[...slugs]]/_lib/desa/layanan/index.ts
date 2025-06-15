import Elysia from "elysia";
import PelayananSuratKeterangan from "./pelayanan_surat_keterangan";

const LayananDesa = new Elysia({ prefix: "/layanan", tags: ["Desa/Layanan"] })
.use(PelayananSuratKeterangan)

export default LayananDesa
