import Elysia from "elysia";
import Berita from "./berita";
import Pengumuman from "./pengumuman";

const Desa = new Elysia({ prefix: "/api/desa", tags: ["Desa"] })
  .use(Berita)
  .use(Pengumuman)

export default Desa;
