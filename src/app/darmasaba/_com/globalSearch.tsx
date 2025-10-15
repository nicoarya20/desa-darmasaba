'use client';
import { TextInput, Loader, Stack, Box, Text } from '@mantine/core';
import { useSnapshot } from 'valtio';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import searchState from '@/app/api/[[...slugs]]/_lib/search/searchState';

// Mapping type ke URL
const getDetailUrl = (item: { type?: string; id: string | number; [key: string]: unknown }) => {
  const { type, id, kategori } = item;

  const typeUrlMap: Record<string, string> = {
    programinovasi: `/darmasaba/program-inovasi/${id}`,
    desaantikorupsi: '/darmasaba/desa-anti-korupsi',
    sdgsdesa: '/darmasaba/sdgs-desa',
    apbdes: '/darmasaba/apbdes',
    prestasidesa: '/darmasaba/prestasi-desa',
    pejabatdesa: '/darmasaba/profile/pejabat-desa',
    strukturppid: '/darmasaba/ppid/struktur-ppid',
    visimisippid: '/darmasaba/ppid/visi-misi',
    dasarhukumppid: '/darmasaba/ppid/dasar-hukum',
    profileppid: '/darmasaba/ppid/profile',
    daftarinformasipublik: '/darmasaba/ppid/daftar-informasi-publik',
    perbekeldarmasaba: '/darmasaba/desa/profile',
    berita: `/darmasaba/desa/berita/${kategori}/${id}`,
    pengumuman: `/darmasaba/desa/pengumuman/${kategori}/${id}`,
    sejarahdesa: '/darmasaba/desa/profile',
    visimisidesa: '/darmasaba/desa/profile',
    lambangdesa: '/darmasaba/desa/profile',
    maskotdesa: '/darmasaba/desa/profile',
    profilperbekel: '/darmasaba/desa/profile',
    potensi: '/darmasaba/desa/potensi-desa',
    galleryFoto: '/darmasaba/desa/gallery/foto',
    galleryVideo: '/darmasaba/desa/gallery/video',
    pelayananSuratKeterangan: '/darmasaba/desa/layanan',
    pelayananPerizinanBerusaha: '/darmasaba/desa/layanan',
    pelayananTelunjukSaktiDesa: '/darmasaba/desa/layanan',
    pelayananPendudukNonPermanent: '/darmasaba/desa/layanan',
    penghargaan: '/darmasaba/desa/penghargaan',
  };

  return type ? typeUrlMap[type] || '/darmasaba' : '/darmasaba';
};


export default function GlobalSearch() {
  const snap = useSnapshot(searchState);
  const router = useRouter();

  // Infinite scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const bottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      if (bottom && !snap.loading) searchState.next();
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [snap.loading]);

  return (
    <Stack>
      <TextInput
        placeholder="Cari apapun..."
        value={snap.query}
        onChange={(e) => (searchState.query = e.currentTarget.value)}
      />

      {snap.results.map((item, i) => (
        <Box
          key={i}
          p="sm"
          style={{
            borderBottom: '1px solid #eee',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          onClick={() => {
            const url = getDetailUrl(item);
            router.push(url);
          }}
        >
          <Text size="sm" fw={500}>
            {item.judul || item.namaPasar || item.nama || item.name}
          </Text>
          <Text size="xs" c="dimmed">
            dari modul: {item.type}
          </Text>
        </Box>
      ))}

      {snap.loading && <Loader size="sm" />}
    </Stack>
  );
}
