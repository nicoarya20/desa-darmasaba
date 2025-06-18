import Elysia from "elysia";
import PelayananSuratKeterangan from "./pelayanan_surat_keterangan";
import PelayananTelunjukSaktiDesa from "./pelayanan_telunjuk_sakti_desa";
import PelayananPerizinanBerusaha from "./pelayanan_perizinan_berusaha";
import PelayananPendudukNonPermanen from "./pelayanan_penduduk_non_permanen";

const LayananDesa = new Elysia({ prefix: "/layanan", tags: ["Desa/Layanan"] })
.use(PelayananSuratKeterangan)
.use(PelayananTelunjukSaktiDesa)
.use(PelayananPerizinanBerusaha)
.use(PelayananPendudukNonPermanen)

export default LayananDesa
