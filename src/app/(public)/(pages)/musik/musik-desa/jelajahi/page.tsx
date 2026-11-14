import { Suspense } from 'react';
import { MusikJelajahi } from '../_com/library/MusikJelajahi';

/** Jelajahi: saring lagu lewat `?q=`, `?genre=`, `?artis=` (MusikJelajahi memakai useSearchParams → Suspense). */
export default function MusikJelajahiPage() {
  return (
    <Suspense fallback={null}>
      <MusikJelajahi />
    </Suspense>
  );
}
