'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { DaftarPanel } from '../DaftarPanel';
import { PosisiTable } from '../PosisiTable';
import { alasanTolakHapus, type PosisiRow } from '../struktur-admin.logic';
import type { StrukturAdminConfig, StrukturAdminText } from '../struktur-admin.config';
import { STRUKTUR_ADMIN_TEXT as TA } from '../struktur-admin.text';

/** Teks konfirmasi hapus + peringatan bila API pasti menolak (409: masih punya pegawai/bawahan). */
function teksHapus(T: StrukturAdminText, item: PosisiRow, list: readonly PosisiRow[]): string {
  const alasan = alasanTolakHapus(item, list);
  const tanya = T.jabatan.hapusKonfirmasi(item.nama);
  return alasan ? `${tanya} ${TA.posisi.hapusDitolak(alasan)}` : tanya;
}

/** Tab Jabatan: daftar jabatan (urut hierarki → urutan → nama) dengan atasan + jumlah pegawai, hapus berkonfirmasi. */
export function JabatanListPage({ config }: { config: StrukturAdminConfig }) {
  const { state, routes: R, text: T } = config;
  const router = useRouter();
  const list = useSnapshot(state.posisi.findManyAll);
  const { loading: hapusLoading } = useSnapshot(state.posisi.delete);
  const [target, setTarget] = useState<PosisiRow | null>(null);

  useEffect(() => {
    void state.posisi.findManyAll.load();
  }, [state]);

  const items = list.data ?? [];

  // Gagal (mis. 409) → pesan server tampil sebagai toast oleh state; modal ditutup agar pesan terbaca.
  const hapus = async () => {
    if (!target) return;
    await state.posisi.delete.byId(target.id);
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
        text={target ? teksHapus(T, target, items) : ''}
      />
    </>
  );
}
