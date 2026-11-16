/** Konstanta hub Layanan Online Desa (`/inovasi/layanan-online-desa`). */

export const LAYANAN_ONLINE_HREF = "/inovasi/layanan-online-desa";

export const ADMINISTRASI_ONLINE_HREF = `${LAYANAN_ONLINE_HREF}/administrasi-online`;

/** Parameter hub yang membuka formulir pengaduan saat dimuat (tujuan alih route lama `/pengaduan-masyarakat`). */
export const LAYANAN_PARAM = "layanan";
export const LAYANAN_PENGADUAN = "pengaduan";

export const PENGADUAN_HUB_HREF = `${LAYANAN_ONLINE_HREF}?${LAYANAN_PARAM}=${LAYANAN_PENGADUAN}`;
