import { t } from "elysia";
import { strukturPerangkatPlugin } from "../plugin";
import posisiCreate from "./create";
import posisiDelete from "./del";
import posisiFindManyAll from "./findManyAll";
import posisiFindUnique from "./findUnique";
import posisiUpdate from "./updt";

const optionalText = t.Optional(t.Nullable(t.String()));

const createBody = t.Object({
  nama: t.String(),
  hierarki: t.Number(),
  deskripsi: optionalText,
  urutan: t.Optional(t.Number()),
  parentId: optionalText,
});

const updateBody = t.Object({
  ...createBody.properties,
  isActive: t.Optional(t.Boolean()),
});

const idParams = t.Object({ id: t.String() });

/** Rute jabatan Struktur Perangkat Desa (`/posisi/*`). */
const PosisiPerangkatDesa = strukturPerangkatPlugin("/posisi", "Desa/Struktur Perangkat Desa/Jabatan")
  .get("/find-many-all", posisiFindManyAll)
  .get("/:id", posisiFindUnique, { params: idParams })
  .post("/create", posisiCreate, { body: createBody })
  .put("/:id", posisiUpdate, { params: idParams, body: updateBody })
  .delete("/del/:id", posisiDelete, { params: idParams });

export default PosisiPerangkatDesa;
