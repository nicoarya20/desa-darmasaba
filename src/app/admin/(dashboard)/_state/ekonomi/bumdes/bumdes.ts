import fotoProfilBumdes from "./foto-profil";
import profilBumdes from "./profil";
import unitUsahaBumdes from "./unit-usaha";

/** Re-export state BUMDes (profil + galeri foto + unit usaha); pengurus tetap di `struktur-organisasi`. */
const stateBumdes = { profil: profilBumdes, fotoProfil: fotoProfilBumdes, unitUsaha: unitUsahaBumdes };

export default stateBumdes;
