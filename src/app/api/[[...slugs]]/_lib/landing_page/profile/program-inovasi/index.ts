import Elysia, { t } from "elysia";
import ProgramInovasiCreate from "./create";
import ProgramInovasiDelete from "./del";
import ProgramInovasiFindMany from "./findMany";
import ProgramInovasiFindUnique from "./findUnique";
import ProgramInovasiUpdate from "./updt";

const ProgramInovasi = new Elysia({
  prefix: "/programinovasi",
  tags: ["Landing Page/Profile/Program Inovasi"],
})

  // ✅ Find all
  .get("/findMany", ProgramInovasiFindMany)

  // ✅ Find by ID
  .get("/:id", ProgramInovasiFindUnique)

  // ✅ Create
  .post("/create", ProgramInovasiCreate, {
    body: t.Object({
      name: t.String(),
      description: t.String(),
      // Logo/cover opsional; string kosong/null disimpan sebagai null.
      imageId: t.Optional(t.Nullable(t.String())),
      // Galeri dokumentasi (id FileStorage); batas jumlah dicek di handler.
      imageIds: t.Optional(t.Array(t.String())),
      // Urutan tampil opsional (1 = paling depan); rentang & bilangan bulat dicek di handler.
      urutan: t.Optional(t.Nullable(t.Number())),
    }),
  })

  // ✅ Update
  .put("/:id", ProgramInovasiUpdate, {
    body: t.Object({
      name: t.Optional(t.String()),
      description: t.Optional(t.String()),
      // null/string kosong → logo dihapus.
      imageId: t.Optional(t.Nullable(t.String())),
      // Dikirim → galeri diganti (set); tidak dikirim → galeri tidak diubah.
      imageIds: t.Optional(t.Array(t.String())),
      // Dikirim → urutan diganti (null = dikosongkan); tidak dikirim → tidak diubah.
      urutan: t.Optional(t.Nullable(t.Number())),
    }),
  })
  // ✅ Delete
  .delete("/del/:id", ProgramInovasiDelete);

export default ProgramInovasi;
