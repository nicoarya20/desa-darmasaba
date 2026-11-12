'use client';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import { useEffect, useState } from 'react';
import type { SuratKeteranganItem } from '../layanan.logic';

/** Satu layanan surat keterangan beserta gambar alur (`image2`); `deskripsi` berupa HTML editor admin. */
export type LayananDetailData = SuratKeteranganItem & {
  deskripsi: string;
  image2?: { link: string } | null;
};

/** `notfound` juga menutupi gagal muat: state `findUnique` menyetel `data` null untuk keduanya. */
export type LayananDetailState =
  | { status: 'loading' }
  | { status: 'ready'; data: LayananDetailData }
  | { status: 'notfound' };

/** Muat satu layanan lewat `suratKeterangan.findUnique`; berganti id → kembali `loading`. */
export function useLayananDetail(id: string): LayananDetailState {
  const [state, setState] = useState<LayananDetailState>({ status: 'loading' });
  const [prevId, setPrevId] = useState(id);

  if (id !== prevId) {
    setPrevId(id);
    setState({ status: 'loading' });
  }

  useEffect(() => {
    let alive = true;
    const findUnique = stateLayananDesa.suratKeterangan.findUnique;
    void findUnique.load(id).then(() => {
      if (!alive) return;
      const data = findUnique.data as LayananDetailData | null;
      // `data` milik proxy bersama; abaikan bila sudah ditimpa muatan id lain.
      setState(data && data.id === id ? { status: 'ready', data } : { status: 'notfound' });
    });
    return () => {
      alive = false;
    };
  }, [id]);

  return state;
}
