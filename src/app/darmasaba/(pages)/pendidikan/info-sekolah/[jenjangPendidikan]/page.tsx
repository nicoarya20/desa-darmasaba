// src/app/darmasaba/(pages)/pemerintahan/berita/[kategori]/page.tsx
import { Suspense } from "react";
import Content from "./content";


export default async function Page({ params }: { params: Promise<{ jenjangPendidikan: string }> }) {
  const { jenjangPendidikan } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Content jenjangPendidikan={jenjangPendidikan} />
    </Suspense>
  );
}