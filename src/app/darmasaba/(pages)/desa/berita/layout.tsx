// app/desa/berita/BeritaLayoutClient.tsx
'use client'
import dynamic from 'next/dynamic';

const LayoutTabsBerita = dynamic(
  () => import('./_lib/layoutTabs'),
  { ssr: false }
);

export default function BeritaLayoutClient({ children }: { children: React.ReactNode }) {
  return <LayoutTabsBerita>{children}</LayoutTabsBerita>;
}