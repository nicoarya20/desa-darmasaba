'use client';
import { useMemo } from 'react';
import { flattenMenu } from '../../../_com/searchMenu';
import { useMenuVisibility } from '../../../_com/MenuVisibilityContext';
import { groupPetaInformasi } from '../_lib/petaInformasi';
import PetaInformasiView from './PetaInformasiView';

/** Halaman Peta Informasi: semua halaman menu efektif (default config + override DB) per menu utama. */
export default function PetaInformasi() {
  const { searchMenus } = useMenuVisibility();
  const groups = useMemo(() => groupPetaInformasi(flattenMenu(searchMenus)), [searchMenus]);
  return <PetaInformasiView groups={groups} />;
}
