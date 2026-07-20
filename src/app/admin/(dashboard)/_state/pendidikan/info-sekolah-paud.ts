import { proxy } from "valtio";
import jenjangPendidikan from "./infoSekolahPaud/jenjang-pendidikan";
import lembagaPendidikan from "./infoSekolahPaud/lembaga-pendidikan";
import pengajar from "./infoSekolahPaud/pengajar";
import siswa from "./infoSekolahPaud/siswa";

const infoSekolahPaud = proxy({
  jenjangPendidikan,
  lembagaPendidikan,
  siswa,
  pengajar,
});

export default infoSekolahPaud;
