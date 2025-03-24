import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { Box, Button, Container, Flex, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconClipboardText } from '@tabler/icons-react';

const data = [
  {
    judul: "PENGUATAN PENGAWASAN",
    deskripsi: "5.1 ADANYA BUDAYA LOKAL/HUKUM ADAT YANG MENDORONG UPAYA PENCEGAHAN TINDAK PIDANA KORUPSI",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
  },
  {
    judul: "PENGUATAN PENGAWASAN",
    deskripsi: "5.2 ADANYA TOKOH MASYARAKAT, TOKOH AGAMA, TOKOH ADAT, TOKOH PEMUDA, DAN KAUM PEREMPUAN YANG MENDORONG UPAYA PENCEGAHAN TINDAK PIDANA KORUPSI",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
  }
]



function Lokal() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={22}>
      <Box px={{ base: "md", md: 100 }}><BackButton /></Box>
      <Container w={{ base: "100%", md: "50%" }}>
        <Stack align="center" gap={0}>
          <Text fz={"3.4rem"} fw={"bold"} ta={"center"}>
            Kearifan Lokal
          </Text>
          <Text
            py={10}
            ta={"justify"}
          >
            Sebagai bagian dari Program Desa Anti Korupsi, Desa Darmasaba menerapkan kearifan lokal sebagai strategi dalam menciptakan pemerintahan desa yang bersih, transparan, dan berintegritas. Kearifan lokal ini menjadi landasan moral dan budaya yang memperkuat nilai-nilai kejujuran, gotong royong, serta kepedulian sosial dalam kehidupan masyarakat. Adapun beberapa Kearifan Lokal :
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

export default Lokal;


