import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { Box, Button, Container, Flex, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconClipboardText } from '@tabler/icons-react';

const data = [
  {
    judul: "PENGUATAN TATA LAKSANA",
    deskripsi: "4.1 ADANYA PARTISIPASI DAN KETERLIBATAN MASYARAKAT DALAM PENYUSUNAN RKP DESA",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
  },
  {
    judul: "PENGUATAN TATA LAKSANA",
    deskripsi: "4.2 ADANYA KESADARAN MASYARAKAT DALAM MENCEGAH TERJADINYA PRAKTIK GRATIFIKASI, SUAP DAN KONFLIK KEPENTINGAN",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
  },
  {
    judul: "PENGUATAN TATA LAKSANA",
    deskripsi: "4.3 ADANYA KETERLIBATAN LEMBAGA KEMASYARAKATAN DALAM PELAKSANAAN PEMBANGUNAN DESA",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
  },
]
function Partisipasi() {
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
            Sebagai bagian dari Program Desa Anti Korupsi, Desa Darmasaba menekankan penguatan partisipasi masyarakat agar warga dapat ikut serta dalam pengawasan, pengambilan keputusan, dan pelaksanaan pembangunan desa yang transparan dan akuntabel. Adapun beberapa Penguatan Partisipasi Masyarakat :
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

export default Partisipasi;


