'use client'
import type { PosisiForm } from '@/app/admin/(dashboard)/_state/struktur-organisasi';
import { Skeleton, Text } from '@mantine/core';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { useProxy } from 'valtio/utils';
import { FormPanel } from '../FormPanel';
import { PosisiFormFields } from '../PosisiFormFields';
import { isPosisiFormValid, parentOptions, type SetField } from '../struktur-admin.logic';
import type { StrukturAdminConfig } from '../struktur-admin.config';
import { STRUKTUR_ADMIN_TEXT as TA } from '../struktur-admin.text';

/** Edit jabatan; atasan tanpa diri sendiri & bawahannya. Atasan siklus ditolak API (400) → toast pesan server. */
export function JabatanEditPage({ config }: { config: StrukturAdminConfig }) {
  const { state, routes: R, text: T } = config;
  const router = useRouter();
  const id = String(useParams()?.id ?? '');
  const update = useProxy(state.posisi.update, { sync: true }); // sync: cegah caret loncat
  const list = useSnapshot(state.posisi.findManyAll);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    void state.posisi.findManyAll.load();
    void state.posisi.update.load(id).then((found) => setStatus(found ? 'ready' : 'missing'));
    return () => state.posisi.update.resetForm();
  }, [state, id]);

  const setField: SetField<PosisiForm> = (key, value) => {
    state.posisi.update.form[key] = value;
  };

  const simpan = async () => {
    if (await state.posisi.update.submit()) router.push(R.jabatan);
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
