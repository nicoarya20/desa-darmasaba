"use client";

import { useEffect } from "react";
import { attachImageErrorRetry } from "./imageErrorRetry";

/**
 * Mitigasi client-side untuk gambar yang gagal load karena error jaringan
 * transient (bug WebKit/Safari saat negosiasi HTTP/3-QUIC di Cloudflare —
 * server & file sudah dikonfirmasi sehat lewat curl langsung ke endpoint
 * /api/img/:name, lihat task "Safari - Semua Fitur"). Ini BUKAN fix akar:
 * setting HTTP/3 ada di dashboard Cloudflare, di luar akses project ini.
 * Retry otomatis di sini mengurangi dampaknya di Safari tanpa perlu akses
 * itu.
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
