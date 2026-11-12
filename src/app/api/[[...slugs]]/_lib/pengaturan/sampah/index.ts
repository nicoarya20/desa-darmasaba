import { Elysia, t } from "elysia";
import { sampahHapus, sampahKosongkan, sampahList, sampahPratinjau, sampahPulihkan } from "./handlers";

const params = t.Object({ id: t.String() });

// Pengaturan → Sampah (khusus role 0/1, dicek di handler). Kontrak: docs/decisions/2026-11-12-sampah.md.
const Sampah = new Elysia({ prefix: "/pengaturan/sampah", tags: ["Pengaturan/Sampah"] })
  .get("/", sampahList)
  .delete("/", sampahKosongkan)
  .post("/:id/pulihkan", sampahPulihkan, { params })
  .get("/:id/pratinjau", sampahPratinjau, { params })
  .delete("/:id", sampahHapus, { params });

export default Sampah;
