/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useEffect, useState } from 'react';
import korupsiState from '@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi';
import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { useProxy } from 'valtio/utils';
import {
  Box,
  Button,
  Container,
  Flex,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ActionIcon,
  Loader,
  Tooltip,
} from '@mantine/core';
import { IconFile, IconInbox } from '@tabler/icons-react';

function Lokal() {
  const [selectedKategori, setSelectedKategori] = useState<string>('PENGUATAN TATA LAKSANA');
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
  const filteredData =
    selectedKategori === 'PENGUATAN TATA LAKSANA'
      ? data
      : data.filter(i => i.kategori?.name === selectedKategori);

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
              onClick={() => setSelectedKategori(kategori)}
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
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
            {filteredData.map(item => {
              const handleDownload = (e: React.MouseEvent) => {
                e.stopPropagation();
                if (!item?.file?.link) return;
                const url = item.file.link.startsWith('http')
                  ? item.file.link
                  : `${window.location.origin}${item.file.link.startsWith('/') ? '' : '/'}${
                      item.file.link
                    }`;
                window.open(url, '_blank');
              };

              return (
                <Paper
                  key={item.id}
                  p="lg"
                  shadow="md"
                  radius="xl"
                  withBorder
                  style={{
                    background: 'linear-gradient(135deg, #ffffff, #f8fbff)',
                  }}
                >
                  <Stack h="100%" justify="space-between">
                    <Text fz="lg" fw={600} c={colors['blue-button']} lineClamp={2}>
                      {item.name}
                    </Text>
                    {item?.file && (
                      <Tooltip label="Unduh file" withArrow>
                        <ActionIcon
                          variant="filled"
                          color={colors['blue-button']}
                          size="lg"
                          radius="xl"
                          onClick={handleDownload}
                        >
                          <IconFile size={20} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Stack>
                </Paper>
              );
            })}
          </SimpleGrid>
        )}
      </Container>
    </Stack>
  );
}

export default Lokal;
