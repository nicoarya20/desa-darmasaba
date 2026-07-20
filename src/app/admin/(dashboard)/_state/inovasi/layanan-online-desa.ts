import { proxy } from "valtio";
import administrasiOnline from "./layananOnlineDesa/administrasi-online";
import jenisPengaduan from "./layananOnlineDesa/jenis-pengaduan";
import jenisLayanan from "./layananOnlineDesa/jenis-layanan";
import pengaduanMasyarakat from "./layananOnlineDesa/pengaduan-masyarakat";

const layananonlineDesa = proxy({
  administrasiOnline,
  jenisLayanan,
  pengaduanMasyarakat,
  jenisPengaduan,
});

export default layananonlineDesa;
