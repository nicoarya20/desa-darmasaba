import Elysia from "elysia";
import ProfilBumDes from "./profil";
import UnitUsahaBumDes from "./unit-usaha";

// Endpoint profil + unit usaha BUMDes; struktur pengurus ada terpisah di struktur-bumdes (`/struktur-organisasi`).
const Bumdes = new Elysia({
  prefix: "/bumdes",
  tags: ["Ekonomi/BUMDes"],
})
  .use(ProfilBumDes)
  .use(UnitUsahaBumDes);

export default Bumdes;
