import { proxy } from "valtio";
import dashboard from "./umkmState/dashboard";
import hargaPublik from "./umkmState/harga-publik";
import kategoriProduk from "./umkmState/kategori-produk";
import penjualan from "./umkmState/penjualan";
import produk from "./umkmState/produk";
import imporProduk from "./umkmState/produk-impor";
import umkm from "./umkmState/umkm";
import imporUmkm from "./umkmState/umkm-impor";

export const umkmState = proxy({ umkm, imporUmkm, produk, imporProduk, hargaPublik, penjualan, kategoriProduk, dashboard });

export default umkmState;
