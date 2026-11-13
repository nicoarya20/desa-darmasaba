import { Elysia, t } from "elysia";
import { sampahHapus, sampahList, sampahPulihkan } from "./handlers";

const sumberParams = t.Object({ sumber: t.String() });
const itemParams = t.Object({ sumber: t.String(), id: t.String() });

// Sampah per fitur koleksi (khusus admin, dicek di handler). Kontrak: docs/decisions/2026-11-12-sampah.md.
const Sampah = new Elysia({ prefix: "/sampah", tags: ["Sampah"] })
  .get("/:sumber", sampahList, { params: sumberParams })
  .post("/:sumber/:id/pulihkan", sampahPulihkan, { params: itemParams })
  .delete("/:sumber/:id", sampahHapus, { params: itemParams });

export default Sampah;
