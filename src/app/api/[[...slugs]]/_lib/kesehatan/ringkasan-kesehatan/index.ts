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
      imunisasiLengkapPct: t.Number({ minimum: 0, maximum: 100 }),
      pemeriksaanRutinPct: t.Number({ minimum: 0, maximum: 100 }),
      giziBaikPct: t.Number({ minimum: 0, maximum: 100 }),
      targetStuntingPct: t.Number({ minimum: 0, maximum: 100 }),
    }),
  });

export default RingkasanKesehatan;
