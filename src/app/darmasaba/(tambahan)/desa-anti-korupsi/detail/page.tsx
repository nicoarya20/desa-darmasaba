/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import korupsiState from '@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi';
import BackButton from '@/app/darmasaba/(pages)/pemerintahan/layanan/_com/BackButto';
import colors from '@/con/colors';
import { useProxy } from 'valtio/utils';
import {
  Box,
  Button,
  Container,
  Flex,
  SimpleGrid,
  Stack,
  Text,
  Loader,
} from '@mantine/core';
import { IconInbox } from '@tabler/icons-react';
import { detailHref, filterByKategori, resolveInitialKategori } from '../_lib/kategori-tab';
import { ProgramFolderCard } from '../_com/ProgramFolderCard';

function LokalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pickedKategori, setPickedKategori] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const state = useProxy(korupsiState);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await state.desaAntikorupsi.findMany.load(1, 100);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const data = state.desaAntikorupsi.findMany.data || [];
  const categories = [...new Set(data.filter(i => i.kategori?.name).map(i => i.kategori.name))];
  const selectedKategori = pickedKategori ?? resolveInitialKategori(searchParams.get('kategori'), categories);
  const filteredData = filterByKategori(data, selectedKategori);

  const selectKategori = (kategori: string) => {
    setPickedKategori(kategori);
    router.replace(detailHref(kategori), { scroll: false });
  };

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap={32}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Container w={{ base: '100%', md: '80%' }}>
        <Stack align="center" gap={4}>
          <Text fz={{ base: 32, md: 44 }} fw={700} ta="center" c={colors['blue-button']}>
            Desa Anti Korupsi
          </Text>
          <Text ta="center" fz="md" c="dimmed" maw={700}>
            Desa antikorupsi mendorong pemerintahan jujur dan transparan. Keuangan desa dikelola
            terbuka dengan melibatkan warga untuk mengawasi anggaran sehingga tepat sasaran sesuai
            kebutuhan.
          </Text>
        </Stack>
      </Container>

      <Container size="lg" px={{ base: 'md', md: 'xl' }}>
        <Flex gap="sm" justify="center" mb="xl" wrap="wrap">
          {categories.map(kategori => (
            <Button
              key={kategori}
              onClick={() => selectKategori(kategori)}
              size="sm"
              radius="xl"
              variant={selectedKategori === kategori ? 'filled' : 'outline'}
              color={selectedKategori === kategori ? colors['blue-button'] : 'gray'}
            >
              {kategori}
            </Button>
          ))}
        </Flex>

        {loading ? (
          <Flex justify="center" align="center" h={200}>
            <Loader color={colors['blue-button']} size="lg" />
          </Flex>
        ) : filteredData.length === 0 ? (
          <Flex direction="column" align="center" justify="center" gap="sm" py="xl">
            <IconInbox size={48} stroke={1.5} color={colors['blue-button']} />
            <Text fz="lg" fw={500} c="dimmed">
              Belum ada data untuk kategori ini
            </Text>
          </Flex>
        ) : (
          // Kartu ringkas (isi dokumen dibuka di halaman program); grid rata tinggi.
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {filteredData.map(item => (
              <ProgramFolderCard
                key={item.id}
                id={item.id}
                name={item.name}
                kategori={item.kategori?.name}
                jumlahFolder={item.jumlahFolder}
                jumlahDokumen={item.jumlahDokumen}
              />
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Stack>
  );
}

// useSearchParams di client page wajib dalam Suspense boundary agar `next build` tidak gagal.
function Lokal() {
  return (
    <Suspense
      fallback={
        <Flex justify="center" align="center" h={200}>
          <Loader color={colors['blue-button']} size="lg" />
        </Flex>
      }
    >
      <LokalContent />
    </Suspense>
  );
}

export default Lokal;
