import type { FotoGaleriItem } from '@/lib/konten-bersama/konten-bersama.types'

/** Teks alt foto galeri: keterangan bila ada, selain itu "Foto {pemilik} {n}". */
export function altFoto(f: FotoGaleriItem, i: number, namaPemilik: string): string {
  return f.keterangan ?? `Foto ${namaPemilik} ${i + 1}`
}

/** Index tujuan setelah melangkah satu foto; berhenti di foto pertama/terakhir (tanpa wrap). */
export function langkahFoto(index: number, delta: -1 | 1, total: number): number {
  return Math.min(Math.max(index + delta, 0), Math.max(total - 1, 0))
}
