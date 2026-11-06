import Elysia, { t } from "elysia";
import eventBudayaFindMany from "./find-many";
import eventBudayaFindUpcoming from "./find-upcoming";
import eventBudayaFindUnique from "./findUnique";
import eventBudayaCreate from "./create";
import eventBudayaDelete from "./del";
import eventBudayaUpdate from "./updt";

const EventBudaya = new Elysia({ prefix: "/eventbudaya", tags: ["Desa/Event Budaya"] })
  .get("/find-many", eventBudayaFindMany)
  .get("/find-upcoming", eventBudayaFindUpcoming)
  .get("/:id", eventBudayaFindUnique)
  .post("/create", eventBudayaCreate, {
    body: t.Object({
      nama: t.String(),
      tanggal: t.String(),
      lokasi: t.String(),
      deskripsi: t.Optional(t.String()),
      kategori: t.Optional(t.String()),
      tanggalSelesai: t.Optional(t.Union([t.String(), t.Null()])),
    }),
  })
  .put("/:id", eventBudayaUpdate, {
    body: t.Object({
      nama: t.String(),
      tanggal: t.String(),
      lokasi: t.String(),
      deskripsi: t.Optional(t.String()),
      kategori: t.Optional(t.String()),
      tanggalSelesai: t.Optional(t.Union([t.String(), t.Null()])),
    }),
  })
  .delete("/del/:id", eventBudayaDelete);

export default EventBudaya;
