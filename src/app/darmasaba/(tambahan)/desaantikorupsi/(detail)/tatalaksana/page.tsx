import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { Box, Button, Container, Flex, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconClipboardText } from '@tabler/icons-react';

const data = [
  {
    judul: "PENGUATAN TATA LAKSANA",
    deskripsi: "1.1 ADANYA PERDES/KEPUTUSAN KEPALA DESA/SOP TENTANG PERENCANAAN, PELAKSANAAN, PENATAUSAHAAN DAN PERTANGGUNG JAWABAN APBDES BESERTA IMPLEMENTASINYA",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
  },
  {
    judul: "PENGUATAN TATA LAKSANA",
    deskripsi: "1.2 ADANYA PERDES/KEPUTUSAN KEPALA DESA/SOP MENGENAI MEKANISME EVALUASI KINERJA PERANGKAT DESA",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
  },
  {
    judul: "PENGUATAN TATA LAKSANA",
    deskripsi: "1.3 ADANYA PERDES/KEPUTUSAN KEPALA DESA/SOP TENTANG PENGENDALIAN GRATIFIKASI, SUAP DAN KONFLIK KEPENTINGAN",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
  },
  {
    judul: "PENGUATAN TATA LAKSANA",
    deskripsi: "1.4 PERJANJIAN KERJA SAMA ANTARA PELAKSANA KEGIATAN  ANGGARAN DENGAN PIHAK PENYEDIA, DAN TELAH MELALUI PROSES PENGADAAN BARANG/JASA DI DESA",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
  },
  {
    judul: "PENGUATAN TATA LAKSANA",
    deskripsi: "1.5 ADANYA PERDES/KEPUTUSAN KEPALA DESA/SOP TENTANG PAKTA INTEGRITAS DAN SEJENISNYA",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
  },
  {
    judul: "PENGUATAN TATA LAKSANA",
    deskripsi: "1.6 ADANYA PERDES/KEPUTUSAN KEPALA DESA/SOP TENTANG PERENCANAAN, PELAKSANAAN, PENATAUSAHAAN DAN PERTANGGUNG JAWABAN APBDES BESERTA IMPLEMENTASINYA",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
  },
]
function Tatalaksana() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={22}>
      <Container w={{ base: "100%", md: "50%" }}>
        <BackButton />
        <Stack align="center" gap={0}>
          <Text fz={"3.4rem"} fw={"bold"} ta={"center"}>
            Penguatan Tata Laksana
          </Text>
          <Text
            py={10}
            ta={"justify"}
          >
            Sebagai bagian dari Program Desa Anti Korupsi, Desa Darmasaba menerapkan penguatan tata laksana untuk memastikan transparansi, akuntabilitas, dan efisiensi dalam pemerintahan desa. Adapun beberapa Penguatan Tata Laksana :
          </Text>
        </Stack>
      </Container>
      <SimpleGrid
        px={50}
        cols={{
          base: 1,
          sm: 2,
        }}>
        {data.map((v, k) => {
          return (
            <Box
              key={k}
            >
              <Paper p={"lg"} >
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

export default Tatalaksana;


