// src/app/darmasaba/(pages)/pemerintahan/berita/[kategori]/page.tsx
import { Suspense } from "react";
import Content from "./content";


export default async function Page({ params }: { params: Promise<{ kategoriBuku: string }> }) {
  const { kategoriBuku } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Content kategoriBuku={kategoriBuku} />
    </Suspense>
  );
}