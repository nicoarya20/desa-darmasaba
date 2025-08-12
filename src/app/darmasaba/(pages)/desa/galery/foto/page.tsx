'use client'

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// ✅ Load komponen tanpa SSR
const FotoContent = dynamic(
  () => import('./Content'),
  { 
    ssr: false, 
    loading: () => <div>Memuat konten...</div> 
  }
);

function PageContent() {
  return (
    <Suspense fallback={<div>Memuat...</div>}>
      <FotoContent />
    </Suspense>
  );
}

export default function Page() {
  return <PageContent />;
}