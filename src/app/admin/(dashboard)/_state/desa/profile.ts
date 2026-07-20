import { proxy } from "valtio";
import lambangDesa from "./profile/lambang-desa";
import mantanPerbekel from "./profile/mantan-perbekel";
import maskotDesa from "./profile/maskot-desa";
import profilPerbekel from "./profile/profil-perbekel";
import sejarahDesa from "./profile/sejarah-desa";
import visiMisiDesa from "./profile/visi-misi-desa";

const stateProfileDesa = proxy({
  lambangDesa,
  maskotDesa,
  profilPerbekel,
  visiMisiDesa,
  sejarahDesa,
  mantanPerbekel,
});

export default stateProfileDesa;
