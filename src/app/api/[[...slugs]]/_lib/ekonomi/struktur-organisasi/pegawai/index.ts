import Elysia, { t } from "elysia";
import pegawaiFindMany from "./findMany";
import pegawaiFindUnique from "./findUnique";
import pegawaiCreate from "./create";
import pegawaiDelete from "./del";
import pegawaiUpdate from "./updt";

const Pegawai = new Elysia({
  prefix: "/pegawai",
  tags: ["Ekonomi/Struktur Organisasi/Pegawai"],
})

  // ✅ Find all
  .get("/find-many", pegawaiFindMany)

  // ✅ Find by ID
  .get("/:id", async (context) => {
    const response = await pegawaiFindUnique(context);
    return response;
  })

  // ✅ Create
  .post("/create", pegawaiCreate, {
    body: t.Object({
      namaLengkap: t.String(),
      gelarAkademik: t.Optional(t.String()),
      imageId: t.String(),
      tanggalMasuk: t.Optional(t.String()), // ISO string (YYYY-MM-DD)
      email: t.Optional(t.String()),
      telepon: t.Optional(t.String()),
      alamat: t.Optional(t.String()),
      posisiId: t.String(),
    }),
  })

  // ✅ Update
  .put(
    "/:id",
    async (context) => {
      const response = await pegawaiUpdate(context);
      return response;
    },
    {
      body: t.Object({
        id: t.String(),
        namaLengkap: t.Optional(t.String()),
        gelarAkademik: t.Optional(t.String()),
        imageId: t.String(),
        tanggalMasuk: t.Optional(t.String()),
        email: t.Optional(t.String()),
        telepon: t.Optional(t.String()),
        alamat: t.Optional(t.String()),
        posisiId: t.Optional(t.String()),
        aktif: t.Optional(t.Boolean()),
      }),
    }
  )

  // ✅ Delete
  .delete("/del/:id", pegawaiDelete);

export default Pegawai;
