import Elysia from "elysia";
import DesaDigital from "./desa-digital";

const Inovasi = new Elysia({
  prefix: "/api/inovasi",
  tags: ["Inovasi"],
})
  .use(DesaDigital)

export default Inovasi;
