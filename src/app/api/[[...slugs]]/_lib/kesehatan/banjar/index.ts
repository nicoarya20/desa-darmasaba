import Elysia from "elysia";
import banjarFindMany from "./find-many";

const Banjar = new Elysia({
  prefix: "/banjar",
  tags: ["Kesehatan/Banjar"],
}).get("/find-many", banjarFindMany);

export default Banjar;
