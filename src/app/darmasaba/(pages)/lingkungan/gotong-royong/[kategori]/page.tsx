import { Suspense } from "react";
import Content from "./content";


export default async function Page({ params }: { params: Promise<{ kategori: string }> }) {
  const { kategori } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Content kategori={kategori} />
    </Suspense>
  );
}