/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import korupsiState from "@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi";
import colors from "@/con/colors";
import {
  Button,
  Center,
  Container,
  Flex,
  Paper,
  SimpleGrid,
  Stack,
  Text
} from "@mantine/core";
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
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const data = (state.desaAntikorupsi.findMany.data || []).slice(0, 6);

  return (
    <Stack gap="0" bg={colors.Bg} px="sm" py="var(--section-pad-y)">
      {/* ===================== HEADER ===================== */}
      <Container w={{ base: "100%", md: "80%" }} px="md">
        <Center>
          <Text
            fw={700}
            ta="center"
            c={colors["blue-button"]}
            fz={{ base: "1.8rem", md: "3.2rem" }}
            lh={{ base: "2.2rem", md: "3.4rem" }}
          >
            Desa Anti Korupsi
          </Text>
        </Center>

        <Text
          ta="center"
          c="black"
          fz={{ base: "1rem", md: "1.25rem" }}
          lh={{ base: "1.5rem", md: "1.8rem" }}
          mt="sm"
        >
          Desa antikorupsi mendorong pemerintahan jujur dan transparan.
          Keuangan desa dikelola secara terbuka dengan melibatkan warga
          dalam pengawasan anggaran, sehingga digunakan tepat sasaran dan
          sesuai kebutuhan masyarakat.
        </Text>

        <Center py={25}>
          <Button
            radius="lg"
            fz={{ base: "md", md: "lg" }}
            bg={colors["blue-button"]}
            component={Link}
            href="/darmasaba/desa-anti-korupsi/detail"
            style={{ paddingInline: "2rem" }}
          >
            Selengkapnya
          </Button>
        </Center>
      </Container>

      {/* ===================== LIST ===================== */}
      <Container w="100%" maw="80rem" px="md">
        {loading ? (
          <Center mih={200}>
            <Text fz={{ base: "md", md: "lg" }}>Memuat Data...</Text>
          </Center>
        ) : (
          <SimpleGrid
            cols={{ base: 1, sm: 2, md: 3 }}
            spacing="lg"
            mt="lg"
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
                    style={{ flexShrink: 0 }}
                  />

                  <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
                    {/* Title */}
                    <Text
                      fw={700}
                      c={colors["blue-button"]}
                      fz={{ base: "1rem", sm: "1.1rem", md: "1.25rem" }}
                      lh={{ base: "1.3rem", md: "1.5rem" }}
                      style={{
                        wordBreak: "break-word",
                        whiteSpace: "normal"
                      }}
                    >
                      {v.kategori?.name || "Kategori"}
                    </Text>

                    {/* Description */}
                    <Text
                      dangerouslySetInnerHTML={{
                        __html: v.name || "Name"
                      }}
                      c="dark"
                      fz={{ base: "0.9rem", sm: "1rem", md: "1.15rem" }}
                      lh={{ base: "1.3rem", md: "1.6rem" }}
                      style={{
                        wordBreak: "break-word",
                        whiteSpace: "normal"
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
