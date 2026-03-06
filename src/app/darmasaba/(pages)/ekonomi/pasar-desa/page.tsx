'use client'
import pasarDesaState from '@/app/admin/(dashboard)/_state/ekonomi/pasar-desa/pasar-desa';
import colors from '@/con/colors';
import { Box, Center, Flex, Grid, GridCol, Image, Pagination, Paper, Select, SimpleGrid, Skeleton, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconBrandWhatsapp, IconMapPinFilled, IconSearch, IconStarFilled } from '@tabler/icons-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
 import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  const router = useRouter()
  const state = useProxy(pasarDesaState.pasarDesa)
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 1000);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const {
    data,
    page,
    loading,
    totalPages,
    load,
  } = state.findMany

  useShallowEffect(() => {
    pasarDesaState.kategoriProduk.findManyAll.load()
  }, [])

  const filteredData = selectedCategory
    ? data?.filter(item =>
        item.KategoriToPasar?.some(kategori => kategori.kategoriId === selectedCategory)
      )
    : data;

  useShallowEffect(() => {
    load(page, 4, debouncedSearch, selectedCategory || undefined)
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
              Pasar Desa
            </Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 3 }}>
            <TextInput
              radius="lg"
              placeholder="Cari Produk"
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
          Pasar Desa Online adalah media promosi untuk membantu warga memasarkan dan memperkenalkan produk mereka.
        </Text>
      </Box>

      <Box px={{ base: "md", md: 100 }}>
        <Stack gap="lg">
          <SimpleGrid pb={30} cols={{ base: 1, md: 2 }}>
            <Box>
              <Select
                placeholder="Pilih Kategori"
                data={pasarDesaState.kategoriProduk.findManyAll.data?.map((v) => ({
                  value: v.id,
                  label: v.nama
                })) || []}
                value={selectedCategory}
                onChange={setSelectedCategory}
                clearable
                searchable
                nothingFoundMessage="Tidak ada kategori ditemukan"
                style={{ width: '100%' }}
                fz={{ base: 'sm', md: 'md' }}
                lh={{ base: 1.5, md: 1.55 }}
                c="black"
              />
            </Box>
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, md: 4 }}>
            {filteredData?.map((v, k) => (
              <Stack key={k}>
                <motion.div
                  onClick={() => router.push(`/darmasaba/ekonomi/pasar-desa/${v.id}`)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.8 }}
                >
                  <Paper p="lg">
                    <Image
                      radius="lg"
                      src={v.image?.link || '/placeholder-product.jpg'}
                      alt={v.nama}
                      h={200}
                      w="100%"
                      style={{ objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <Text
                      py="sm"
                      fw="bold"
                      fz={{ base: 'md', md: 'lg' }}
                      lh={{ base: 1.3, md: 1.25 }}
                      c="black"
                    >
                      {v.nama}
                    </Text>
                    <Text
                      fz={{ base: 'sm', md: 'md' }}
                      lh={{ base: 1.5, md: 1.55 }}
                      c="black"
                    >
                      Rp {v.harga.toLocaleString('id-ID')}
                    </Text>
                    <Flex py="sm" gap="md" align="center">
                      <IconStarFilled size={20} color="#EBCB09" />
                      <Text
                        fz={{ base: 'xs', md: 'sm' }}
                        lh={{ base: 1.4, md: 1.45 }}
                        c="black"
                      >
                        {v.rating}
                      </Text>
                    </Flex>
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Flex gap="md" align="center">
                          <IconMapPinFilled size={20} color="red" />
                          <Text
                            fz={{ base: 'xs', md: 'sm' }}
                            lh={{ base: 1.4, md: 1.45 }}
                            c="black"
                          >
                            {v.alamatUsaha}
                          </Text>
                        </Flex>
                      </Box>
                      <IconBrandWhatsapp size={20} color={colors['blue-button']} />
                    </Flex>
                  </Paper>
                </motion.div>
              </Stack>
            ))}
          </SimpleGrid>

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