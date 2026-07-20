import { proxy } from "valtio";
import kontakDaruratKeamananState from "./kontakDarurat/kontak-darurat-keamanan";
import kontakDaruratItem from "./kontakDarurat/kontak-darurat-item";

const kontakDarurat = proxy({ kontakDaruratKeamananState, kontakDaruratItem });

export default kontakDarurat;
