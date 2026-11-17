import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProgramInovasiPage } from './_com/ProgramInovasiPage';
import { PROGRAM_INOVASI_TEXT } from './_com/program-inovasi.text';

export const metadata: Metadata = {
  title: PROGRAM_INOVASI_TEXT.title,
  description: PROGRAM_INOVASI_TEXT.lead,
};

/** Daftar Program Inovasi (tautan navbar Inovasi); data sama dengan rel "Program Inovasi Desa" di beranda. */
export default function Page() {
  // ProgramInovasiPage membaca useSearchParams → wajib di dalam Suspense.
  return (
    <Suspense>
      <ProgramInovasiPage />
    </Suspense>
  );
}
