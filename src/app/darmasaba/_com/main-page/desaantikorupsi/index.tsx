/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import korupsiState from "@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi";
import colors from "@/con/colors";
import { Button, Center, Container, Flex, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconClipboardText } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useProxy } from "valtio/utils";

function DesaAntiKorupsi() {
  const state = useProxy(korupsiState);
  const [loading, setLoading] = useState(false);
 

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
    <Stack gap={"0"} bg={colors.Bg} p={"sm"}>
      <Container w={{ base: "100%", md: "80%" }} p={"xl"} >
        <Center>
          <Text fw={"bold"} fz={{ base: "1.8rem", md: "3.4rem" }}>Desa Anti Korupsi</Text>
        </Center>
        <Text ta={"center"} fz={{ base: "1rem", md: "1.3rem" }}>Desa antikorupsi mendorong pemerintahan jujur dan transparan. Keuangan desa dikelola terbuka dengan melibatkan warga mengawasi anggaran, sehingga digunakan tepat sasaran sesuai kebutuhan.</Text>
        <Center py={20}>
          <Button radius={"lg"} fz={"h4"} bg={colors["blue-button"]} component={Link} href={"/darmasaba/desa-anti-korupsi/detail"}>Selengkapnya</Button>
        </Center>
      </Container>
      <Container w="100%" maw="80rem" px="md">
        {loading ? (
          <Center mih={200}>
            <Text fz="lg">Memuat Data...</Text>
          </Center>
        ) : (
          <SimpleGrid
            cols={{ base: 1, sm: 2, md: 3 }}
            spacing="lg"
            mt="lg"
            mb="xl"
          >
            {data.map((v, k) => (
              <Paper
                key={k}
                p="md"
                withBorder
                shadow="sm"
                radius="md"
                h="100%"
              >
                <Flex gap="md" align="flex-start">
                  <IconClipboardText
                    color={colors["blue-button"]}
                    size={40}
                    style={{ flexShrink: 0 }} // biar icon nggak ketekan
                  />
                  <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      fz={{ base: "sm", sm: "md", md: "lg", lg: "xl" }} // lebih besar di desktop
                      c={colors["blue-button"]}
                      fw={600}
                      style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                    >
                      {v.kategori?.name || "Kategori"}
                    </Text>
                    <Text
                      dangerouslySetInnerHTML={{
                        __html: v.name || "Name",
                      }}
                      fz={{ base: "sm", sm: "md", md: "lg", lg: "xl" }} // sama, scaling responsif
                      c="dark"
                      style={{
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                      }}
                    />
                  </Stack>
                </Flex>
              </Paper>
            ))}
          </SimpleGrid>

        )}
      </Container>
    </Stack>
  );
}

export default DesaAntiKorupsi;
