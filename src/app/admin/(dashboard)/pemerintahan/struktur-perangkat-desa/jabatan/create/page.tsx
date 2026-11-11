'use client'
import { FormPanel } from '@/app/admin/(dashboard)/_com/struktur-organisasi/FormPanel';
import { PosisiFormFields } from '@/app/admin/(dashboard)/_com/struktur-organisasi/PosisiFormFields';
import { isPosisiFormValid, parentOptions, type SetField } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.logic';
import { STRUKTUR_ADMIN_TEXT as TA } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.text';
import { statePosisiPerangkat, type PosisiForm } from '@/app/admin/(dashboard)/_state/desa/struktur-perangkat';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { useProxy } from 'valtio/utils';
import { STRUKTUR_PERANGKAT_ROUTES as R } from '../../_com/struktur-perangkat.routes';
import { STRUKTUR_PERANGKAT_ADMIN_TEXT as T } from '../../_com/struktur-perangkat.text';

/** Tambah jabatan: nama + hierarki wajib; atasan dipilih dari jabatan yang ada (kosong = puncak). */
export default function CreateJabatanPerangkatPage() {
  const router = useRouter();
  const create = useProxy(statePosisiPerangkat.create, { sync: true }); // sync: cegah caret loncat
  const list = useSnapshot(statePosisiPerangkat.findManyAll);

  useEffect(() => {
    statePosisiPerangkat.create.resetForm();
    void statePosisiPerangkat.findManyAll.load();
  }, []);

  const setField: SetField<PosisiForm> = (key, value) => {
    statePosisiPerangkat.create.form[key] = value;
  };

  const simpan = async () => {
    if (await statePosisiPerangkat.create.submit()) router.push(R.jabatan);
  };

  return (
    <FormPanel
      title={T.jabatan.createTitle}
      canSubmit={isPosisiFormValid(create.form)}
      submitting={create.loading}
      onSubmit={() => void simpan()}
      secondaryLabel={TA.reset}
      onSecondary={() => statePosisiPerangkat.create.resetForm()}
    >
      <PosisiFormFields values={create.form} onChange={setField} atasanOptions={parentOptions(list.data ?? [])} />
    </FormPanel>
  );
}
