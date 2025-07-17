import Elysia from "elysia";
import PengelolaanSampah from "./pengelolaan-sampah";

const Lingkungan = new Elysia({
  prefix: "/api/lingkungan",
  tags: ["Lingkungan"],
})

.use(PengelolaanSampah)

export default Lingkungan;
