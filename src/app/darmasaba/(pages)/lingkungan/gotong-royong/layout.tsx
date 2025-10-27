// app/desa/berita/BeritaLayoutClient.tsx
'use client'
import dynamic from 'next/dynamic';

const LayoutTabsGotongRoyong = dynamic(
  () => import('./_lib/layoutTabs'),
  { ssr: false }
);

export default function GotongRoyongLayoutClient({ children }: { children: React.ReactNode }) {
  return <LayoutTabsGotongRoyong>{children}</LayoutTabsGotongRoyong>;
}