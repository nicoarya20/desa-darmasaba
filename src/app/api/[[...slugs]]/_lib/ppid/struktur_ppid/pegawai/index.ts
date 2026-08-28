import Elysia, { t } from "elysia";
import pegawaiFindMany from "./findMany";
import pegawaiFindUnique from "./findUnique";
import pegawaiCreate from "./create";
import pegawaiNonActive from "./nonActive";
import pegawaiActive from "./active";
import pegawaiUpdate from "./updt";
import pegawaiDelete from "./del";
import pegawaiFindManyAll from "./findManyAll";


const Pegawai = new Elysia({
  prefix: "/pegawai",
  tags: ["PPID/Struktur PPID/Pegawai"],
})

  // ✅ Find all
  .get("/find-many", pegawaiFindMany)

  // ✅ Find all (non-paginated)
  .get("/find-many-all", pegawaiFindManyAll)

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
        namaLengkap: t.String(),
        gelarAkademik: t.String(),
        imageId: t.String(),
        tanggalMasuk: t.String(),
        email: t.String(),
        telepon: t.String(),
        alamat: t.String(),
        posisiId: t.String(),
        isActive: t.Boolean(),
      }),
    }
  )

  // ✅ Non aktifkan (soft delete)
  .delete("/non-active/:id", pegawaiNonActive)

  // ✅ Aktifkan kembali
  .patch("/active/:id", pegawaiActive)

  // ✅ Delete
  .delete("/del/:id", pegawaiDelete);

export default Pegawai;
