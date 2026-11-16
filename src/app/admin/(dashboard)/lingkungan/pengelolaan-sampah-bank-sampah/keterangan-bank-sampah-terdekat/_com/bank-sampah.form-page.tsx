'use client'
import FormEntriFrame from '@/app/admin/(dashboard)/_com/konten-bersama/form-entri.frame';
import keteranganSampah from '@/app/admin/(dashboard)/_state/lingkungan/bank-sampah/bank-sampah.state';
import { cekFormBankSampah, type BankSampahForm } from '@/app/admin/(dashboard)/_state/lingkungan/bank-sampah/bank-sampah.form';
import { useState, type ReactNode } from 'react';
import { useSnapshot } from 'valtio';
import BankSampahFormFields from './bank-sampah.form-fields';

type Props = {
  judul: string;
  /** Nilai awal form (kosong untuk tambah, dari detail untuk edit). */
  awal: BankSampahForm;
  /** Id bank sampah yang diedit; null = tambah baru. */
  id: string | null;
  onSaved: (id: string) => void;
  /** Section tambahan di bawah form (pengurus & dokumentasi di halaman edit). */
  children?: ReactNode;
};

/** Kerangka halaman tambah/edit bank sampah: judul, form, tombol Reset/Simpan, dan section tambahan. */
export default function BankSampahFormPage({ judul, awal, id, onSaved, children }: Props) {
  const { saving } = useSnapshot(keteranganSampah);
  const [form, setForm] = useState<BankSampahForm>(awal);
  const [baganBaru, setBaganBaru] = useState<File | null>(null);

  const simpan = async () => {
    const savedId = await keteranganSampah.simpan(id, form, baganBaru);
    if (savedId) onSaved(savedId);
  };

  return (
    <FormEntriFrame
      judul={judul}
      valid={cekFormBankSampah(form) === null}
      saving={saving}
      onReset={() => {
        setForm(awal);
        setBaganBaru(null);
      }}
      onSimpan={() => void simpan()}
      sesudah={children}
    >
      <BankSampahFormFields
        value={form}
        onChange={(patch) => setForm((lama) => ({ ...lama, ...patch }))}
        baganBaru={baganBaru}
        onBaganBaru={setBaganBaru}
      />
    </FormEntriFrame>
  );
}
