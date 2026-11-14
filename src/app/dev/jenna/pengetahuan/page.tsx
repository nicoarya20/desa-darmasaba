'use client';
import { Stack } from '@mantine/core';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import jennaKnowledgeState from '../../_state/jenna-knowledge-state';
import jennaState from '../../_state/jenna-state';
import { ErrorState } from '../../_com/ErrorState';
import { JennaKnowledgeSources } from '../_com/JennaKnowledgeSources';
import { JennaKnowledgeSummary } from '../_com/JennaKnowledgeSummary';
import { JennaKnowledgeTools } from '../_com/JennaKnowledgeTools';
import { JennaSkeleton } from '../_com/JennaSkeleton';
import { JENNA_PAGES } from '../jenna-pages';

const SKELETON_HEIGHTS = JENNA_PAGES['/dev/jenna/pengetahuan'].skeletonHeights;

/** Developer › Jenna › Pengetahuan (read-only). "Muat ulang" di ../layout.tsx menaikkan loadVersion → data dimuat ulang. */
export default function JennaPengetahuanPage() {
  const { loadVersion } = useSnapshot(jennaState);
  const snap = useSnapshot(jennaKnowledgeState);

  useEffect(() => {
    void jennaKnowledgeState.load();
  }, [loadVersion]);

  const data = snap.data;

  if (!data && snap.error) {
    return (
      <ErrorState
        title="Gagal memuat pengetahuan Jenna"
        message={snap.error}
        onRetry={() => void jennaKnowledgeState.load()}
        retrying={snap.loading}
      />
    );
  }

  if (!data) return <JennaSkeleton heights={SKELETON_HEIGHTS} label="Memuat pengetahuan Jenna" />;

  return (
    <Stack gap="lg">
      {snap.error && (
        <ErrorState
          title="Gagal memuat ulang pengetahuan"
          message={`${snap.error} Data di bawah adalah versi terakhir yang berhasil dimuat.`}
          onRetry={() => void jennaKnowledgeState.load()}
          retrying={snap.loading}
        />
      )}
      <JennaKnowledgeSummary snapshot={data.snapshot} />
      <JennaKnowledgeSources sources={data.sources} />
      <JennaKnowledgeTools tools={data.tools} />
    </Stack>
  );
}
