import Elysia, { t } from "elysia";
import hubunganOrganisasiFindMany from "./findMany";
import hubunganOrganisasiFindUnique from "./findUnique";
import hubunganOrganisasiCreate from "./create";
import hubunganOrganisasiUpdate from "./updt";
import hubunganOrganisasiDelete from "./del";


const HubunganOrganisasi = new Elysia({
  prefix: "/hubungan-organisasi",
  tags: ["Ekonomi/Struktur Organisasi/Hubungan Organisasi"],
})

  // 🔍 GET /find-many
  .get("/find-many", hubunganOrganisasiFindMany)

  // 🔍 GET /:id
  .get("/:id", async (context) => {
    return await hubunganOrganisasiFindUnique(context);
  })

  // ➕ POST /create
  .post("/create", hubunganOrganisasiCreate, {
    body: t.Object({
      atasanId: t.String(),
      bawahanId: t.String(),
      tipe: t.Optional(t.String()),
    }),
  })

  // ✏️ PUT /:id
  .put( "/:id",
      async (context) => {
        const response = await hubunganOrganisasiUpdate(context);
        return response;
      }, {
    body: t.Object({
      id: t.String(),
      atasanId: t.Optional(t.String()),
      bawahanId: t.Optional(t.String()),
      tipe: t.Optional(t.String()),
    }),
  })

  // ❌ DELETE /:id
  .delete("/:id", hubunganOrganisasiDelete);

export default HubunganOrganisasi;
