'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Paper, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { IconChalkboard, IconMicroscope, IconSchool, IconSearch } from '@tabler/icons-react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { motion } from 'framer-motion';


const dataSekolah = [
  {
    id: 1,
    icon: <IconChalkboard size={55} color={colors["blue-button"]} />,
    jumlah: 15,
    nama: 'Lembaga Pendidikan'
  },
  {
    id: 2,
    icon: <IconSchool size={55} color={colors["blue-button"]} />,
    jumlah: 3209,
    nama: 'Siswa Terdaftar'
  },
  {
    id: 3,
    icon: <IconMicroscope size={55} color={colors["blue-button"]} />,
    jumlah: 285,
    nama: 'Tenaga Pengajar'
  },
]


function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} pb={20}>
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Cari Informasi Sekolah
        </Text>
        <Group justify='center' pb={20}>
          <TextInput
            w={{ base: "50%", md: "70%" }}
            placeholder='Cari Sekolah...'
            rightSection={
              <Button
                size="xs"
                style={{ height: '80%', marginRight: '5px' }}
                bg={colors["blue-button"]}
              >
                Cari
              </Button>
            }
            rightSectionWidth={70}
            leftSection={<IconSearch size={20} />}
          />
        </Group>
        <Group mb={20} gap="md" justify='center' wrap="wrap">
          <Paper bg={colors['blue-button']} radius="xl" py={5} px={20}>
            <Text c={colors['white-1']} size="sm">
              Semua
            </Text>
          </Paper>
          {['TK/PAUD', 'SD', 'SMP', 'SMA/SMK'].map((kategori) => (
            <Paper key={kategori} bg={'gray'} radius="xl" py={5} px={20}>
              <Text c={colors['white-1']} size="sm">
                {kategori}
              </Text>
            </Paper>
          ))}
        </Group>
        <SimpleGrid
          cols={{
            base: 1,
            md: 3
          }}
        >
          {dataSekolah.map((v, k) => {
            return (
              <Box key={k}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.8 }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <Paper p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
                    <Stack>
                      <Center>
                        {v.icon}
                      </Center>
                      <Text c={colors["blue-button"]} ta={'center'} fw={'bold'} fz={{ base: "h2", md: "h1" }}>{v.jumlah}</Text>
                      <Text c={colors["blue-button"]} ta={'center'} fw={'bold'}>{v.nama}</Text>
                    </Stack>
                  </Paper>
                </motion.div>
              </Box>
            )
          })}
        </SimpleGrid>
      </Box>
    </Stack>
  );
}

export default Page;
