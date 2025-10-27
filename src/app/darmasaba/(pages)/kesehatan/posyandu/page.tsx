'use client'
import posyandustate from "@/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu";
import colors from "@/con/colors";
import { Badge, Box, Button, Center, Flex, Group, Image, List, ListItem, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput } from "@mantine/core";
import { useDebouncedValue, useShallowEffect } from "@mantine/hooks";
import { IconCalendar, IconInfoCircle, IconPhone, IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { useProxy } from "valtio/utils";
import BackButton from "../../desa/layanan/_com/BackButto";
import { useTransitionRouter } from "next-view-transitions";

export default function Page() {
  const state = useProxy(posyandustate);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 500); // 500ms delay
  const router = useTransitionRouter()

  const { data, page, totalPages, loading, load } = state.findMany;

  useShallowEffect(() => {
    load(page, 6, debouncedSearch);
  }, [page, debouncedSearch]);

  if (loading || !data) {
    return (
      <Box py="xl" px={{ base: "md", md: 100 }}>
        <Skeleton h={500} radius="lg" />
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Stack pos="relative" bg={colors.Bg} py="xl" gap="xl">
        <Box px={{ base: "md", md: 100 }}>
          <BackButton />
          <Flex mt="md" justify="space-between" align="center" wrap="wrap" gap="md">
            <Text
              ta="left"
              fz={{ base: "1.8rem", md: "2.5rem" }}
              c={colors["blue-button"]}
              fw="bold"
            >
              Posyandu Desa Darmasaba
            </Text>
            <TextInput
              placeholder="Cari posyandu berdasarkan nama..."
              aria-label="Pencarian Posyandu"
              radius="xl"
              size="md"
              leftSection={<IconSearch size={20} />}
              w={{ base: "100%", md: "35%" }}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />
          </Flex>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="xl">
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
        <Flex mt="md" justify="space-between" align="center" wrap="wrap" gap="md">
          <Text
            ta="left"
            fz={{ base: "1.8rem", md: "2.5rem" }}
            c={colors["blue-button"]}
            fw="bold"
          >
            Posyandu Desa Darmasaba
          </Text>
          <TextInput
            placeholder="Cari posyandu berdasarkan nama..."
            aria-label="Pencarian Posyandu"
            radius="xl"
            size="md"
            leftSection={<IconSearch size={20} />}
            w={{ base: "100%", md: "35%" }}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
        </Flex>
      </Box>

      <Box px={{ base: "md", md: 100 }}>
        <Stack gap="xl">
          <SimpleGrid
            pb="lg"
            cols={{ base: 1, sm: 2, md: 3 }}
            spacing="lg"
          >
            {data?.map((v, k) => (
              <Paper
                key={k}
                p="xl"
                radius="lg"
                shadow="md"
                withBorder
                bg={colors["white-trans-1"]}
                style={{
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 8px 24px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.08)";
                }}
              >
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <Text c={colors["blue-button"]} fw="bold" fz="lg" lineClamp={1}>
                      {v.name}
                    </Text>
                    <Badge color="blue" variant="light" size="sm" radius="sm">
                      Aktif
                    </Badge>
                  </Group>
                  <Center>
                    <Image
                      src={v.image.link}
                      alt={`Gambar ${v.name}`}
                      radius="md"
                      w="100%"
                      h={180}
                      fit="cover"
                      loading="lazy"
                    />
                  </Center>
                  <Flex align="flex-start" gap="xs">
                    <IconPhone size={18} stroke={1.5} style={{ marginTop: 3 }} />
                    <Box>
                      <Text fz="sm" c="dimmed" lh={1.4}>
                        {v.nomor || "Tidak tersedia"}
                      </Text>
                    </Box>
                  </Flex>

                  <Flex align="flex-start" gap="xs">
                    <IconCalendar size={18} stroke={1.5} style={{ marginTop: 3 }} />
                    <Box>
                      <Text fz="sm" c="dimmed" lh={1.4}>
                        <strong>Jadwal:</strong>{" "}
                        <span
                          style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                          dangerouslySetInnerHTML={{ __html: v.jadwalPelayanan }}
                        />
                      </Text>
                    </Box>
                  </Flex>

                  <Flex align="flex-start" gap="xs">
                    <IconInfoCircle size={18} stroke={1.5} style={{ marginTop: 3 }} />
                    <Text
                      fz="sm"
                      lh={1.5}
                      c="dimmed"
                      dangerouslySetInnerHTML={{ __html: v.deskripsi }}
                      style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                      lineClamp={3}
                      truncate="end"
                    />
                  </Flex>
                  <Button radius="lg" size="md" variant="outline" onClick={() => router.push(`/darmasaba/kesehatan/posyandu/${v.id}`)}>Detail</Button>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>

          {totalPages > 1 && (
            <Center>
              <Pagination
                value={page}
                onChange={(newPage) => load(newPage)}
                total={totalPages}
                radius="lg"
                size="md"
                withControls
                mt="md"
              />
            </Center>
          )}

          <Stack gap="sm">
            <Flex align="center" gap="xs">
              <IconInfoCircle size={22} color={colors["blue-button"]} />
              <Text fz="lg" fw="bold" c={colors["blue-button"]}>
                Layanan Utama Posyandu
              </Text>
            </Flex>
            <List spacing="xs" size="sm" center>
              <ListItem>Penimbangan bayi dan balita</ListItem>
              <ListItem>Pemantauan status gizi</ListItem>
              <ListItem>Imunisasi dasar lengkap</ListItem>
              <ListItem>Konseling kesehatan</ListItem>
              <ListItem>Pemantauan kesehatan ibu hamil</ListItem>
            </List>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}
