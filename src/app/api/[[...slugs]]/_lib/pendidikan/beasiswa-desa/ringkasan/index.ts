import Elysia from "elysia";
import beasiswaRingkasanStats from "./stats";

const RingkasanBeasiswa = new Elysia({
  prefix: "/ringkasan",
  tags: ["Pendidikan/Beasiswa Desa"],
}).get("/stats", beasiswaRingkasanStats);

export default RingkasanBeasiswa;
