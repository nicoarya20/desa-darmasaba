import { Suspense } from "react";
import { PosyanduPage } from "./_com/PosyanduPage";

/** Halaman publik Posyandu (ringkasan, direktori, angka balita & ibu hamil per banjar). */
export default function Page() {
  // PosyanduPage membaca useSearchParams (`?tab=`) → wajib di dalam Suspense.
  return (
    <Suspense>
      <PosyanduPage />
    </Suspense>
  );
}
