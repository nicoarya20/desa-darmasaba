import Elysia, { t } from "elysia";
import unitUsahaCreate from "./create";
import unitUsahaDelete from "./del";
import unitUsahaFindMany from "./findMany";
import unitUsahaFindUnique from "./findUnique";
import unitUsahaUpdate from "./updt";

const bodyFields = {
  nama: t.String(),
  deskripsi: t.String(),
  imageId: t.Optional(t.Nullable(t.String())),
  urutan: t.Optional(t.Number()),
  isActive: t.Optional(t.Boolean()),
};

const UnitUsahaBumDes = new Elysia({
  prefix: "/unit-usaha",
  tags: ["Ekonomi/BUMDes/Unit Usaha"],
})
  .get("/find-many", unitUsahaFindMany)
  .get("/:id", unitUsahaFindUnique)
  .post("/create", unitUsahaCreate, { body: t.Object(bodyFields) })
  .put("/:id", unitUsahaUpdate, {
    params: t.Object({ id: t.String() }),
    body: t.Partial(t.Object(bodyFields)),
  })
  .delete("/del/:id", unitUsahaDelete, {
    params: t.Object({ id: t.String() }),
  });

export default UnitUsahaBumDes;
