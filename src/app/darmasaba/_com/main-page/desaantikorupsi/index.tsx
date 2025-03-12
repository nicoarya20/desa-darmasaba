"use client";
import colors from "@/con/colors";
import { Box, Button, Center, Container, Flex, Paper, SimpleGrid, Stack, Text, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconClipboardText } from "@tabler/icons-react";
import { motion } from "motion/react";

function DesaAntiKorupsi() {
  const data = [
    {
      judul: "PENGUATAN TATA LAKSANA",
      deskripsi: "1.1 ADANYA PERDES/KEPUTUSAN KEPALA DESA/SOP TENTANG PERENCANAAN, PELAKSANAAN, PENATAUSAHAAN DAN PERTANGGUNG JAWABAN APBDES BESERTA IMPLEMENTASINYA",
      icon: <IconClipboardText size={180} color={colors["blue-button"]} />,
    },
    {
      judul: "PENGUATAN TATA LAKSANA",
      deskripsi: "1.1 ADANYA PERDES/KEPUTUSAN KEPALA DESA/SOP TENTANG PERENCANAAN, PELAKSANAAN, PENATAUSAHAAN DAN PERTANGGUNG JAWABAN APBDES BESERTA IMPLEMENTASINYA",
      icon: <IconClipboardText size={180} color={colors["blue-button"]} />,
    },
    {
      judul: "PENGUATAN TATA LAKSANA",
      deskripsi: "1.1 ADANYA PERDES/KEPUTUSAN KEPALA DESA/SOP TENTANG PERENCANAAN, PELAKSANAAN, PENATAUSAHAAN DAN PERTANGGUNG JAWABAN APBDES BESERTA IMPLEMENTASINYA",
      icon: <IconClipboardText size={180} color={colors["blue-button"]} />,
    },
    {
      judul: "PENGUATAN TATA LAKSANA",
      deskripsi: "1.1 ADANYA PERDES/KEPUTUSAN KEPALA DESA/SOP TENTANG PERENCANAAN, PELAKSANAAN, PENATAUSAHAAN DAN PERTANGGUNG JAWABAN APBDES BESERTA IMPLEMENTASINYA",
      icon: <IconClipboardText size={180} color={colors["blue-button"]} />,
    },
    {
      judul: "PENGUATAN TATA LAKSANA",
      deskripsi: "1.1 ADANYA PERDES/KEPUTUSAN KEPALA DESA/SOP TENTANG PERENCANAAN, PELAKSANAAN, PENATAUSAHAAN DAN PERTANGGUNG JAWABAN APBDES BESERTA IMPLEMENTASINYA",
      icon: <IconClipboardText size={180} color={colors["blue-button"]} />,
    },
    {
      judul: "PENGUATAN TATA LAKSANA",
      deskripsi: "1.1 ADANYA PERDES/KEPUTUSAN KEPALA DESA/SOP TENTANG PERENCANAAN, PELAKSANAAN, PENATAUSAHAAN DAN PERTANGGUNG JAWABAN APBDES BESERTA IMPLEMENTASINYA",
      icon: <IconClipboardText size={180} color={colors["blue-button"]} />,
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
      </Container>
        <SimpleGrid
          pt={50}
          cols={{
            base: 1,
            sm: 2,

          }}>
          {data.map((v, k) => {
            return (
              <motion.div
                key={k}

                whileTap={{ scale: 0.8 }}
              >
                <Paper p={"lg"} >
                  <Flex gap={"lg"} justify={"center"} align={"center"}>
                    <Box >
                      <Text fz={"lg"} ta={"center"} c={colors["blue-button"]}>{v.judul}</Text>
                      <Flex gap={"lg"} justify={"center"} align={"center"}>
                        {v.icon}
                        <Box>
                          <Text fz={"sm"} ta={"justify"}>{v.deskripsi}</Text>
                          <Box pt={10}>
                            <Button bg={colors["blue-button"]} radius={"lg"}>Download</Button>
                          </Box>
                        </Box>
                      </Flex>
                    </Box>
                  </Flex>
                </Paper>
              </motion.div>
            )
          })}
        </SimpleGrid>
    </Stack>
  );
}

export default DesaAntiKorupsi;
