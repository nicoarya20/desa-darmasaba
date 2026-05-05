import Elysia from "elysia";
import pendidikanRingkasanStats from "./stats";

const RingkasanPendidikan = new Elysia({
  prefix: "/ringkasan",
  tags: ["Pendidikan/Ringkasan"],
}).get("/stats", pendidikanRingkasanStats);

export default RingkasanPendidikan;
