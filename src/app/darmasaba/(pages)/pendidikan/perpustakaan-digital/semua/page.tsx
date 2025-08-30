// src/app/darmasaba/(pages)/desa/berita/[kategori]/page.tsx
import { Suspense } from "react";
import Content from "./content";


export default async function Page() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Content searchQuery="" />
    </Suspense>
  );
}