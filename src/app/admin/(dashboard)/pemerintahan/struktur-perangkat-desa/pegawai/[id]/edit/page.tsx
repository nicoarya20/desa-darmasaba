'use client'
import { FormPanel } from '@/app/admin/(dashboard)/_com/struktur-organisasi/FormPanel';
import { PegawaiFormFields } from '@/app/admin/(dashboard)/_com/struktur-organisasi/PegawaiFormFields';
import { isPegawaiFormValid, posisiOptions, type SetField } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.logic';
import { STRUKTUR_ADMIN_TEXT as TA } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.text';
import { useFotoPegawai } from '@/app/admin/(dashboard)/_com/struktur-organisasi/use-foto-pegawai';
import { statePegawaiPerangkat, statePosisiPerangkat, type PegawaiForm } from '@/app/admin/(dashboard)/_state/desa/struktur-perangkat';
import { Skeleton, Text } from '@mantine/core';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { useProxy } from 'valtio/utils';
import { STRUKTUR_PERANGKAT_ROUTES as R } from '../../../_com/struktur-perangkat.routes';
import { STRUKTUR_PERANGKAT_ADMIN_TEXT as T } from '../../../_com/struktur-perangkat.text';

/** Edit perangkat desa: semua field dikirim; foto dikosongkan = imageId kosong (server menghapus foto lama). */
export default function EditPegawaiPerangkatPage() {
  const router = useRouter();
  const id = String(useParams()?.id ?? '');
  const update = useProxy(statePegawaiPerangkat.update, { sync: true }); // sync: cegah caret loncat
  const posisi = useSnapshot(statePosisiPerangkat.findManyAll);
  const foto = useFotoPegawai();
  const { showExisting } = foto;
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    void statePosisiPerangkat.findManyAll.load();
    void statePegawaiPerangkat.update.load(id).then((found) => {
      if (found) showExisting(statePegawaiPerangkat.update.imageLink);
      setStatus(found ? 'ready' : 'missing');
    });
    return () => statePegawaiPerangkat.update.resetForm();
  }, [id, showExisting]);

  const setField: SetField<PegawaiForm> = (key, value) => {
    statePegawaiPerangkat.update.form[key] = value;
  };

  const hapusFoto = () => {
    foto.remove();
    setField('imageId', '');
  };

  const simpan = async () => {
    const ok = await foto.simpan((imageId) => setField('imageId', imageId), () => statePegawaiPerangkat.update.submit());
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
