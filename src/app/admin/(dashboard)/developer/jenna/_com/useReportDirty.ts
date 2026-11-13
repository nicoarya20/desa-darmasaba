'use client';
import { useEffect } from 'react';
import jennaState, { type JennaSection } from '../../../_state/developer/jenna-state';

/** Laporkan status draf satu bagian ke state global (untuk peringatan beforeunload). */
export function useReportDirty(section: JennaSection, dirty: boolean) {
  useEffect(() => {
    jennaState.setDirty(section, dirty);
  }, [section, dirty]);
  useEffect(() => () => jennaState.setDirty(section, false), [section]);
}
