'use client';
import { Suspense } from 'react';
import { KegiatanList } from '../../../pemerintahan/kegiatan-desa/_com/KegiatanList';
import { GOTONG_ROYONG_SCOPE } from '../_com/gotong-royong.scope';

/** Daftar kegiatan gotong royong (tautan navbar); komponen klien karena cakupan membawa fungsi pemuat. */
export default function Page() {
  // KegiatanList membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <KegiatanList scope={GOTONG_ROYONG_SCOPE} />
    </Suspense>
  );
}
