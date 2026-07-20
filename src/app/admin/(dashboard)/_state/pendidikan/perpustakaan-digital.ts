import { proxy } from "valtio";
import dataPerpustakaan from "./perpustakaanDigital/data-perpustakaan";
import kategoriBuku from "./perpustakaanDigital/kategori-buku";
import peminjamanBuku from "./perpustakaanDigital/peminjaman-buku";

const perpustakaanDigitalState = proxy({
  dataPerpustakaan,
  kategoriBuku,
  peminjamanBuku,
});

export default perpustakaanDigitalState;
