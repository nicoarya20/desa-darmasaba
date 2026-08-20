"use client";

import { useEffect } from "react";
import { attachImageErrorRetry } from "./imageErrorRetry";

/**
 * Menangani dua penyebab gambar gagal load di Safari (task "Safari - Semua
 * Fitur"), keduanya lewat listener "error" global yang sama:
 *
 * 1. Retry otomatis untuk error jaringan transient (bug WebKit/Safari saat
 *    negosiasi HTTP/3-QUIC di Cloudflare — server & file sudah dikonfirmasi
 *    sehat lewat curl langsung ke endpoint /api/img/:name). Ini BUKAN fix
 *    akar: setting HTTP/3 ada di dashboard Cloudflare, di luar akses project
 *    ini. Retry mengurangi dampaknya tanpa perlu akses itu.
 * 2. Fallback format untuk Safari versi lama (pra-Safari 14) yang tidak bisa
 *    decode WebP sama sekali — kegagalan deterministic, bukan transient.
 *    Browser mendeteksi sendiri ketidakmampuannya lalu minta ulang gambar
 *    yang sama dengan ?format=jpeg, dikonversi on-the-fly di server
 *    (src/app/api/[[...slugs]]/_lib/img.ts). Browser modern tidak pernah
 *    memicu ini.
 *
 * Dipasang sekali di layout publik. Pakai capture-phase listener di
 * document karena event "error" pada <img> tidak bubble, jadi semua <img>
 * di halaman (termasuk yang dirender lewat Mantine <Image>) otomatis
 * ter-cover tanpa perlu menyentuh tiap halaman satu per satu.
 */
export function ImageErrorRetry() {
  useEffect(() => attachImageErrorRetry(), []);
  return null;
}
