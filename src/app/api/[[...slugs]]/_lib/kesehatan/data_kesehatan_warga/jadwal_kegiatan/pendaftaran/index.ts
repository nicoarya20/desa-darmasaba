import Elysia, { t } from "elysia"
import PendaftaranJadwalFindMany from "./find-many"
import PendaftaranJadwalCreate from "./create"

const PendaftaranJadwal = new Elysia({
  prefix: "/pendaftaranJadwalKegiatan",
  tags: ["Data Kesehatan/Jadwal Kegiatan/Pendaftaran Jadwal"],
})
.get("/find-many", PendaftaranJadwalFindMany)
.post("/create", PendaftaranJadwalCreate, {
  body: t.Object({
    name: t.String(),
    tanggal: t.String(),
    namaOrangtua: t.String(),
    nomor: t.String(),
    alamat: t.String(),
    catatan: t.String(),
  })
})

export default PendaftaranJadwal