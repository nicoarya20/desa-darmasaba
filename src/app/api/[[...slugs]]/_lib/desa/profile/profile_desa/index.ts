import SejarahDesa from "./sejarah";
import VisiMisiDesa from "./visi-misi";
import LambangDesa from "./lambang-desa";
import MaskotDesa from "./maskot-desa";
import Elysia from "elysia";
import ProfilPerbekel from "../profilePerbekel";

const ProfileDesa = new Elysia({
  prefix: "/profile",
  tags: ["Desa/Profile"],
})
  .use(SejarahDesa) 
  .use(VisiMisiDesa)
  .use(LambangDesa)
  .use(MaskotDesa)
  .use(ProfilPerbekel);

export default ProfileDesa;
