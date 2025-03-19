'use client'
import colors from '@/con/colors';
import { Box, Button, Container, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconClipboardText } from '@tabler/icons-react';
import BackButton from '../../(pages)/desa/layanan/_com/BackButto';
import { useRouter } from 'next/navigation';

const data = [
  {
    judul: "PENGUATAN TATA LAKSANA",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
    link: "/darmasaba/desaantikorupsi/tatalaksana"
  },
  {
    judul: "PENGUATAN PENGAWASAN",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
    link: "/darmasaba/desaantikorupsi/pengawasan"
  },
  {
    judul: "PENGUATAN KUALITAS PELAYANAN PUBLIK",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
    link: "/darmasaba/desaantikorupsi/pelayanan"
  },
  {
    judul: "PENGUATAN PARTISIPASI MASYARAKAT",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
    link: "/darmasaba/desaantikorupsi/partisipasi"
  },
  {
    judul: "KEARIFAN LOKAL",
    icon: <IconClipboardText size={100} color={colors["blue-button"]} />,
    link: "/darmasaba/desaantikorupsi/lokal"
  }
]
function Page() {
  const router = useRouter();
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={22}>
      <Box px={{ base: "md", md: 100 }}><BackButton /></Box>
      <Container w={{ base: "100%", md: "50%" }}>
        <Stack align="center" gap={0}>
          <Text fz={"3.4rem"} fw={"bold"}>
            Desa Anti Korupsi
          </Text>
          <Text
            py={10}
            ta={"justify"}
          >
            Desa antikorupsi mendorong pemerintahan jujur dan transparan. Keuangan desa dikelola terbuka dengan melibatkan warga mengawasi anggaran, sehingga digunakan tepat sasaran sesuai kebutuhan. Adapun beberapa tata penguatan :
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
                <Box >
                  <Text fz={"lg"} ta={"center"} c={colors["blue-button"]}>{v.judul}</Text>
                  <Stack justify={"space-between"} align={"center"}>
                    <Box>
                      {v.icon}
                    </Box>
                    <Button fz={"h4"} color={colors["blue-button"]} onClick={() => router.push(v.link)}>Detail</Button>
                  </Stack>
                </Box>
              </Paper>
            </Box>
          )
        })}
      </SimpleGrid>
    </Stack>
  );
}

export default Page;
