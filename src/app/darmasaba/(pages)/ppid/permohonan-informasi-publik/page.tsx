import colors from '@/con/colors';
import { ActionIcon, Box, Button, Center, Image, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import BackButton from '../../desa/layanan/_com/BackButto';
import { IconDownload } from '@tabler/icons-react';

const data = [
  {
    id: 1,
    number: '1',
    title: "Langkah 1",
    desc: "Pemohon informasi publik mengajukan permohonan informasi kepada badan publik baik langsung maupun melalui surat elektronik",
  },
  {
    id: 2,
    number: '2',
    title: "Langkah 2",
    desc: "Isi formulir permohonan informasi dengan data diri (nama, alamat, telepon), jenis, format, dan cara penyampaian informasi, serta lampiran fotokopi kartu identitas.",
  },
  {
    id: 3,
    number: '3',
    title: "Langkah 3",
    desc: "PPID akan memproses permohonan sesuai dengan ketentuan",
  },
  {
    id: 4,
    number: '4',
    title: "Langkah 4",
    desc: "Petugas PPID menyampaikan informasi sesuai permohonan kepada pemohon informasi.",
  },
]

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
        Permohonan Informasi Publik
      </Text>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <Paper p={"xl"} bg={colors['white-trans-1']}>
            <Text pb={30} ta={'center'} fw={"bold"} fz={{ base: 'h3', md: 'h2' }}>Tata Cara Permohonan</Text>
            <SimpleGrid
              pb={30}
              cols={{
                base: 1,
                md: 4,
              }}>
              {data.map((v, k) => {
                return (
                  <Paper key={k} p={"xl"} bg={colors['blue-button']}>
                    <Stack justify='space-between'>
                      <Center>
                        <ActionIcon bg={colors['white-1']} radius={150} size={50}>
                          <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={{ base: "h3", md: "h2" }}>{v.number}</Text>
                        </ActionIcon>
                      </Center>
                      <Text ta={"center"} c={colors['white-1']} fw={"bold"} fz={"h3"}>
                        {v.title}
                      </Text>
                      <Text ta={"center"} c={colors['white-1']} fz={'h4'}>
                        {v.desc}
                      </Text>
                    </Stack>
                  </Paper>
                )
              })}
            </SimpleGrid>
            <Center pb={30}>
              <Button fz={"h5"} bg={colors['blue-button']} leftSection={<IconDownload size={20} color={colors['white-1']} />}>
                Unduh Dokumen
              </Button>
            </Center>
            <Image src={'/api/img/formulirpermohonan.png'} alt=''/>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
