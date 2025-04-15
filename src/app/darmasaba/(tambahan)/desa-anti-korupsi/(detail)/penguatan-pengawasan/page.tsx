import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { Box, Button, Container, Flex, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconClipboardText } from '@tabler/icons-react';

const data = [
  {
    judul: "PENGUATAN PENGAWASAN",
    deskripsi: "2.1 ADANYA KEGIATAN PENGAWASAN DAN EVALUASI KINERJA PERANGKAT DESA",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
  },
  {
    judul: "PENGUATAN PENGAWASAN",
    deskripsi: "2.2 ADANYA TINDAK LANJUT HASIL PEMBINAAN, PETUNJUK, ARAH, PENGAWASAN, DAN PEMERIKSAAN DARI PEMERINTAH PUSAT/DAERAH",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
  },
  {
    judul: "PENGUATAN PENGAWASAN",
    deskripsi: "2.3 TIDAK ADANYA APARATUR DESA DALAM 3(TIGA) TAHUN TERAKHIR YANG TERJERAT TINDAKAN PIDANA KORUPSI",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
  },
]



function Pengawasan() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={22}>
      <Box px={{ base: "md", md: 100 }}><BackButton /></Box>
      <Container w={{ base: "100%", md: "50%" }}>
        <Stack align="center" gap={0}>
          <Text fz={"3.4rem"} fw={"bold"} ta={"center"}>
            Penguatan Pengawasan
          </Text>
          <Text
            py={10}
            ta={"justify"}
          >
            Sebagai bagian dari Program Desa Anti Korupsi, Desa Darmasaba menerapkan penguatan pengawasan untuk memastikan transparansi dan akuntabilitas dalam pengelolaan pemerintahan desa. Sistem pengawasan ini melibatkan berbagai pihak, termasuk aparat desa, masyarakat, dan lembaga terkait, agar tidak ada celah bagi praktik korupsi. Adapun beberapa Penguatan Pengawasan :
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

export default Pengawasan;


