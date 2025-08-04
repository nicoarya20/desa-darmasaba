/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from "@/con/colors";
import { Box, Button, Center, Container, Flex, Paper, SimpleGrid, Stack, Text, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconClipboardText } from "@tabler/icons-react";
import Link from "next/link";
import korupsiState from "@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi";
import { useProxy } from "valtio/utils";
import { useEffect, useState } from "react";

function DesaAntiKorupsi() {
  const state = useProxy(korupsiState);
  const [loading, setLoading] = useState(false);
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await state.desaAntikorupsi.findMany.load();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [])

  const data = (state.desaAntikorupsi.findMany.data || []).slice(0, 6);
  return (
    <Stack gap={"0"} bg={colors.Bg} p={"sm"} h={mobile ? 2000 : 1050}>
      <Container w={{ base: "100%", md: "80%" }} p={"xl"} >
        <Center>
          <Text fz={{ base: "2.4rem", md: "3.4rem" }}>Desa Anti Korupsi</Text>
        </Center>
        <Text ta={"center"} fz={{ base: "1.2rem", md: "1.4rem" }}>Desa antikorupsi mendorong pemerintahan jujur dan transparan. Keuangan desa dikelola terbuka dengan melibatkan warga mengawasi anggaran, sehingga digunakan tepat sasaran sesuai kebutuhan.</Text>
        <Center py={20}>
          <Button radius={"lg"} fz={"h4"} bg={colors["blue-button"]} component={Link} href={"/darmasaba/desa-anti-korupsi/detail"}>Selengkapnya</Button>
        </Center>
      </Container>
      <SimpleGrid
        cols={{
          base: 1,
          sm: 2,

        }}>
        {loading ? (
          <Center>
            <Text fz={"2.4rem"}>Memuat Data...</Text>
          </Center>
        ) : (
          data.map((v, k) => {
            return (
              <Box
                key={k}
              >
                <Paper
                  p={"lg"}
                  withBorder
                  shadow="sm"
                  h={{ base: 250, md: 210 }}
                >
                  <Flex gap={"lg"} align={"center"}>
                    <Box>
                      <Flex justify={"center"} align={"center"}>
                        <Box>
                          <IconClipboardText color={colors["blue-button"]} size={50} />
                        </Box>
                        <Box px={20} >
                         <Stack gap={"xs"}>
                         <Text fz={{ base: "1.2rem", md: "lg" }} ta={"center"} c={colors["blue-button"]} fw={500}>
                            {v.kategori?.name || v.name || 'Kategori'}
                          </Text>
                          <Text dangerouslySetInnerHTML={{ __html: v.name || 'Name' }} fz={{ base: "1rem", md: "lg" }} ta={"center"} c={colors["blue-button"]} fw={500} />
                         </Stack>
                        </Box>
                      </Flex>
                    </Box>
                  </Flex>
                </Paper>
              </Box>
            )
          })
        )}
      </SimpleGrid>
    </Stack>
  );
}

export default DesaAntiKorupsi;
