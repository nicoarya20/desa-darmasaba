import { proxy } from "valtio";
import stateStruktur from "./strukturOrganisasi/state-struktur";
import posisiOrganisasi from "./strukturOrganisasi/posisi-organisasi";
import pegawai from "./strukturOrganisasi/pegawai";

const stateStrukturBumDes = proxy({
  stateStruktur,
  posisiOrganisasi,
  pegawai,
});

export default stateStrukturBumDes;
