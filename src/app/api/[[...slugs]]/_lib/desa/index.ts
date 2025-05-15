import Elysia from "elysia";
import Berita from "./berita";
import Pengumuman from "./pengumuman";
import ProfileDesa from "./profile/profile_desa";

const Desa = new Elysia({ prefix: "/api/desa", tags: ["Desa"] })
  .use(Berita)
  .use(Pengumuman)
  .use(ProfileDesa)

export default Desa;
