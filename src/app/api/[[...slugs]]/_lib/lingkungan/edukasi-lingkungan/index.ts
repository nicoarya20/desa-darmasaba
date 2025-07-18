import Elysia from "elysia";
import TujuanEdukasiLingkungan from "./tujuan-edukasi-lingkungan";
import MateriEdukasiLingkungan from "./materi-edukasi-lingkunga";
import ContohKegiatanDesa from "./contoh-kegiatan-desa";

const EdukasiLingkungan = new Elysia({
    prefix: "/edukasilingkungan",
    tags: ["Lingkungan/Edukasi Lingkungan"]
})
.use(TujuanEdukasiLingkungan)
.use(MateriEdukasiLingkungan)
.use(ContohKegiatanDesa)

export default EdukasiLingkungan; 