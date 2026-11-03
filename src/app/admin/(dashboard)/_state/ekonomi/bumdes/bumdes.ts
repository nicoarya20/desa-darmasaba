import profilBumdes from "./profil";
import unitUsahaBumdes from "./unit-usaha";

/** Re-export state BUMDes (profil + unit usaha); pengurus tetap di `struktur-organisasi`. */
const stateBumdes = { profil: profilBumdes, unitUsaha: unitUsahaBumdes };

export default stateBumdes;
