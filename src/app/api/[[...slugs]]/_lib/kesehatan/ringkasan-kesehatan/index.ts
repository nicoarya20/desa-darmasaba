import Elysia, { t } from "elysia";
import ringkasanKesehatanFindUnique from "./findUnique";
import ringkasanKesehatanUpdate from "./updt";

const RingkasanKesehatan = new Elysia({ prefix: "/ringkasankesehatan", tags: ["Kesehatan/Ringkasan"] })
  .get("/find", ringkasanKesehatanFindUnique)
  .put("/update", ringkasanKesehatanUpdate, {
    body: t.Object({
      ibuHamilAkh: t.Number(),
      balitaTerdaftar: t.Number(),
      alertStunting: t.Number(),
    }),
  });

export default RingkasanKesehatan;
