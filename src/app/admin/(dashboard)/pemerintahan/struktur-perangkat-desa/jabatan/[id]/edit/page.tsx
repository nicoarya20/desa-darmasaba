'use client'
import { FormPanel } from '@/app/admin/(dashboard)/_com/struktur-organisasi/FormPanel';
import { PosisiFormFields } from '@/app/admin/(dashboard)/_com/struktur-organisasi/PosisiFormFields';
import { isPosisiFormValid, parentOptions, type SetField } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.logic';
import { STRUKTUR_ADMIN_TEXT as TA } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.text';
import { statePosisiPerangkat, type PosisiForm } from '@/app/admin/(dashboard)/_state/desa/struktur-perangkat';
import { Skeleton, Text } from '@mantine/core';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { useProxy } from 'valtio/utils';
import { STRUKTUR_PERANGKAT_ROUTES as R } from '../../../_com/struktur-perangkat.routes';
import { STRUKTUR_PERANGKAT_ADMIN_TEXT as T } from '../../../_com/struktur-perangkat.text';

/** Edit jabatan; atasan tanpa diri sendiri & bawahannya. Atasan siklus ditolak API (400) → toast pesan server. */
export default function EditJabatanPerangkatPage() {
  const router = useRouter();
  const id = String(useParams()?.id ?? '');
  const update = useProxy(statePosisiPerangkat.update, { sync: true }); // sync: cegah caret loncat
  const list = useSnapshot(statePosisiPerangkat.findManyAll);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    void statePosisiPerangkat.findManyAll.load();
    void statePosisiPerangkat.update.load(id).then((found) => setStatus(found ? 'ready' : 'missing'));
    return () => statePosisiPerangkat.update.resetForm();
  }, [id]);

  const setField: SetField<PosisiForm> = (key, value) => {
    statePosisiPerangkat.update.form[key] = value;
  };

  const simpan = async () => {
    if (await statePosisiPerangkat.update.submit()) router.push(R.jabatan);
  };

  if (status === 'missing') return <Text c="dimmed" py="xl" ta="center">{TA.posisi.tidakDitemukan}</Text>;
  if (status === 'loading') return <Skeleton height={420} radius="md" />;

  return (
    <FormPanel
      title={T.jabatan.editTitle}
      canSubmit={isPosisiFormValid(update.form)}
      submitting={update.loading}
      onSubmit={() => void simpan()}
      secondaryLabel={TA.cancel}
      onSecondary={() => router.push(R.jabatan)}
    >
      <PosisiFormFields
        values={update.form}
        onChange={setField}
        atasanOptions={parentOptions(list.data ?? [], id)}
        withStatus
      />
    </FormPanel>
  );
}
