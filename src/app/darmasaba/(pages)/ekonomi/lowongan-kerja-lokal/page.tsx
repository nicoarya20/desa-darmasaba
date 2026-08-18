'use client'
import lowonganKerjaState from '@/app/admin/(dashboard)/_state/ekonomi/lowongan-kerja';
import colors from '@/con/colors';
import { Box, Button, Center, Flex, Group, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconBriefcase, IconClock, IconMapPin, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

const ITEMS_PER_PAGE = 6;

const formatCurrency = (value: string | number) => {
  // Convert to string if it's a number
  const numStr = typeof value === 'number' ? value.toString() : value;

  // Remove all non-digit characters
  const digitsOnly = numStr.replace(/\D/g, '');

  // Format with thousand separators
  const formatted = digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `Rp.${formatted}`;
};

function Page() {
  const state = useProxy(lowonganKerjaState)
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 1000); // 500ms delay

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = state.findMany

  useEffect(() => {
    load(page, ITEMS_PER_PAGE, debouncedSearch)
  }, [page, debouncedSearch, load])

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} pb={80}>
        <Title order={1} ta="center" c={colors["blue-button"]} fw="bold" lh={1.15}>
          Lowongan Kerja Lokal
        </Title>
        <Group justify='center' mt={{ base: 'md', md: 'xl' }}>
          <TextInput
            radius={'xl'}
            w={{ base: '100%', md: 700 }}
            placeholder='Cari Pekerjaan'
            leftSection={<IconSearch size={20} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            fz={{ base: 'sm', md: 'md' }}
            lh={1.5}
          />
        </Group>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <SimpleGrid
            cols={{
              base: 1,
              md: 3
            }}
          >
            {data.map((v, k) => {
              return (
                <Paper key={k} p={'xl'}>
                  <Stack gap={'md'}>
                    <Box>
                      <Flex gap={{ base: 'md', md: 'xl' }} align={'center'}>
                        <Box style={{ flexShrink: 0 }}>
                          <IconBriefcase color={colors['blue-button']} size={40} />
                        </Box>
                        <Box>
                          <Text fw={'bold'} fz={{ base: 'lg', md: 'h4' }} c={colors['blue-button']} lh={1.3}>
                            {v.posisi}
                          </Text>
                          <Text fz={{ base: 'md', md: 'h4' }} lh={1.5}>
                            {v.namaPerusahaan}
                          </Text>
                        </Box>
                      </Flex>
                    </Box>
                    <Box>
                      <Flex gap={{ base: 'md', md: 'xl' }} align="center">
                        <Box style={{ flexShrink: 0 }}>
                          <IconMapPin
                            color={colors['blue-button']}
                            size={40}
                          />
                        </Box>

                        <Text
                          fz={{ base: 'md', md: 'h4' }}
                          lh={1.5}
                          lineClamp={1}
                        >
                          {v.lokasi}
                        </Text>
                      </Flex>

                    </Box>
                    <Box>
                      <Flex gap={{ base: 'md', md: 'xl' }} align={'center'}>
                        <Box style={{ flexShrink: 0 }}>
                          <IconClock color={colors['blue-button']} size={40} />
                        </Box>
                        <Box>
                          <Text fw={'bold'} fz={{ base: 'md', md: 'h4' }} c={colors['blue-button']} lh={1.3}>
                            Full Time
                          </Text>
                          <Text fz={{ base: 'sm', md: 'h4' }} lh={1.5}>
                            {formatCurrency(v.gaji)}
                          </Text>
                        </Box>
                      </Flex>
                    </Box>
                    <Button onClick={() => router.push(`/darmasaba/ekonomi/lowongan-kerja-lokal/${v.id}`)} fz={{ base: 'sm', md: 'md' }} lh={1.5}>
                      Detail
                    </Button>
                  </Stack>
                </Paper>
              )
            })}
          </SimpleGrid>
          <Center>
            <Pagination
              value={page}
              onChange={(newPage) => load(newPage, ITEMS_PER_PAGE, debouncedSearch)}
              total={totalPages}
              my="md"
            />
          </Center>
        </Stack>
      </Box >
    </Stack >
  );
}

export default Page;