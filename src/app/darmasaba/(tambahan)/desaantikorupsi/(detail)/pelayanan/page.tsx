import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { Box, Button, Container, Flex, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconClipboardText } from '@tabler/icons-react';

const data = [
  {
    judul: "PENGUATAN PENGAWASAN",
    deskripsi: "3.1 ADANYA LAYANAN PENGADUAN BAGI MASYARAKAT",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
  },
  {
    judul: "PENGUATAN PENGAWASAN",
    deskripsi: "3.2 ADANYA SURVEY KEPUASAN MASYARAKAT (SKM) TERHADAP LAYANAN PEMERINTAH DESA",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
  },
  {
    judul: "PENGUATAN PENGAWASAN",
    deskripsi: "3.3 ADANYA KETERBUKAAN AKSES MASYARAKAT TERHADAP INFORMASI LAYANAN PEMERINTAH DESA (KESEHATAN, PENDIDIKAN, SOSIAL, LINGKUNGAN, TRANTIBUMLINMAS, PEKERJAAN UMUM) PEMBANGUNAN, KEPENDUDUKAN, KEUANGAN, DAN PELAYANAN LAINNYA",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
  },
  {
    judul: "PENGUATAN PENGAWASAN",
    deskripsi: "3.4 ADANYA MEDIA INFORMASI TENTANG APBDES DI BALAI DESA DAN/ATAU TEMPAT LAIN YANG MUDAH DIAKSES OLEH MASYARAKAT",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
  },
  {
    judul: "PENGUATAN PENGAWASAN",
    deskripsi: "3.5 ADANYA MAKLUMAT PELAYANAN",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
  },
]



function Pelayanan() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={22}>
      <Box px={{ base: "md", md: 100 }}><BackButton /></Box>
      <Container w={{ base: "100%", md: "50%" }}>
        <Stack align="center" gap={0}>
          <Text fz={"3.4rem"} fw={"bold"} ta={"center"}>
            Penguatan Kualitas Pelayanan Publik
          </Text>
          <Text
            py={10}
            ta={"justify"}
          >
            Sebagai bagian dari Program Desa Anti Korupsi, Desa Darmasaba berkomitmen untuk meningkatkan kualitas pelayanan publik agar lebih transparan, cepat, dan bebas dari pungutan liar. Penguatan ini bertujuan untuk memastikan masyarakat mendapatkan pelayanan yang profesional, akuntabel, dan sesuai dengan standar yang telah ditetapkan. Adapun beberapa Penguatan Kualitas Pelayanan Publik :
          </Text>
        </Stack>
      </Container>
      <SimpleGrid
        px={{ base: "md", md: 100 }}
        cols={{
          base: 1,
          sm: 2,
        }}>
        {data.map((v, k) => {
          return (
            <Box
              key={k}
            >
              <Paper p={"lg"} h="100%">
                <Stack h="100%">
                  <Text fz={"lg"} ta={"center"} c={colors["blue-button"]}>{v.judul}</Text>
                  <Flex direction={{ base: "column", md: "row" }} align="center" justify="center" style={{ flex: 1 }}>
                    <Box mb={{ base: 10, md: 0 }}>
                      {v.icon}
                    </Box>
                    <Stack px={{ base: 0, md: 20 }} gap={10} style={{ flex: 1 }}>
                      <Text fz={"sm"} ta={"justify"}>{v.deskripsi}</Text>
                      <Button bg={colors["blue-button"]} radius={"lg"} w="fit-content">Download</Button>
                    </Stack>
                  </Flex>
                </Stack>
              </Paper>
            </Box>
          );
        })}
      </SimpleGrid >
    </Stack >
  );
}

export default Pelayanan;


