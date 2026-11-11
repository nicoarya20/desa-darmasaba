// src/app/(public)/(pages)/pemerintahan/berita/[kategori]/page.tsx
import { Suspense } from "react";
import Content from "../[kategoriBuku]/content";


export default async function Page() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Content kategoriBuku="semua" />
    </Suspense>
  );
}