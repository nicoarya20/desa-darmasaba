'use client'
import colors from '@/con/colors';
import { Stack, Box, Text, TextInput, Group, SimpleGrid, Paper, Flex, Button } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { IconBriefcase, IconClock, IconMapPin, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

const data = [
  {
    id: 1,
    kerja: 'Kasir',
    tempat: 'Toko Sumber Rejeki',
    alamat: 'Desa Munggu , Badung',
    gaji: 'Rp. 2.500.000 / bulan'

  },
  {
    id: 2,
    kerja: 'Kasir',
    tempat: 'Toko Sumber Rejeki',
    alamat: 'Desa Munggu , Badung',
    gaji: 'Rp. 2.500.000 / bulan'

  },
  {
    id: 3,
    kerja: 'Kasir',
    tempat: 'Toko Sumber Rejeki',
    alamat: 'Desa Munggu , Badung',
    gaji: 'Rp. 2.500.000 / bulan'

  },
  {
    id: 4,
    kerja: 'Kasir',
    tempat: 'Toko Sumber Rejeki',
    alamat: 'Desa Munggu , Badung',
    gaji: 'Rp. 2.500.000 / bulan'

  },
  {
    id: 5,
    kerja: 'Kasir',
    tempat: 'Toko Sumber Rejeki',
    alamat: 'Desa Munggu , Badung',
    gaji: 'Rp. 2.500.000 / bulan'

  },
  {
    id: 6,
    kerja: 'Kasir',
    tempat: 'Toko Sumber Rejeki',
    alamat: 'Desa Munggu , Badung',
    gaji: 'Rp. 2.500.000 / bulan'

  },

]
function Page() {
  const router = useRouter()
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
                          <Text fw={'bold'} fz={'h4'} c={colors['blue-button']}>{v.kerja}</Text>
                          <Text fz={'h4'}>{v.tempat}</Text>
                        </Box>
                      </Flex>
                    </Box>
                    <Box>
                      <Flex gap={'xl'} align={'center'}>
                        <IconMapPin color={colors['blue-button']} size={50} />
                        <Text fz={'h4'}>{v.alamat}</Text>
                      </Flex>
                    </Box>
                    <Box>
                      <Flex gap={'xl'} align={'center'}>
                        <IconClock color={colors['blue-button']} size={50} />
                        <Box>
                          <Text fw={'bold'} fz={'h4'} c={colors['blue-button']}>Full Time</Text>
                          <Text fz={'h4'}>{v.gaji}</Text>
                        </Box>
                      </Flex>
                    </Box>
                    <Button onClick={() => router.push('https://www.whatsapp.com/?lang=id')} bg={colors['blue-button']}>Lamar Sekarang</Button>
                  </Stack>
                </Paper>
              )
            })}
          </SimpleGrid>
        </Stack>
      </Box >
    </Stack >
  );
}

export default Page;
