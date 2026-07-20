import { proxy } from "valtio";
import kegiatanDesa from "./gotongRoyong/kegiatan-desa";
import kategoriKegiatan from "./gotongRoyong/kategori-kegiatan";

const gotongRoyongState = proxy({ kegiatanDesa, kategoriKegiatan });

export default gotongRoyongState;
