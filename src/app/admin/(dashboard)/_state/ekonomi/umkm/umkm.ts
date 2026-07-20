import { proxy } from "valtio";
import dashboard from "./umkmState/dashboard";
import kategoriProduk from "./umkmState/kategori-produk";
import penjualan from "./umkmState/penjualan";
import produk from "./umkmState/produk";
import umkm from "./umkmState/umkm";

export const umkmState = proxy({ umkm, produk, penjualan, kategoriProduk, dashboard });

export default umkmState;
