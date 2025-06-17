import SejarahDesa from "./sejarah";
import VisiMisiDesa from "./visi-misi";
import LambangDesa from "./lambang-desa";
import MaskotDesa from "./maskot-desa";
import Elysia from "elysia";

const ProfileDesa = new Elysia({
  prefix: "/profile",
  tags: ["Desa/Profile"],
})
  .use(SejarahDesa) 
  .use(VisiMisiDesa)
  .use(LambangDesa)
  .use(MaskotDesa);

export default ProfileDesa;
