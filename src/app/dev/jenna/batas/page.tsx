'use client';
import { useSnapshot } from 'valtio';
import jennaState from '../../_state/jenna-state';
import { JennaLimitsCard } from '../_com/JennaLimitsCard';

/** Developer › Jenna › Batas Pemakaian. Muat config & status bersama ada di ../layout.tsx. */
export default function JennaBatasPage() {
  const snap = useSnapshot(jennaState);
  if (!snap.config) return null;

  // key: draf di-reset ke data server setiap load sukses.
  return <JennaLimitsCard key={snap.loadVersion} settings={snap.config.settings} />;
}
