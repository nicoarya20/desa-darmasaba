'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import { DaftarPanel } from '@/app/admin/(dashboard)/_com/struktur-organisasi/DaftarPanel';
import { PosisiTable } from '@/app/admin/(dashboard)/_com/struktur-organisasi/PosisiTable';
import { alasanTolakHapus, type PosisiRow } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.logic';
import { STRUKTUR_ADMIN_TEXT as TA } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.text';
import { statePosisiPerangkat } from '@/app/admin/(dashboard)/_state/desa/struktur-perangkat';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { STRUKTUR_PERANGKAT_ROUTES as R } from '../_com/struktur-perangkat.routes';
import { STRUKTUR_PERANGKAT_ADMIN_TEXT as T } from '../_com/struktur-perangkat.text';

/** Teks konfirmasi hapus + peringatan bila API pasti menolak (409: masih punya pegawai/bawahan). */
function teksHapus(item: PosisiRow, list: readonly PosisiRow[]): string {
  const alasan = alasanTolakHapus(item, list);
  return alasan ? `${T.jabatan.hapusKonfirmasi(item.nama)} ${TA.posisi.hapusDitolak(alasan)}` : T.jabatan.hapusKonfirmasi(item.nama);
}

/** Tab Jabatan: daftar jabatan (urut hierarki → urutan → nama) dengan atasan + jumlah pegawai, hapus berkonfirmasi. */
export default function JabatanPerangkatPage() {
  const router = useRouter();
  const list = useSnapshot(statePosisiPerangkat.findManyAll);
  const { loading: hapusLoading } = useSnapshot(statePosisiPerangkat.delete);
  const [target, setTarget] = useState<PosisiRow | null>(null);

  useEffect(() => {
    void statePosisiPerangkat.findManyAll.load();
  }, []);

  const items = list.data ?? [];

  // Gagal (mis. 409) → pesan server tampil sebagai toast oleh state; modal ditutup agar pesan terbaca.
  const hapus = async () => {
    if (!target) return;
    await statePosisiPerangkat.delete.byId(target.id);
    setTarget(null);
  };

  return (
    <>
      <DaftarPanel
        title={T.jabatan.listTitle}
        onAdd={() => router.push(R.jabatanCreate)}
        loading={list.loading && !list.data}
        emptyText={items.length === 0 ? TA.posisi.kosong : null}
      >
        <PosisiTable items={items} onEdit={(id) => router.push(R.jabatanEdit(id))} onDelete={setTarget} />
      </DaftarPanel>
      <ModalKonfirmasiHapus
        opened={target !== null}
        loading={hapusLoading}
        onClose={() => setTarget(null)}
        onConfirm={() => void hapus()}
        text={target ? teksHapus(target, items) : ''}
      />
    </>
  );
}
