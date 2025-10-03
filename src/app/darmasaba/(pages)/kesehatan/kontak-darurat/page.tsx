'use client'
import kontakDarurat from '@/app/admin/(dashboard)/_state/kesehatan/kontak-darurat/kontakDarurat';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Grid,
  GridCol,
  Image,
  Pagination,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Tooltip
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconBrandWhatsapp, IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';
import { useDebouncedValue } from '@mantine/hooks';

function Page() {
  const state = useProxy(kontakDarurat);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 500)
  const { data, page, totalPages, loading, load } = state.findMany;

  useShallowEffect(() => {
    load(page, 3, debouncedSearch);
  }, [page, debouncedSearch]);

  if (loading || !data) {
    return (
      <Box py="xl" px={{ base: 'md', md: 100 }}>
        <Skeleton height={500} radius="lg" />
      </Box>
    );
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="lg">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Grid align="center" px={{ base: 'md', md: 100 }} gutter="lg">
        <GridCol span={{ base: 12, md: 8 }}>
          <Text fz={{ base: '2rem', md: '2.8rem' }} c={colors['blue-button']} fw={800}>
            Kontak Darurat
          </Text>
          <Text c="dimmed" fz="md" mt={4}>
            Hubungi layanan penting dengan cepat dan mudah
          </Text>
        </GridCol>
        <GridCol span={{ base: 12, md: 4 }}>
          <Tooltip label="Cari berdasarkan nama atau deskripsi" withArrow>
            <TextInput
              radius="xl"
              size="md"
              placeholder="Cari kontak darurat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftSection={<IconSearch size={20} />}
              w="100%"
            />
          </Tooltip>
        </GridCol>
      </Grid>

      <Box px={{ base: 'md', md: 100 }}>
        {data.length === 0 ? (
          <Center mih={300}>
            <Stack align="center" gap="xs">
              <IconSearch size={50} color={colors['blue-button']} />
              <Text fz="lg" fw={600} c={colors['blue-button']}>
                Tidak ada kontak ditemukan
              </Text>
              <Text fz="sm" c="dimmed">
                Coba kata kunci lain untuk pencarian
              </Text>
            </Stack>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl" mt="lg">
            {data.map((v, k) => (
              <Paper
                key={k}
                radius="xl"
                shadow="md"
                withBorder
                p="lg"
                bg={colors['white-trans-1']}
                style={{
                  transition: 'all 200ms ease',
                  cursor: 'pointer',
                }}
              >
                <Stack align="center" gap="sm">
                  <Image
                    src={v.image.link}
                    alt={v.name}
                    w={140}
                    h={140}
                    fit="contain"
                    radius="md"
                    loading="lazy"
                  />
                  <Text ta="center" fw={700} fz="lg" c={colors['blue-button']}>
                    {v.name}
                  </Text>
                  <Text fz="sm" c="dimmed" ta="center" lineClamp={3}>
                    <span style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: v.deskripsi }} />
                  </Text>
                  <Button 
                    variant="light" 
                    leftSection={<IconBrandWhatsapp size={18} />} 
                    component="a" 
                    href={`https://wa.me/${v.whatsapp.replace(/\D/g, '')}`} 
                    target="_blank" 
                    aria-label="Hubungi WhatsApp"
                  >WhatsApp</Button>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        )}
      </Box>

      <Center mt="xl">
        <Pagination
          value={page}
          onChange={(newPage) => load(newPage, 3, search)}
          total={totalPages}
          size="lg"
          radius="xl"
          styles={{
            control: {
              border: `1px solid ${colors['blue-button']}`,
            },
          }}
        />
      </Center>
    </Stack>
  );
}

export default Page;
