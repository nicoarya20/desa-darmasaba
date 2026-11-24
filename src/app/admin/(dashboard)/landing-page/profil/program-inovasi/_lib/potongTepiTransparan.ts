'use client';
import { kotakIsiTidakTransparan } from './gambar-sisipan.logic';

/** Jenis berkas yang bisa punya kanal alpha; JPEG dan lainnya tidak pernah transparan, jadi dilewati. */
const BISA_TRANSPARAN = new Set(['image/png', 'image/webp', 'image/gif']);

/**
 * Potong tepi transparan gambar sisipan di browser sebelum dipratinjau/diunggah. Logo/maskot sering berupa PNG
 * berkanvas lebar dengan figur kecil di tengah, sehingga di deskripsi yang rata kiri figurnya tampak menjorok.
 * Hasil berupa PNG (alpha tetap); berkas asli dikembalikan bila tidak transparan, tepinya tipis, atau browser
 * gagal membaca gambar (pratinjau tetap jalan dengan berkas asli; galat dicatat dengan nama berkas).
 */
export async function potongTepiTransparan(file: File): Promise<File> {
  if (!BISA_TRANSPARAN.has(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const kanvas = document.createElement('canvas');
    kanvas.width = bitmap.width;
    kanvas.height = bitmap.height;
    const ctx = kanvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0);
    const kotak = kotakIsiTidakTransparan(ctx.getImageData(0, 0, kanvas.width, kanvas.height).data, kanvas.width, kanvas.height);
    if (!kotak) return file;

    const hasil = document.createElement('canvas');
    hasil.width = kotak.w;
    hasil.height = kotak.h;
    hasil.getContext('2d')?.drawImage(bitmap, kotak.x, kotak.y, kotak.w, kotak.h, 0, 0, kotak.w, kotak.h);
    const blob = await new Promise<Blob | null>((resolve) => hasil.toBlob(resolve, 'image/png'));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.png', { type: 'image/png' });
  } catch (error) {
    console.warn(`Gagal memotong tepi transparan gambar sisipan "${file.name}", memakai berkas asli:`, error);
    return file;
  }
}
