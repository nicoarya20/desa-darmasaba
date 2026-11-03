// src/app/api/[[...slugs]]/_lib/landing_page/hari-libur/index.ts
import Elysia from "elysia";
import cekHariLibur from "./cekHariLibur";

const HariLibur = new Elysia({
  prefix: "/harilibur",
  tags: ["Landing Page/Hari Libur"],
})
  // ✅ Cek apakah tanggal tertentu adalah hari libur nasional (sumber: Google Calendar Indonesia)
  .get("/cek", cekHariLibur);

export default HariLibur;
