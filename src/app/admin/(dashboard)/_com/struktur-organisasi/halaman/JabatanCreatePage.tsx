'use client'
import type { PosisiForm } from '@/app/admin/(dashboard)/_state/struktur-organisasi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { useProxy } from 'valtio/utils';
import { FormPanel } from '../FormPanel';
import { PosisiFormFields } from '../PosisiFormFields';
import { isPosisiFormValid, parentOptions, type SetField } from '../struktur-admin.logic';
import type { StrukturAdminConfig } from '../struktur-admin.config';
import { STRUKTUR_ADMIN_TEXT as TA } from '../struktur-admin.text';

/** Tambah jabatan: nama + hierarki wajib; atasan dipilih dari jabatan yang ada (kosong = puncak). */
export function JabatanCreatePage({ config }: { config: StrukturAdminConfig }) {
  const { state, routes: R, text: T } = config;
  const router = useRouter();
  const create = useProxy(state.posisi.create, { sync: true }); // sync: cegah caret loncat
  const list = useSnapshot(state.posisi.findManyAll);

  useEffect(() => {
    state.posisi.create.resetForm();
    void state.posisi.findManyAll.load();
  }, [state]);

  const setField: SetField<PosisiForm> = (key, value) => {
    state.posisi.create.form[key] = value;
  };

  const simpan = async () => {
    if (await state.posisi.create.submit()) router.push(R.jabatan);
  };

  return (
    <FormPanel
      title={T.jabatan.createTitle}
      canSubmit={isPosisiFormValid(create.form)}
      submitting={create.loading}
      onSubmit={() => void simpan()}
      secondaryLabel={TA.reset}
      onSecondary={() => state.posisi.create.resetForm()}
    >
      <PosisiFormFields values={create.form} onChange={setField} atasanOptions={parentOptions(list.data ?? [])} />
    </FormPanel>
  );
}
