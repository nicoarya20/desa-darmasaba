import { parseCsvProduk } from "@/lib/umkm/produk-impor-csv";
import { bodyImporProduk } from "@/lib/umkm/umkm-impor-pratinjau";
import { buatStateImpor } from "./buat-state-impor";
import produk from "./produk";

/** State modal impor CSV Produk UMKM. */
const imporProduk = buatStateImpor({
  endpoint: "/api/ekonomi/umkm/produk/import",
  objek: "produk",
  parse: parseCsvProduk,
  buatBody: bodyImporProduk,
  muatUlang: () => produk.findMany.load(1, 10, produk.findMany.search),
});

export default imporProduk;
