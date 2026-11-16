import Elysia, { t } from "elysia";
import pendaftaranJadwalKegiatanCreate from "./create";
import pendaftaranJadwalKegiatanDelete from "./del";
import pendaftaranJadwalKegiatanUpdate from "./updt";
import pendaftaranJadwalKegiatanFindUnique from "./findUnique";
import pendaftaranJadwalKegiatanFindMany from "./findMany";
import { guardDataPribadi } from "../../../../_data-pribadi/guard";

const PendaftaranJadwalKegiatan = new Elysia({
  prefix: "/pendaftaran-jadwal-kegiatan",
  tags: ["Kesehatan/Pendaftaran Jadwal Kegiatan"],
})
  .post("/create", pendaftaranJadwalKegiatanCreate, {
    body: t.Object({
      name: t.String(),
      tanggal: t.String(),
      namaOrangtua: t.String(),
      nomor: t.String(),
      alamat: t.String(),
      catatan: t.String(),
    }),
  })
  .get("/find-many", pendaftaranJadwalKegiatanFindMany, { beforeHandle: guardDataPribadi })
  .get("/:id", pendaftaranJadwalKegiatanFindUnique, { beforeHandle: guardDataPribadi })
  .delete("/del/:id", pendaftaranJadwalKegiatanDelete)
  .put(
    "/:id",
    pendaftaranJadwalKegiatanUpdate,
    {
      body: t.Object({
        name: t.String(),
        tanggal: t.String(),
        namaOrangtua: t.String(),
        nomor: t.String(),
        alamat: t.String(),
        catatan: t.String(),
      }),
    }
  );
export default PendaftaranJadwalKegiatan;
