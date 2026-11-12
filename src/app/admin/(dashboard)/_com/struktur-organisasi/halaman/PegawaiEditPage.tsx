'use client'
import type { PegawaiForm } from '@/app/admin/(dashboard)/_state/struktur-organisasi';
import { Skeleton, Text } from '@mantine/core';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { useProxy } from 'valtio/utils';
import { FormPanel } from '../FormPanel';
import { PegawaiFormFields } from '../PegawaiFormFields';
import { isPegawaiFormValid, posisiOptions, type SetField } from '../struktur-admin.logic';
import type { StrukturAdminConfig } from '../struktur-admin.config';
import { STRUKTUR_ADMIN_TEXT as TA } from '../struktur-admin.text';
import { useFotoPegawai } from '../use-foto-pegawai';

/** Edit pegawai: field form dikirim semua; foto dikosongkan = imageId kosong (server menghapus foto lama). */
export function PegawaiEditPage({ config }: { config: StrukturAdminConfig }) {
  const { state, routes: R, text: T } = config;
  const router = useRouter();
  const id = String(useParams()?.id ?? '');
  const update = useProxy(state.pegawai.update, { sync: true }); // sync: cegah caret loncat
  const posisi = useSnapshot(state.posisi.findManyAll);
  const foto = useFotoPegawai();
  const { showExisting } = foto;
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    void state.posisi.findManyAll.load();
    void state.pegawai.update.load(id).then((found) => {
      if (found) showExisting(state.pegawai.update.imageLink);
      setStatus(found ? 'ready' : 'missing');
    });
    return () => state.pegawai.update.resetForm();
  }, [state, id, showExisting]);

  const setField: SetField<PegawaiForm> = (key, value) => {
    state.pegawai.update.form[key] = value;
  };

  const hapusFoto = () => {
    foto.remove();
    setField('imageId', '');
  };

  const simpan = async () => {
    const ok = await foto.simpan((imageId) => setField('imageId', imageId), () => state.pegawai.update.submit());
    if (ok) router.push(R.pegawaiDetail(id));
  };

  if (status === 'missing') return <Text c="dimmed" py="xl" ta="center">{TA.pegawai.tidakDitemukan}</Text>;
  if (status === 'loading') return <Skeleton height={480} radius="md" />;

  return (
    <FormPanel
      title={T.pegawai.editTitle}
      canSubmit={isPegawaiFormValid(update.form)}
      submitting={foto.submitting || update.loading}
      onSubmit={() => void simpan()}
      secondaryLabel={TA.cancel}
      onSecondary={() => router.push(R.pegawaiDetail(id))}
    >
      <PegawaiFormFields
        values={update.form}
        onChange={setField}
        posisiOptions={posisiOptions(posisi.data ?? [])}
        foto={{ preview: foto.preview, onPick: foto.pick, onRemove: hapusFoto }}
        withStatus
      />
    </FormPanel>
  );
}
