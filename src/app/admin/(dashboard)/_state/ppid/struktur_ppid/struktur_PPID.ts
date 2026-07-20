import { proxy } from "valtio";
import pegawai from "./strukturPPID/pegawai";
import posisiOrganisasi from "./strukturPPID/posisi-organisasi";
import stateStruktur from "./strukturPPID/state-struktur";

const stateStrukturPPID = proxy({
  stateStruktur,
  posisiOrganisasi,
  pegawai,
});

export default stateStrukturPPID;
