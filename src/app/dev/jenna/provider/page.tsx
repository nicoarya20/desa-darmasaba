'use client';
import { useSnapshot } from 'valtio';
import jennaState from '../../_state/jenna-state';
import { JennaProviderSection } from '../_com/JennaProviderSection';

/** Developer › Jenna › Provider. Muat config & status bersama ada di ../layout.tsx. */
export default function JennaProviderPage() {
  const snap = useSnapshot(jennaState);
  if (!snap.config) return null;

  // key: draf di-reset ke data server setiap load sukses.
  return <JennaProviderSection key={snap.loadVersion} />;
}
