'use client';

import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import dinamikaPenduduk, { emptyDinamikaForm } from '../../../_state/kependudukan/dinamika-penduduk';
import { DinamikaPendudukForm } from '../../_components/DinamikaPendudukForm';

function CreateDinamikaPenduduk() {
  const state = useProxy(dinamikaPenduduk, { sync: true }); // sync: cegah caret jump di controlled input
  const router = useRouter();

  const handleSubmit = async () => {
    const id = await state.create.submit();
    if (id) router.push('/admin/kependudukan/dinamika-penduduk');
  };

  return (
    <DinamikaPendudukForm
      title="Tambah Dinamika Penduduk"
      value={state.create.form}
      onChange={(field, value) => {
        state.create.form[field] = value;
      }}
      onReset={() => {
        state.create.form = emptyDinamikaForm();
      }}
      resetLabel="Reset"
      onSubmit={handleSubmit}
      loading={state.create.loading}
    />
  );
}

export default CreateDinamikaPenduduk;
