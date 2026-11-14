import ApiFetch from '@/lib/api-fetch';
import { useState } from 'react';
import {
  PESAN_KONEKSI_GAGAL,
  buildOrderMessage,
  buildWaUrl,
  isPesananBerhasil,
  normalizeWaNumber,
  pesanErrorMessage,
} from '../../_lib/pesanan';
import type { OrderForm } from '../PesananModal';
import type { DetailProduk } from './detail-produk.types';

const DEFAULT_FORM: OrderForm = { nama: '', jumlah: 1, catatan: '' };

/**
 * Alur pesanan lewat website (dipindah utuh dari halaman detail lama): validasi form, catat pesanan di server,
 * lalu konfirmasi + tautan WhatsApp. Hanya dipakai saat `UMKM_PESANAN_TERCATAT` true.
 * `onTercatat` dipanggil saat modal konfirmasi ditutup agar stok dimuat ulang.
 */
export function usePesananProduk(produk: DetailProduk, onTercatat: () => void) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<OrderForm>(DEFAULT_FORM);
  const [error, setError] = useState('');
  // Terisi setelah pesanan tercatat: modal berganti ke tampilan konfirmasi.
  // waUrl null = nomor WA penjual tidak valid (WhatsApp tidak dibuka).
  const [ordered, setOrdered] = useState<{ waUrl: string | null } | null>(null);
  const total = form.jumlah * produk.harga;

  const close = () => {
    const perluRefreshStok = ordered !== null;
    setModalOpen(false);
    setError('');
    setForm(DEFAULT_FORM);
    setOrdered(null);
    if (perluRefreshStok) onTercatat();
  };

  const submit = async () => {
    if (!form.nama.trim()) {
      setError('Nama pemesan wajib diisi');
      return;
    }
    if (!Number.isInteger(form.jumlah) || form.jumlah < 1) {
      setError('Jumlah minimal 1 dan berupa bilangan bulat');
      return;
    }
    if (form.jumlah > produk.stok) {
      setError(`Stok tersedia hanya ${produk.stok}`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Harga tidak dikirim: server mengambilnya dari DB (endpoint publik).
      const res = await ApiFetch.api.ekonomi.umkm.penjualan.pesan.post({ produkId: produk.id, jumlah: form.jumlah });
      if (!isPesananBerhasil(res)) {
        setError(pesanErrorMessage(res));
        return;
      }
      // WhatsApp TIDAK dibuka otomatis lewat window.open setelah await: browser HP memblokirnya
      // (user-activation hilang) dan di laptop tab WhatsApp menutupi status pesanan.
      const waNumber = normalizeWaNumber(produk.penjual?.kontak);
      const message = buildOrderMessage({
        umkmNama: produk.penjual?.nama,
        produkNama: produk.nama,
        jumlah: form.jumlah,
        satuan: produk.satuan,
        harga: produk.harga,
        total,
        pemesan: form.nama,
        catatan: form.catatan,
      });
      setOrdered({ waUrl: waNumber ? buildWaUrl(waNumber, message) : null });
    } catch (e) {
      // Gagal jaringan (fetch melempar): pesanan tidak sampai ke server; warga diberi pesan koneksi.
      console.error(`Gagal mengirim pesanan produk UMKM ${produk.id}:`, e);
      setError(PESAN_KONEKSI_GAGAL);
    } finally {
      setLoading(false);
    }
  };

  return { modalOpen, open: () => setModalOpen(true), close, form, setForm, error, loading, ordered, submit };
}
