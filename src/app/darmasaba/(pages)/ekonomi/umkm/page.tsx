'use client'
import umkmState from '@/app/admin/(dashboard)/_state/ekonomi/umkm/umkm';
import colors from '@/con/colors';
import { Box, Center, Flex, Grid, GridCol, Image, Pagination, Paper, Select, SimpleGrid, Skeleton, Stack, Text, TextInput, Title, Badge } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconMapPinFilled, IconSearch, IconUser } from '@tabler/icons-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  const router = useRouter()
  const state = useProxy(umkmState.umkm)
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 1000);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data, page, loading, totalPages, load } = state.findMany

  useShallowEffect(() => {
    umkmState.kategoriProduk.findManyAll.load()
  }, [])

  useShallowEffect(() => {
    load(page, 8, debouncedSearch, selectedCategory || undefined)
  }, [page, debouncedSearch, selectedCategory])

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
              Direktori UMKM Desa Darmasaba
            </Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 3 }}>
            <TextInput
              radius="lg"
              placeholder="Cari UMKM"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
          Daftar Usaha Mikro, Kecil, dan Menengah yang ada di wilayah Desa Darmasaba. 
          Mendukung pertumbuhan ekonomi lokal melalui pemberdayaan pengusaha desa.
        </Text>
      </Box>

      <Box px={{ base: "md", md: 100 }}>
        <Stack gap="lg">
          <SimpleGrid pb={10} cols={{ base: 1, md: 2 }}>
            <Box>
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
                nothingFoundMessage="Tidak ada kategori ditemukan"
                style={{ width: '100%' }}
              />
            </Box>
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
            {data?.map((v, k) => (
              <motion.div
                key={k}
                onClick={() => router.push(`/darmasaba/ekonomi/umkm/${v.id}`)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Paper p="md" radius="md" withBorder shadow="xs" style={{ cursor: 'pointer', height: '100%' }}>
                  <Image
                    radius="md"
                    src={v.image?.link || '/no-image.jpg'}
                    alt={v.nama}
                    h={180}
                    w="100%"
                    style={{ objectFit: 'cover' }}
                    fallbackSrc="/no-image.jpg"
                  />
                  <Badge mt="md" variant="light" color="blue">
                    {v.kategori?.nama}
                  </Badge>
                  <Text mt="xs" fw="bold" fz="lg" lh={1.2} lineClamp={1}>
                    {v.nama}
                  </Text>
                  <Flex mt={8} gap="xs" align="center">
                    <IconUser size={16} color="gray" />
                    <Text fz="sm" c="dimmed">{v.pemilik}</Text>
                  </Flex>
                  <Flex mt={4} gap="xs" align="center">
                    <IconMapPinFilled size={16} color="red" />
                    <Text fz="sm" c="dimmed" lineClamp={1}>{v.alamat || 'Darmasaba'}</Text>
                  </Flex>
                </Paper>
              </motion.div>
            ))}
          </SimpleGrid>

          {data.length === 0 && (
            <Center py={50}>
              <Text c="dimmed">Tidak ada UMKM ditemukan</Text>
            </Center>
          )}

          <Center>
            <Pagination
              value={page}
              onChange={(newPage) => load(newPage)}
              total={totalPages}
              my="md"
            />
          </Center>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
