import { proxy } from "valtio";
import dataPerpustakaan from "./perpustakaanDigital/data-perpustakaan";
import kategoriBuku from "./perpustakaanDigital/kategori-buku";
import peminjamanBuku from "./perpustakaanDigital/peminjaman-buku";
import websitePerpustakaan from "./perpustakaanDigital/website-perpustakaan";

const perpustakaanDigitalState = proxy({
  dataPerpustakaan,
  kategoriBuku,
  peminjamanBuku,
  websitePerpustakaan,
});

export default perpustakaanDigitalState;
