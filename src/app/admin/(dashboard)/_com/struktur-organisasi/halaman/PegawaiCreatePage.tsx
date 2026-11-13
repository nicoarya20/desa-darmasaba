'use client'
import type { PegawaiForm } from '@/app/admin/(dashboard)/_state/struktur-organisasi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { useProxy } from 'valtio/utils';
import { FormPanel } from '../FormPanel';
import { PegawaiFormFields } from '../PegawaiFormFields';
import { isPegawaiFormValid, posisiOptions, type SetField } from '../struktur-admin.logic';
import type { StrukturAdminConfig } from '../struktur-admin.config';
import { STRUKTUR_ADMIN_TEXT as TA } from '../struktur-admin.text';
import { useFotoPegawai } from '../use-foto-pegawai';

/** Tambah pegawai: hanya nama + jabatan wajib, foto opsional. */
export function PegawaiCreatePage({ config }: { config: StrukturAdminConfig }) {
  const { state, routes: R, text: T } = config;
  const router = useRouter();
  const create = useProxy(state.pegawai.create, { sync: true }); // sync: cegah caret loncat
  const posisi = useSnapshot(state.posisi.findManyAll);
  const foto = useFotoPegawai();

  useEffect(() => {
    state.pegawai.create.resetForm();
    void state.posisi.findManyAll.load();
  }, [state]);

  const setField: SetField<PegawaiForm> = (key, value) => {
    state.pegawai.create.form[key] = value;
  };

  const reset = () => {
    state.pegawai.create.resetForm();
    foto.remove();
  };

  const simpan = async () => {
    const ok = await foto.simpan((id) => setField('imageId', id), () => state.pegawai.create.submit());
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
