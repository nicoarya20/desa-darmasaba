// app/desa/berita/BeritaLayoutClient.tsx
'use client'
import colors from '@/con/colors';
import { Box } from '@mantine/core';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import BackButton from '../../desa/layanan/_com/BackButto';

const LayoutTabsGotongRoyong = dynamic(
  () => import('./_lib/layoutTabs'),
  { ssr: false }
);

export default function GotongRoyongLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const isDetailPage = segments.length === 5;

  if (isDetailPage) {
      // Tampilkan tanpa tab menu
      return (
        <Box bg={colors.Bg}>
          <Box pt={33} px={{ base: 'md', md: 100 }}>
            <BackButton />
          </Box>
          {children}
        </Box>
      );
    }
  
  return <LayoutTabsGotongRoyong>{children}</LayoutTabsGotongRoyong>;
}