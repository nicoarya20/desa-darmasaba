import { parseCsvUmkm } from "@/lib/umkm/umkm-impor-csv";
import { bodyImporUmkm } from "@/lib/umkm/umkm-impor-pratinjau";
import { buatStateImpor } from "./buat-state-impor";
import umkm from "./umkm";

/** State modal impor CSV Data UMKM. */
const imporUmkm = buatStateImpor({
  endpoint: "/api/ekonomi/umkm/import",
  objek: "UMKM",
  parse: parseCsvUmkm,
  buatBody: bodyImporUmkm,
  muatUlang: () => umkm.findMany.load(1, 10, umkm.findMany.search),
});

export default imporUmkm;
