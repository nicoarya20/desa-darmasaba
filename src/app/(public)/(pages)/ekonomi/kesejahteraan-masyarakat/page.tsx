import { Suspense } from 'react';
import { KesejahteraanPage } from './_com/KesejahteraanPage';

/** Daftar program Kesejahteraan Masyarakat (tautan navbar Ekonomi). */
export default function Page() {
  // KesejahteraanPage membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <KesejahteraanPage />
    </Suspense>
  );
}
