import Elysia, { t } from "elysia";
import ringkasanKesehatanFindUnique from "./findUnique";
import ringkasanKesehatanUpdate from "./updt";
import ringkasanKesehatanStats from "./stats";

const RingkasanKesehatan = new Elysia({ prefix: "/ringkasankesehatan", tags: ["Kesehatan/Ringkasan"] })
  .get("/find", ringkasanKesehatanFindUnique)
  .get("/stats", ringkasanKesehatanStats)
  .put("/update", ringkasanKesehatanUpdate, {
    body: t.Object({
      targetStuntingPct: t.Number({ minimum: 0, maximum: 100 }),
    }),
  });

export default RingkasanKesehatan;
