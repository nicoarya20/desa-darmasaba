'use client'
import lowonganKerjaState from '@/app/admin/(dashboard)/_state/ekonomi/lowongan-kerja';
import colors from '@/con/colors';
import { Box, Button, Center, Flex, Group, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconBriefcase, IconClock, IconMapPin, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

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
  const [debouncedSearch] = useDebouncedValue(search, 500); // 500ms delay

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = state.findMany

  useEffect(() => {
    load(page, 6, debouncedSearch)
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
      <Box px={{ base: 'md', md: 100 }}>
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Lowongan Kerja Lokal
        </Text>
        <Group justify='center'>
          <TextInput
            radius={'xl'}
            w={{ base: 500, md: 700 }}
            placeholder='Cari Pekerjaan'
            leftSection={<IconSearch size={20} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
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
                      <Flex gap={'xl'} align={'center'}>
                        <IconBriefcase color={colors['blue-button']} size={50} />
                        <Box>
                          <Text fw={'bold'} fz={'h4'} c={colors['blue-button']}>{v.posisi}</Text>
                          <Text fz={'h4'}>{v.namaPerusahaan}</Text>
                        </Box>
                      </Flex>
                    </Box>
                    <Box>
                      <Flex gap={'xl'} align={'center'}>
                        <IconMapPin color={colors['blue-button']} size={50} />
                        <Text fz={'h4'}>{v.lokasi}</Text>
                      </Flex>
                    </Box>
                    <Box>
                      <Flex gap={'xl'} align={'center'}>
                        <IconClock color={colors['blue-button']} size={50} />
                        <Box>
                          <Text fw={'bold'} fz={'h4'} c={colors['blue-button']}>Full Time</Text>
                          <Text fz={'h4'}>{formatCurrency(v.gaji)}</Text>
                        </Box>
                      </Flex>
                    </Box>
                    <Button onClick={() => router.push(`/darmasaba/ekonomi/lowongan-kerja-lokal/${v.id}`)}>Detail</Button>
                  </Stack>
                </Paper>
              )
            })}
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
      </Box >
    </Stack >
  );
}

export default Page;
