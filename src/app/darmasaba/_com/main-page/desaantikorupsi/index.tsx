'use client'
import colors from "@/con/colors";
import { Box, Button, Center, Container, Flex, Paper, SimpleGrid, Stack, Text, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconClipboardText } from "@tabler/icons-react";
import Link from "next/link";

function DesaAntiKorupsi() {
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
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  return (
    <Stack gap={"0"} bg={colors.Bg} p={"sm"} h={mobile ? 2000 : 1150}>
      <Container w={{ base: "100%", md: "80%" }} p={"xl"} >
        <Center>
          <Text fz={"3.4rem"}>Desa Anti Korupsi</Text>
        </Center>
        <Text ta={"center"} fz={"1.4rem"}>Desa antikorupsi mendorong pemerintahan jujur dan transparan. Keuangan desa dikelola terbuka dengan melibatkan warga mengawasi anggaran, sehingga digunakan tepat sasaran sesuai kebutuhan.</Text>
        <Center py={20}>
          <Button radius={"lg"} fz={"h4"} bg={colors["blue-button"]} component={Link} href={"/darmasaba/desaantikorupsi"}>Selengkapnya</Button>
        </Center>
      </Container>
      <SimpleGrid
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
                <Flex gap={"lg"} justify={"center"} align={"center"}>
                  <Box >
                    <Text fz={"lg"} ta={"center"} c={colors["blue-button"]}>{v.judul}</Text>
                    <Flex justify={"center"} align={"center"}>
                      <Box>
                        {v.icon}
                      </Box>
                      <Box px={20}>
                        <Text fz={"sm"} ta={"justify"}>{v.deskripsi}</Text>
                      </Box>
                    </Flex>
                  </Box>
                </Flex>
              </Paper>
            </Box>
          )
        })}
      </SimpleGrid>
    </Stack>
  );
}

export default DesaAntiKorupsi;
