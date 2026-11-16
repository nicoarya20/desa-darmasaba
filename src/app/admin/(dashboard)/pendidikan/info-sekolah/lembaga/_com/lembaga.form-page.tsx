'use client'
import FormEntriFrame from '@/app/admin/(dashboard)/_com/konten-bersama/form-entri.frame';
import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';
import {
  cekFormLembaga,
  FOTO_LEMBAGA_KOSONG,
  type LembagaForm,
  type LembagaFotoBaru,
} from '@/app/admin/(dashboard)/_state/pendidikan/infoSekolahPaud/lembaga.form';
import { useEffect, useState, type ReactNode } from 'react';
import { useSnapshot } from 'valtio';
import LembagaFormFields from './lembaga.form-fields';

/** Jenjang dimuat sekaligus untuk pilihan form (jumlahnya hanya beberapa). */
const JENJANG_OPTION_LIMIT = 100;

type Props = {
  judul: string;
  /** Nilai awal form (kosong untuk tambah, dari detail untuk edit). */
  awal: LembagaForm;
  /** Id lembaga yang diedit; null = tambah baru. */
  id: string | null;
  onSaved: (id: string) => void;
  /** Section tambahan di bawah form (pengurus & galeri di halaman edit). */
  children?: ReactNode;
};

/** Halaman tambah/edit lembaga pendidikan: form detail sekolah + section tambahan. */
export default function LembagaFormPage({ judul, awal, id, onSaved, children }: Props) {
  const { saving } = useSnapshot(infoSekolahPaud.lembagaPendidikan);
  const jenjang = useSnapshot(infoSekolahPaud.jenjangPendidikan.findMany);
  const [form, setForm] = useState<LembagaForm>(awal);
  const [fotoBaru, setFotoBaru] = useState<LembagaFotoBaru>(FOTO_LEMBAGA_KOSONG);

  useEffect(() => {
    void infoSekolahPaud.jenjangPendidikan.findMany.load(1, JENJANG_OPTION_LIMIT);
  }, []);

  const simpan = async () => {
    const savedId = await infoSekolahPaud.lembagaPendidikan.simpan(id, form, fotoBaru);
    if (savedId) onSaved(savedId);
  };

  return (
    <FormEntriFrame
      judul={judul}
      valid={cekFormLembaga(form) === null}
      saving={saving}
      onReset={() => {
        setForm(awal);
        setFotoBaru(FOTO_LEMBAGA_KOSONG);
      }}
      onSimpan={() => void simpan()}
      sesudah={children}
    >
      <LembagaFormFields
        value={form}
        onChange={(patch) => setForm((lama) => ({ ...lama, ...patch }))}
        jenjangOptions={(jenjang.data ?? []).map((j) => ({ value: j.id, label: j.nama }))}
        fotoBaru={fotoBaru}
        onFotoBaru={(patch) => setFotoBaru((lama) => ({ ...lama, ...patch }))}
      />
    </FormEntriFrame>
  );
}
