import Elysia, { t } from "elysia";
import cctvCreate from "./create";
import cctvFindMany from "./findMany";
import cctvFindUnique from "./findUnique";
import cctvUpdate from "./updt";
import cctvDelete from "./del";
import cctvStats from "./stats";

const CctvKeamanan = new Elysia({
  prefix: "cctv",
  tags: ["Keamanan/CCTV"],
})
  .get("/stats", cctvStats)
  .get("/find-many", cctvFindMany)
  .get("/:id", cctvFindUnique)
  .post("/create", cctvCreate, {
    body: t.Object({
      kode: t.String(),
      nama: t.String(),
      lokasi: t.String(),
      latitude: t.Optional(t.Number()),
      longitude: t.Optional(t.Number()),
      status: t.Optional(t.Union([t.Literal("Online"), t.Literal("Offline")])),
      lastActive: t.Optional(t.String()),
    }),
  })
  .put("/:id", cctvUpdate, {
    body: t.Object({
      kode: t.String(),
      nama: t.String(),
      lokasi: t.String(),
      latitude: t.Optional(t.Number()),
      longitude: t.Optional(t.Number()),
      status: t.Union([t.Literal("Online"), t.Literal("Offline")]),
      lastActive: t.Optional(t.String()),
    }),
  })
  .delete("/del/:id", cctvDelete);

export default CctvKeamanan;
