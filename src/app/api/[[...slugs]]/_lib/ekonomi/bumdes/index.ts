import Elysia from "elysia";
import ProfilBumDes from "./profil";
import UnitUsahaBumDes from "./unit-usaha";

// Endpoint profil + unit usaha BUMDes; sejajar dengan struktur-bumdes (pengurus) yang tidak diubah.
const Bumdes = new Elysia({
  prefix: "/bumdes",
  tags: ["Ekonomi/BUMDes"],
})
  .use(ProfilBumDes)
  .use(UnitUsahaBumDes);

export default Bumdes;
