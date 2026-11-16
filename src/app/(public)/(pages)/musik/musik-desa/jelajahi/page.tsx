import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MUSIK_PAGE_METADATA } from '../_com/app/musik-page.meta';
import { MusikJelajahi } from '../_com/library/MusikJelajahi';

export const metadata: Metadata = MUSIK_PAGE_METADATA.jelajahi;

/** Jelajahi: saring lagu lewat `?q=`, `?genre=`, `?artis=` (MusikJelajahi memakai useSearchParams → Suspense). */
export default function MusikJelajahiPage() {
  return (
    <Suspense fallback={null}>
      <MusikJelajahi />
    </Suspense>
  );
}
