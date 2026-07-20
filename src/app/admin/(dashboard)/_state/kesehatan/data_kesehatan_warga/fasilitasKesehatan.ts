import { proxy } from "valtio";
import fasilitasKesehatan from "./fasilitasKesehatan/fasilitas-kesehatan";
import dokter from "./fasilitasKesehatan/dokter";
import tarif from "./fasilitasKesehatan/tarif";

const fasilitasKesehatanState = proxy({
  fasilitasKesehatan,
  dokter,
  tarif,
});

export default fasilitasKesehatanState;
