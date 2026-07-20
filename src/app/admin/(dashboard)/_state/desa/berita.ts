import { proxy } from "valtio";
import berita from "./berita/berita";
import kategoriBerita from "./berita/kategori-berita";

const stateDashboardBerita = proxy({ kategoriBerita, berita });

export default stateDashboardBerita;
