import { proxy } from "valtio";
import prestasiDesa from "./prestasiDesa/prestasi-desa";
import kategoriPrestasi from "./prestasiDesa/kategori-prestasi";

const prestasiState = proxy({ prestasiDesa, kategoriPrestasi });

export default prestasiState;
