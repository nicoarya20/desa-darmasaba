'use client'
import dynamic from 'next/dynamic';

// ✅ Load komponen tanpa SSR
const VideoContent = dynamic(
  () => import('./Content'),
  { ssr: false, loading: () => <div>Memuat...</div> }
);

export default function Page() {
  return <VideoContent />;
}