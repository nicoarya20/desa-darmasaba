'use client'
import stateBumdes from '@/app/admin/(dashboard)/_state/ekonomi/bumdes/bumdes';
import { useEffect } from 'react';
import UnitUsahaForm from '../../_lib/UnitUsahaForm';

/** Admin: tambah unit usaha BUMDes. */
function CreateUnitUsahaBumdes() {
  useEffect(() => {
    stateBumdes.unitUsaha.resetForm();
  }, []);

  return <UnitUsahaForm title="Tambah Unit Usaha BUMDes" />;
}

export default CreateUnitUsahaBumdes;
