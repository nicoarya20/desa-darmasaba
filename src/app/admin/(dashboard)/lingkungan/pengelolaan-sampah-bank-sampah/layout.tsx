'use client'
import { usePathname } from 'next/navigation';
import LayoutTabsPengelolaanSampahBankSampah from './_lib/layoutTabs';
import { Box } from '@mantine/core';

function PengelolaanSampahBankSampah({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
    // Contoh path:
    // - /darmasaba/desa/berita/semua → panjang 5 → list
    // - /darmasaba/desa/berita/Pemerintahan → panjang 5 → list
    // - /darmasaba/desa/berita/Pemerintahan/123 → panjang 6 → detail
  
    const segments = pathname.split('/').filter(Boolean);
    const isDetailPage = segments.length >= 5;
  
    if (isDetailPage) {
      // Tampilkan tanpa tab menu
      return (
        <Box>
          {children}
        </Box>
      );
    }
  
  return (
    <LayoutTabsPengelolaanSampahBankSampah>
      {children}
    </LayoutTabsPengelolaanSampahBankSampah>
  )
}

export default PengelolaanSampahBankSampah;
