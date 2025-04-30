'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Image, Paper, SimpleGrid, Stack, Stepper, StepperStep, Text, Title } from '@mantine/core';
import { useState } from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';

const dataBeasiswa = [
  {
    id: 1,
    nama: 'Penerima Beasiswa',
    jumlah: '250+'
  },
  {
    id: 2,
    nama: 'Peluang Kelulusan',
    jumlah: '90%'
  },
  {
    id: 3,
    nama: 'Dana Tersalurkan',
    jumlah: '1.5M'
  },
]
const dataProgram = [
  {
    id: 1,
    judul: "Pelatihan SoftSkill",
    deskripsi: "Program pengembangan diri untuk mempersiapkan karir masa depan",
  },
  {
    id: 2,
    judul: "Peningkatan Akses Pendidikan ",
    deskripsi: "Program yang menjangkau masyarakat kurang mampu secara finansial, mengurangi angka putus sekolah",
  },
  {
    id: 3,
    judul: "Pendampingan Intensif",
    deskripsi: "Program dengan mentor berpengalaman yang membimbing dalam perjalanan akademik",
  }
]
function Page() {
  const [active, setActive] = useState(1);
  const nextStep = () => setActive((current) => (current < 5 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      {/* Page 1 */}
      <Box px={{ base: 'md', md: 100 }} pb={50}>
        <SimpleGrid
          cols={{
            base: 1,
            md: 2
          }}
        >
          <Box>
            <Title fz={55} fw={'bold'} c={colors['blue-button']}>
              Wujudkan Mimpi Pendidikanmu di Desa Darmasaba
            </Title>
            <Text fz={'xl'} >
              Program beasiswa komprehensif untuk mendukung pendidikan berkualitas bagi putra-putri Desa Darmasaba.
            </Text>
            <SimpleGrid
              mt={10}
              cols={{
                base: 1,
                md: 2
              }}
            >
              <Button bg={colors['blue-button']} fz={'lg'}>Daftar Sekarang</Button>
              <Button bg={colors['blue-button-trans']} fz={'lg'}>Pelajari Lebih Lanjut</Button>
            </SimpleGrid>
          </Box>
          <Box>
            <Image alt='' src={'/api/img/beasiswa-siswa.png'} />
          </Box>
        </SimpleGrid>
        <SimpleGrid mt={30}
          cols={{
            base: 1,
            md: 3
          }}
        >
          {dataBeasiswa.map((v, k) => {
            return (
              <Box key={k}>
                <Paper p={'xl'} bg={colors['white-trans-1']}>
                  <Title ta={'center'} fz={55} fw={'bold'} c={colors['blue-button']}>
                    {v.jumlah}
                  </Title>
                  <Text ta={'center'}>
                    {v.nama}
                  </Text>
                </Paper>
              </Box>
            )
          })}
        </SimpleGrid>
      </Box>
      {/* ---- */}
      <Box px={{ base: 'md', md: 100 }} pb={20}>
        <Title pb={20} ta={'center'} order={1} fw={'bold'} c={colors['blue-button']}>
          Keunggulan Program
        </Title>
        <Paper p={'xl'} bg={colors['white-trans-1']}>
          <SimpleGrid
            cols={{
              base: 1,
              md: 3
            }}
          >
            {dataProgram.map((v, k) => {
              return (
                <Box key={k}>
                  <Title order={2} fw={'bold'} c={colors['blue-button']}>
                    {v.judul}
                  </Title>
                  <Text>
                    {v.deskripsi}
                  </Text>
                  {/* <Divider orientation="vertical" size="md" h="auto" /> */}
                </Box>
              )
            })}
          </SimpleGrid>
        </Paper>
        <Title py={20} ta={'center'} order={1} fw={'bold'} c={colors['blue-button']}>
          Timeline Pendaftaran
        </Title>
        <Center>
          <Stepper mt={20} active={active} onStepClick={setActive} orientation="vertical" allowNextStepsSelect={false}>
            <StepperStep label="Pembukaan Pendaftaran 1 Maret 2025" description="" />
            <StepperStep label="Seleksi Administrasi 15 Maret 2025" description="" />
            <StepperStep label="Tes Potensi Akademik 1 April 2025" description="" />
            <StepperStep label="Wawancara 15 April 2025" description="" />
            <StepperStep label="Pengumuman 1 Mei 2025" description="" />
          </Stepper>
        </Center>

        <Group justify="center" mt="xl">
          <Button variant="default" onClick={prevStep}>Back</Button>
          <Button onClick={nextStep}>Next step</Button>
        </Group>
      </Box>
    </Stack>
  );
}

export default Page;
