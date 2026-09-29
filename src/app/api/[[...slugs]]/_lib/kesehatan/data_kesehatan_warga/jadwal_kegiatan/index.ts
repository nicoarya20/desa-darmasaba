import Elysia, { t } from "elysia";
import jadwalKegiatanCreate from "./create";
import jadwalKegiatanFindMany from "./findMany";
import jadwalKegiatanDelete from "./del";
import jadwalKegiatanFindUnique from "./findUnique";
import jadwalKegiatanUpdate from "./updt";

const JadwalKegiatan = new Elysia({
  prefix: "jadwal-kegiatan",
  tags: ["Kesehatan/Jadwal Kegiatan"],
})
  .post("/create", jadwalKegiatanCreate, {
    body: t.Object({
      content: t.String(),
      informasiJadwalKegiatan: t.Object({
        name: t.String(),
        tanggal: t.String(),
        waktu: t.String(),
        lokasi: t.String(),
      }),
      deskripsiJadwalKegiatan: t.Object({
        deskripsi: t.String(),
      }),
      layananJadwalKegiatan: t.Object({
        content: t.String(),
      }),
      syaratKetentuanJadwalKegiatan: t.Object({
        content: t.String(),
      }),
      dokumenJadwalKegiatan: t.Object({
        content: t.String(),
      }),
    }),
  })
  .get("/find-many", jadwalKegiatanFindMany)
  .delete("/del/:id", jadwalKegiatanDelete)
  .get("/:id", async (context) => {
    const response = await jadwalKegiatanFindUnique(
      context.request
    );
    return response;
  })
  .put(
    "/:id",
    async (context) => {
      const response = await jadwalKegiatanUpdate(context);
      return response;
    },
    {
      body: t.Object({
        content: t.String(),
        informasiJadwalKegiatan: t.Object({
          name: t.String(),
          tanggal: t.String(),
          waktu: t.String(),
          lokasi: t.String(),
        }),
        deskripsiJadwalKegiatan: t.Object({
          deskripsi: t.String(),
        }),
        layananJadwalKegiatan: t.Object({
          content: t.String(),
        }),
        syaratKetentuanJadwalKegiatan: t.Object({
          content: t.String(),
        }),
        dokumenJadwalKegiatan: t.Object({
          content: t.String(),
        }),
      }),
    }
  );
export default JadwalKegiatan;
