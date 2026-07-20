import { proxy } from "valtio";
import polsekTerdekatState from "./polsekTerdekat/polsek-terdekat";
import layananPolsek from "./polsekTerdekat/layanan-polsek";

const statePolsekTerdekat = proxy({
  polsekTerdekatState,
  layananPolsek,
});

export default statePolsekTerdekat;
