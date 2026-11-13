/** Kontrak data katalog UMKM publik: bentuk yang dibaca kartu, dihasilkan adapter data. */
export type KatalogRef = { id: string; nama: string };

export type KatalogProduk = {
  id: string;
  nama: string;
  harga: number;
  satuan: string | null;
  stok: number;
  isUnggulan: boolean;
  createdAt: string;
  imageUrl: string | null;
  umkm: KatalogRef | null; // nama toko (baris "merek")
  kategori: KatalogRef | null; // dari kategoriProduk
};

export type KatalogToko = {
  id: string;
  nama: string;
  pemilik: string;
  alamat: string | null;
  imageUrl: string | null;
  kategori: KatalogRef | null;
  createdAt: string;
};
