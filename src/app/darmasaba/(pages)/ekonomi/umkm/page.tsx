'use client'
import umkmState from '@/app/admin/(dashboard)/_state/ekonomi/umkm/umkm';
import colors from '@/con/colors';
import { 
  Box, Center, Flex, Grid, GridCol, Image, Pagination, Paper, 
  Select, SimpleGrid, Skeleton, Stack, Text, TextInput, Title, 
  Tabs, Badge, Card
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { 
  IconMapPinFilled, IconSearch, 
  IconBuildingStore, IconUser,
  IconPackage
} from '@tabler/icons-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';
import { perSatuanSuffix } from './_lib/satuan';

function Page() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string | null>('produk-umkm');

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Box px={{ base: 'md', md: 100 }}>
        <Title order={1} c={colors["blue-button"]} fw="bold" lh={1.15} mb="md">
          UMKM & Produk Desa Darmasaba
        </Title>
        <Text ta="justify" fz={{ base: 'sm', md: 'md' }} lh={1.5} c="black" mb="xl">
          Pusat informasi produk lokal dan direktori usaha warga Desa Darmasaba. 
          Temukan berbagai produk unggulan dan dukung ekonomi pengusaha desa kami.
        </Text>

        <Tabs value={activeTab} onChange={setActiveTab} color="blue" variant="pills" radius="md">
          <Tabs.List mb="xl">
            <Tabs.Tab value="produk-umkm" leftSection={<IconPackage size={18} />}>
              Katalog Produk
            </Tabs.Tab>
            <Tabs.Tab value="direktori-umkm" leftSection={<IconBuildingStore size={18} />}>
              Direktori Bisnis
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="produk-umkm">
            <TabProdukUmkm router={router} />
          </Tabs.Panel>

          <Tabs.Panel value="direktori-umkm">
            <TabDirektoriUmkm router={router} />
          </Tabs.Panel>
        </Tabs>
      </Box>
    </Stack>
  );
}

// --- TAB COMPONENTS ---

function TabProdukUmkm({ router }: { router: any }) {
  const state = useProxy(umkmState.produk);
  // Snapshot cabang kategoriProduk agar Select re-render saat findManyAll.load()
  // async selesai — JSX sebelumnya baca raw proxy (race intermiten, STG).
  const kategoriState = useProxy(umkmState.kategoriProduk);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 1000);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data, page, loading, totalPages } = state.findMany;

  useShallowEffect(() => {
    umkmState.kategoriProduk.findManyAll.load();
  }, []);

  useShallowEffect(() => {
    umkmState.produk.findMany.load(page, 8, debouncedSearch, undefined, selectedCategory || undefined);
  }, [page, debouncedSearch, selectedCategory]);

  return (
    <Stack gap="lg">
      <Grid gutter="md" align="flex-end">
        <GridCol span={{ base: 12, md: 8 }}>
          <TextInput
            label="Cari Produk UMKM"
            placeholder="Ketik nama produk..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            leftSection={<IconSearch size={18} />}
            radius="md"
          />
        </GridCol>
        <GridCol span={{ base: 12, md: 4 }}>
          <Select
            label="Kategori"
            placeholder="Pilih Kategori"
            data={kategoriState.findManyAll.data?.map((v) => ({
              value: v.id, label: v.nama
            })) || []}
            value={selectedCategory}
            onChange={setSelectedCategory}
            clearable
            radius="md"
          />
        </GridCol>
      </Grid>

      {loading ? (
        <Skeleton h={400} radius="md" />
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
            {data?.map((v, k) => (
              <motion.div
                key={k}
                whileHover={{ scale: 1.03 }}
                onClick={() => router.push(`/darmasaba/ekonomi/umkm/produk/${v.id}`)}
                style={{ cursor: 'pointer', height: '100%' }}
              >
                <Card shadow="xs" padding="md" radius="md" withBorder style={{ height: '100%' }}>
                  <Card.Section>
                    <Image
                      src={v.image?.link || '/no-image.jpg'}
                      h={160}
                      w="100%"
                      alt={v.nama}
                      fit="cover"
                    />
                  </Card.Section>
                  <Stack mt="md" gap="xs">
                    <Badge color={v.stok > 0 ? 'teal' : 'red'}>
                      {v.stok > 0 ? 'Tersedia' : 'Habis'}
                    </Badge>
                    <Text fw={700} fz="md" lineClamp={1}>{v.nama}</Text>
                    <Text size="sm" c="blue" fw={500} style={{ cursor: 'pointer' }} onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/darmasaba/ekonomi/umkm/${v.umkmId}`);
                    }}>
                      {v.umkm?.nama}
                    </Text>
                    <Text fz="lg" fw={800} c="orange">
                      Rp {v.harga.toLocaleString('id-ID')}
                      <Text component="span" fz="xs" fw={500} c="dimmed">
                        {perSatuanSuffix(v.satuan)}
                      </Text>
                    </Text>
                  </Stack>
                </Card>
              </motion.div>
            ))}
          </SimpleGrid>
          <Center>
            <Pagination total={totalPages} value={page} onChange={(p) => umkmState.produk.findMany.load(p)} radius="md" />
          </Center>
        </>
      )}
    </Stack>
  );
}

function TabDirektoriUmkm({ router }: { router: any }) {
  const state = useProxy(umkmState.umkm);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 1000);
  
  const { data, page, loading, totalPages } = state.findMany;

  useShallowEffect(() => {
    umkmState.umkm.findMany.load(page, 8, debouncedSearch);
  }, [page, debouncedSearch]);

  return (
    <Stack gap="lg">
      <TextInput
        label="Cari UMKM"
        placeholder="Nama UMKM atau Pemilik..."
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        leftSection={<IconSearch size={18} />}
        radius="md"
        maw={500}
      />

      {loading ? (
        <Skeleton h={400} radius="md" />
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
            {data?.map((v, k) => (
              <motion.div
                key={k}
                onClick={() => router.push(`/darmasaba/ekonomi/umkm/${v.id}`)}
                whileHover={{ scale: 1.03 }}
              >
                <Paper p="md" radius="md" withBorder shadow="xs" style={{ cursor: 'pointer', height: '100%' }}>
                  <Image
                    radius="md"
                    src={v.image?.link || '/no-image.jpg'}
                    alt={v.nama}
                    h={160}
                    w="100%"
                    style={{ objectFit: 'cover' }}
                  />
                  <Badge mt="md" variant="light">{v.kategori?.nama}</Badge>
                  <Text mt="xs" fw="bold" fz="md" lineClamp={1}>{v.nama}</Text>
                  <Flex mt={8} gap="xs" align="center">
                    <IconUser size={14} color="gray" />
                    <Text fz="xs" c="dimmed">{v.pemilik}</Text>
                  </Flex>
                  <Flex mt={4} gap="xs" align="center">
                    <IconMapPinFilled size={14} color="red" />
                    <Text fz="xs" c="dimmed" lineClamp={1}>{v.alamat || 'Darmasaba'}</Text>
                  </Flex>
                </Paper>
              </motion.div>
            ))}
          </SimpleGrid>
          <Center>
            <Pagination total={totalPages} value={page} onChange={(p) => umkmState.umkm.findMany.load(p)} radius="md" />
          </Center>
        </>
      )}
    </Stack>
  );
}

export default Page;
