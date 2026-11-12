'use client'
import { FormPanel } from '@/app/admin/(dashboard)/_com/struktur-organisasi/FormPanel';
import { PegawaiFormFields } from '@/app/admin/(dashboard)/_com/struktur-organisasi/PegawaiFormFields';
import { isPegawaiFormValid, posisiOptions, type SetField } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.logic';
import { STRUKTUR_ADMIN_TEXT as TA } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.text';
import { useFotoPegawai } from '@/app/admin/(dashboard)/_com/struktur-organisasi/use-foto-pegawai';
import { statePegawaiPerangkat, statePosisiPerangkat, type PegawaiForm } from '@/app/admin/(dashboard)/_state/desa/struktur-perangkat';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { useProxy } from 'valtio/utils';
import { STRUKTUR_PERANGKAT_ROUTES as R } from '../../_com/struktur-perangkat.routes';
import { STRUKTUR_PERANGKAT_ADMIN_TEXT as T } from '../../_com/struktur-perangkat.text';

/** Tambah perangkat desa: hanya nama + jabatan wajib, foto opsional. */
export default function CreatePegawaiPerangkatPage() {
  const router = useRouter();
  const create = useProxy(statePegawaiPerangkat.create, { sync: true }); // sync: cegah caret loncat
  const posisi = useSnapshot(statePosisiPerangkat.findManyAll);
  const foto = useFotoPegawai();

  useEffect(() => {
    statePegawaiPerangkat.create.resetForm();
    void statePosisiPerangkat.findManyAll.load();
  }, []);

  const setField: SetField<PegawaiForm> = (key, value) => {
    statePegawaiPerangkat.create.form[key] = value;
  };

  const reset = () => {
    statePegawaiPerangkat.create.resetForm();
    foto.remove();
  };

  const simpan = async () => {
    const ok = await foto.simpan((id) => setField('imageId', id), () => statePegawaiPerangkat.create.submit());
    if (ok) router.push(R.pegawai);
  };

  return (
    <FormPanel
      title={T.pegawai.createTitle}
      canSubmit={isPegawaiFormValid(create.form)}
      submitting={foto.submitting || create.loading}
      onSubmit={() => void simpan()}
      secondaryLabel={TA.reset}
      onSecondary={reset}
    >
      <PegawaiFormFields
        values={create.form}
        onChange={setField}
        posisiOptions={posisiOptions(posisi.data ?? [])}
        foto={{ preview: foto.preview, onPick: foto.pick, onRemove: foto.remove }}
      />
    </FormPanel>
  );
}
