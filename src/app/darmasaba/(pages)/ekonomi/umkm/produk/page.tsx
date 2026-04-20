'use client'
import umkmState from '@/app/admin/(dashboard)/_state/ekonomi/umkm/umkm';
import colors from '@/con/colors';
import { Box, Center, Flex, Grid, GridCol, Image, Pagination, Paper, Select, SimpleGrid, Skeleton, Stack, Text, TextInput, Title, Badge, Card, Group } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconBuildingStore, IconSearch, IconTag } from '@tabler/icons-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../../desa/layanan/_com/BackButto';

function Page() {
  const router = useRouter()
  const state = useProxy(umkmState.produk)
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 1000);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedUmkm, setSelectedUmkm] = useState<string | null>(null);
  
  const { data, page, loading, totalPages, load } = state.findMany

  useShallowEffect(() => {
    umkmState.kategoriProduk.findManyAll.load()
    // Load all UMKM for filter
    fetch('/api/ekonomi/umkm/find-many-all')
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          (umkmState.umkm as any).allList = res.data;
        }
      })
  }, [])

  const allUmkm = useProxy(umkmState.umkm as any).allList || [];

  useShallowEffect(() => {
    load(page, 12, debouncedSearch, selectedUmkm || undefined, selectedCategory || undefined)
  }, [page, debouncedSearch, selectedUmkm, selectedCategory])

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Box>
        <Grid align="center" px={{ base: 'md', md: 100 }}>
          <GridCol span={{ base: 12, md: 9 }}>
            <Title order={1} c={colors["blue-button"]} fw="bold" lh={1.15}>
              Katalog Produk UMKM
            </Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 3 }}>
            <TextInput
              radius="lg"
              placeholder="Cari Produk..."
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              leftSection={<IconSearch size={20} />}
              w={"100%"}
            />
          </GridCol>
        </Grid>

        <Text
          px={{ base: 'md', md: 100 }}
          pt={20}
          ta="justify"
          fz={{ base: 'sm', md: 'md' }}
          lh={{ base: 1.5, md: 1.55 }}
          c="black"
        >
          Temukan berbagai produk unggulan dari pelaku UMKM di Desa Darmasaba. 
          Mulai dari kuliner, kerajinan tangan, hingga jasa tersedia untuk memenuhi kebutuhan Anda.
        </Text>
      </Box>

      <Box px={{ base: "md", md: 100 }}>
        <Stack gap="lg">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Select
              placeholder="Filter Berdasarkan UMKM"
              data={allUmkm.map((v: any) => ({ value: v.id, label: v.nama }))}
              value={selectedUmkm}
              onChange={setSelectedUmkm}
              clearable
              searchable
              nothingFoundMessage="UMKM tidak ditemukan"
            />
            <Select
              placeholder="Filter Kategori"
              data={umkmState.kategoriProduk.findManyAll.data?.map((v) => ({
                value: v.id,
                label: v.nama
              })) || []}
              value={selectedCategory}
              onChange={setSelectedCategory}
              clearable
              searchable
              nothingFoundMessage="Kategori tidak ditemukan"
            />
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
            {data?.map((v, k) => (
              <motion.div
                key={k}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%' }}>
                  <Card.Section>
                    <Image
                      src={v.image?.link || '/no-image.jpg'}
                      height={180}
                      alt={v.nama}
                      fallbackSrc="/no-image.jpg"
                    />
                  </Card.Section>

                  <Stack justify="space-between" mt="md" h="100%">
                    <Box>
                      <Group justify="space-between" mb="xs">
                        <Badge color={v.stok > 0 ? 'teal' : 'red'} variant="light">
                          {v.stok > 0 ? 'Tersedia' : 'Habis'}
                        </Badge>
                        <Text size="xs" c="dimmed">Stok: {v.stok}</Text>
                      </Group>

                      <Text fw={700} fz="lg" lineClamp={1}>{v.nama}</Text>
                      
                      <Flex align="center" gap={5} mt={5}>
                        <IconBuildingStore size={14} color="gray" />
                        <Text size="sm" c="blue" fw={500} style={{ cursor: 'pointer' }} onClick={() => router.push(`/darmasaba/ekonomi/umkm/${v.umkmId}`)}>
                          {v.umkm?.nama}
                        </Text>
                      </Flex>

                      <Flex align="center" gap={5} mt={2}>
                        <IconTag size={14} color="gray" />
                        <Text size="xs" c="dimmed">{v.umkm?.kategori?.nama}</Text>
                      </Flex>
                    </Box>

                    <Box mt="md">
                      <Text fz="xl" fw={800} c="orange">
                        Rp {v.harga.toLocaleString('id-ID')}
                      </Text>
                    </Box>
                  </Stack>
                </Card>
              </motion.div>
            ))}
          </SimpleGrid>

          {data.length === 0 && (
            <Center py={80}>
              <Stack align="center">
                <Text c="dimmed" fz="lg">Produk tidak ditemukan</Text>
                <Text size="sm" c="dimmed">Coba gunakan kata kunci atau filter lain</Text>
              </Stack>
            </Center>
          )}

          <Center>
            <Pagination
              value={page}
              onChange={(newPage) => load(newPage)}
              total={totalPages}
              my="md"
              color="blue"
              radius="md"
            />
          </Center>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
