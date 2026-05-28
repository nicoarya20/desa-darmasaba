'use client'

import balitaState from "@/app/admin/(dashboard)/_state/kesehatan/balita/balita";
import ibuHamilState from "@/app/admin/(dashboard)/_state/kesehatan/ibu-hamil/ibuHamil";
import posyandustate from "@/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu";
import ringkasanState from "@/app/admin/(dashboard)/_state/kesehatan/ringkasan-kesehatan/ringkasanKesehatan";
import colors from "@/con/colors";
import {
  Badge, Box, Button, Center, Flex, Group, Image,
  Pagination, Paper, Progress, ScrollArea, Select,
  SimpleGrid, Skeleton, Stack, Tabs, Text, TextInput,
  ThemeIcon, Title,
} from "@mantine/core";
import { useDebouncedValue, useShallowEffect } from "@mantine/hooks";
import {
  IconActivity, IconCalendar, IconChartBar, IconHeart,
  IconMapPin, IconPhone, IconSearch, IconShieldCheck,
  IconUsers,
} from "@tabler/icons-react";
import { useState } from "react";
import { useProxy } from "valtio/utils";
import BackButton from "../../desa/layanan/_com/BackButto";
import { useTransitionRouter } from "next-view-transitions";

const stuntingBadgeColor = (s: string) =>
  s === "STUNTING" ? "red" : s === "ALERT" ? "yellow" : "green";

const ibuHamilBadgeColor = (s: string) => {
  if (s === "AKTIF") return "green";
  if (s === "MELAHIRKAN") return "blue";
  if (s === "KEGUGURAN") return "gray";
  return "red";
};

export default function Page() {
  const [activeTab, setActiveTab] = useState<string | null>("ringkasan");

  const stPosyandu = useProxy(posyandustate);
  const stBalita = useProxy(balitaState);
  const stIbuHamil = useProxy(ibuHamilState);
  const stRingkasan = useProxy(ringkasanState);

  const [searchPosyandu, setSearchPosyandu] = useState("");
  const [debouncedSearchPosyandu] = useDebouncedValue(searchPosyandu, 800);

  const [searchBalita, setSearchBalita] = useState("");
  const [debouncedSearchBalita] = useDebouncedValue(searchBalita, 800);
  const [filterStunting, setFilterStunting] = useState<string | null>(null);

  const [searchIbuHamil, setSearchIbuHamil] = useState("");
  const [debouncedSearchIbuHamil] = useDebouncedValue(searchIbuHamil, 800);
  const [filterStatusIbuHamil, setFilterStatusIbuHamil] = useState<string | null>(null);

  const router = useTransitionRouter();

  // Initial load: ringkasan
  useShallowEffect(() => {
    ringkasanState.findStats.load();
  }, []);

  // Load data sesuai tab aktif
  useShallowEffect(() => {
    if (activeTab === "ringkasan") {
      ringkasanState.findStats.load();
    } else if (activeTab === "posyandu") {
      posyandustate.findMany.load(1, 6, debouncedSearchPosyandu);
    } else if (activeTab === "balita") {
      balitaState.findMany.load(1, 10, debouncedSearchBalita, filterStunting ?? "");
    } else if (activeTab === "ibu-hamil") {
      ibuHamilState.findMany.load(1, 10, debouncedSearchIbuHamil, filterStatusIbuHamil ?? "");
    }
  }, [activeTab]);

  useShallowEffect(() => {
    if (activeTab === "posyandu") {
      posyandustate.findMany.load(1, 6, debouncedSearchPosyandu);
    }
  }, [debouncedSearchPosyandu]);

  useShallowEffect(() => {
    if (activeTab === "balita") {
      balitaState.findMany.load(1, 10, debouncedSearchBalita, filterStunting ?? "");
    }
  }, [debouncedSearchBalita, filterStunting]);

  useShallowEffect(() => {
    if (activeTab === "ibu-hamil") {
      ibuHamilState.findMany.load(1, 10, debouncedSearchIbuHamil, filterStatusIbuHamil ?? "");
    }
  }, [debouncedSearchIbuHamil, filterStatusIbuHamil]);

  const stats = stRingkasan.findStats.data;

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="xl" mih="100vh">
      {/* Header */}
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
        <Stack gap={4} mt="md">
          <Title order={1} c={colors["blue-button"]}>
            Kesehatan Posyandu
          </Title>
          <Text fz={{ base: "sm", md: "md" }} c="dimmed">
            Informasi posyandu, data balita, ibu hamil, dan ringkasan kesehatan Desa Darmasaba
          </Text>
        </Stack>
      </Box>

      {/* Tabs */}
      <Box px={{ base: "md", md: 100 }}>
        <Tabs
          variant="pills"
          color={colors["blue-button"]}
          radius="lg"
          value={activeTab}
          onChange={setActiveTab}
        >

          <Box mb="md"
            style={{
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              WebkitOverflowScrolling: 'touch', // ✅ smooth scroll di iOS
              msOverflowStyle: 'none',          // ✅ sembunyikan scrollbar di IE/Edge
              scrollbarWidth: 'none',           // ✅ sembunyikan scrollbar di Firefox
            }}
          >
            <Tabs.List
              style={{
                background: "linear-gradient(135deg, #e7ebf7, #f9faff)",
                borderRadius: "1rem",
                padding: "0.25rem",
                display: 'inline-flex',  // ✅ lebih tepat dari 'flex' untuk nowrap
                flexWrap: 'nowrap',
                gap: '0.5rem',
              }}
            >
              <Tabs.Tab value="ringkasan" leftSection={<IconChartBar size={16} />}>
                Ringkasan
              </Tabs.Tab>
              <Tabs.Tab value="posyandu" leftSection={<IconMapPin size={16} />}>
                Data Posyandu
              </Tabs.Tab>
              <Tabs.Tab value="balita" leftSection={<IconUsers size={16} />}>
                Balita
              </Tabs.Tab>
              <Tabs.Tab value="ibu-hamil" leftSection={<IconHeart size={16} />}>
                Ibu Hamil
              </Tabs.Tab>
            </Tabs.List>
          </Box>

          {/* ===== RINGKASAN ===== */}
          <Tabs.Panel value="ringkasan" pt="md">
            {stRingkasan.findStats.loading ? (
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} h={120} radius="lg" />
                ))}
              </SimpleGrid>
            ) : !stats ? (
              <Paper p="xl" radius="lg" withBorder bg="white" ta="center">
                <Text c="dimmed">Data ringkasan belum tersedia</Text>
              </Paper>
            ) : (
              <Stack gap="lg">
                {/* KPI utama */}
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                  {[
                    {
                      label: "Ibu Hamil Aktif",
                      value: stats.ibuHamilAktif,
                      color: colors["blue-button"],
                      icon: <IconHeart size={28} />,
                    },
                    {
                      label: "Balita Terdaftar",
                      value: stats.balitaTerdaftar,
                      color: "#22c55e",
                      icon: <IconUsers size={28} />,
                    },
                    {
                      label: "Alert Stunting",
                      value: stats.alertStunting,
                      color: "#ef4444",
                      icon: <IconActivity size={28} />,
                    },
                  ].map((s, i) => (
                    <Paper key={i} p="xl" radius="lg" withBorder bg="white" shadow="sm">
                      <Group gap="md">
                        <ThemeIcon size={52} radius="lg" color={s.color} variant="light">
                          {s.icon}
                        </ThemeIcon>
                        <Stack gap={4}>
                          <Text fz="2rem" fw={700} c={s.color} lh={1}>
                            {s.value}
                          </Text>
                          <Text fz="sm" c="dimmed">{s.label}</Text>
                        </Stack>
                      </Group>
                    </Paper>
                  ))}
                </SimpleGrid>

                {/* Persentase */}
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                  {[
                    {
                      label: "Imunisasi Lengkap",
                      pct: stats.imunisasiLengkapPct,
                      color: colors["blue-button"],
                      icon: <IconShieldCheck size={20} />,
                    },
                    {
                      label: "Gizi Baik",
                      pct: stats.giziBaikPct,
                      color: "#22c55e",
                      icon: <IconHeart size={20} />,
                    },
                    {
                      label: "Pemeriksaan Rutin",
                      pct: stats.pemeriksaanRutinPct,
                      color: "#f59e0b",
                      icon: <IconActivity size={20} />,
                    },
                  ].map((s, i) => (
                    <Paper key={i} p="lg" radius="lg" withBorder bg="white" shadow="sm">
                      <Stack gap="sm">
                        <Group gap="xs">
                          <ThemeIcon size={32} radius="md" color={s.color} variant="light">
                            {s.icon}
                          </ThemeIcon>
                          <Text fz="sm" fw={600}>{s.label}</Text>
                        </Group>
                        <Group gap="xs" align="center">
                          <Progress
                            value={s.pct}
                            color={s.color}
                            radius="xl"
                            size="md"
                            style={{ flex: 1 }}
                          />
                          <Text fz="sm" fw={700} c={s.color} w={40} ta="right">
                            {s.pct}%
                          </Text>
                        </Group>
                      </Stack>
                    </Paper>
                  ))}
                </SimpleGrid>
              </Stack>
            )}
          </Tabs.Panel>

          {/* ===== DATA POSYANDU ===== */}
          <Tabs.Panel value="posyandu" pt="md">
            <Stack gap="md">
              <TextInput
                placeholder="Cari nama posyandu..."
                radius="xl"
                leftSection={<IconSearch size={18} />}
                value={searchPosyandu}
                onChange={(e) => setSearchPosyandu(e.currentTarget.value)}
                w={{ base: "100%", md: "40%" }}
              />

              {stPosyandu.findMany.loading ? (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} h={300} radius="lg" />
                  ))}
                </SimpleGrid>
              ) : !stPosyandu.findMany.data?.length ? (
                <Paper p="xl" radius="lg" withBorder bg="white" ta="center">
                  <Text c="dimmed">Tidak ada posyandu ditemukan</Text>
                </Paper>
              ) : (
                <>
                  <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                    {stPosyandu.findMany.data.map((v, k) => (
                      <Paper
                        key={k}
                        p="xl"
                        radius="lg"
                        shadow="sm"
                        withBorder
                        bg="white"
                        style={{ transition: "transform 0.2s, box-shadow 0.2s" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                          (e.currentTarget as HTMLElement).style.boxShadow =
                            "0 8px 24px rgba(0,0,0,0.12)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                          (e.currentTarget as HTMLElement).style.boxShadow = "";
                        }}
                      >
                        <Stack gap="sm">
                          <Group justify="space-between" align="flex-start" wrap="nowrap">
                            <Title
                              order={4}
                              c={colors["blue-button"]}
                              lineClamp={1}
                              style={{ flex: 1 }}
                            >
                              {v.name}
                            </Title>
                            <Badge
                              color="green"
                              variant="light"
                              size="sm"
                              radius="sm"
                              style={{ flexShrink: 0 }}
                            >
                              Aktif
                            </Badge>
                          </Group>

                          <Image
                            src={v.image?.link ?? "/no-image.jpg"}
                            alt={`Gambar ${v.name}`}
                            radius="md"
                            h={160}
                            fit="cover"
                          />

                          {v.banjar && (
                            <Flex align="center" gap="xs">
                              <IconMapPin size={16} stroke={1.5} color={colors["blue-button"]} />
                              <Text fz="sm" c="dimmed">Banjar {v.banjar.name}</Text>
                            </Flex>
                          )}

                          <Flex align="center" gap="xs">
                            <IconPhone size={16} stroke={1.5} color="gray" />
                            <Text fz="sm" c="dimmed">{v.nomor || "–"}</Text>
                          </Flex>

                          <Flex align="flex-start" gap="xs">
                            <IconCalendar
                              size={16}
                              stroke={1.5}
                              color="gray"
                              style={{ marginTop: 2, flexShrink: 0 }}
                            />
                            <Text
                              fz="sm"
                              c="dimmed"
                              lh={1.5}
                              lineClamp={2}
                              dangerouslySetInnerHTML={{ __html: v.jadwalPelayanan }}
                              style={{ wordBreak: "break-word" }}
                            />
                          </Flex>

                          <Button
                            radius="lg"
                            variant="outline"
                            color={colors["blue-button"]}
                            fullWidth
                            mt="xs"
                            onClick={() =>
                              router.push(`/darmasaba/kesehatan/posyandu/${v.id}`)
                            }
                          >
                            Lihat Detail
                          </Button>
                        </Stack>
                      </Paper>
                    ))}
                  </SimpleGrid>

                  <Center>
                    <Pagination
                      value={stPosyandu.findMany.page}
                      onChange={(p) =>
                        posyandustate.findMany.load(p, 6, searchPosyandu)
                      }
                      total={stPosyandu.findMany.totalPages}
                      radius="lg"
                      color={colors["blue-button"]}
                    />
                  </Center>
                </>
              )}
            </Stack>
          </Tabs.Panel>

          {/* ===== BALITA ===== */}
          <Tabs.Panel value="balita" pt="md">
            <Stack gap="md">
              <Group wrap="wrap">
                <TextInput
                  placeholder="Cari nama, orang tua..."
                  radius="xl"
                  leftSection={<IconSearch size={18} />}
                  value={searchBalita}
                  onChange={(e) => setSearchBalita(e.currentTarget.value)}
                  style={{ flex: 1, minWidth: 200 }}
                />
                <Select
                  placeholder="Semua status stunting"
                  clearable
                  radius="xl"
                  data={[
                    { value: "NORMAL", label: "Normal" },
                    { value: "ALERT", label: "Alert" },
                    { value: "STUNTING", label: "Stunting" },
                  ]}
                  value={filterStunting}
                  onChange={setFilterStunting}
                  w={{ base: "100%", sm: 200 }}
                />
              </Group>

              {stBalita.findMany.loading ? (
                <Stack gap="sm">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} h={100} radius="lg" />
                  ))}
                </Stack>
              ) : !stBalita.findMany.data?.length ? (
                <Paper p="xl" radius="lg" withBorder bg="white" ta="center">
                  <Text c="dimmed">Tidak ada data balita ditemukan</Text>
                </Paper>
              ) : (
                <>
                  <Text fz="sm" c="dimmed">
                    Total: <strong>{stBalita.findMany.total}</strong> balita terdaftar
                  </Text>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    {stBalita.findMany.data.map((v, i) => (
                      <Paper key={i} p="md" radius="lg" withBorder bg="white" shadow="xs">
                        <Stack gap="xs">
                          <Group
                            justify="space-between"
                            align="flex-start"
                            wrap="nowrap"
                          >
                            <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                              <Text fw={600} fz="sm" lineClamp={1}>{v.nama}</Text>
                              <Text fz="xs" c="dimmed">
                                {v.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
                                {v.tanggalLahir
                                  ? ` · ${new Date(v.tanggalLahir).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })}`
                                  : ""}
                              </Text>
                            </Stack>
                            <Badge
                              color={stuntingBadgeColor(v.statusStunting)}
                              variant="light"
                              size="sm"
                              radius="sm"
                              style={{ flexShrink: 0 }}
                            >
                              {v.statusStunting}
                            </Badge>
                          </Group>

                          {v.posyandu && (
                            <Flex align="center" gap={4}>
                              <IconMapPin size={13} color="gray" />
                              <Text fz="xs" c="dimmed">
                                {v.posyandu.name}
                                {v.posyandu.banjar
                                  ? ` · Banjar ${v.posyandu.banjar.name}`
                                  : ""}
                              </Text>
                            </Flex>
                          )}

                          <Group gap="xs">
                            <Badge
                              color={v.imunisasiLengkap ? "blue" : "gray"}
                              variant="dot"
                              size="xs"
                            >
                              {v.imunisasiLengkap
                                ? "Imunisasi Lengkap"
                                : "Imunisasi Belum Lengkap"}
                            </Badge>
                            <Badge
                              color={v.giziBaik ? "green" : "orange"}
                              variant="dot"
                              size="xs"
                            >
                              {v.giziBaik ? "Gizi Baik" : "Gizi Kurang"}
                            </Badge>
                            <Badge
                              color={v.pemeriksaanRutin ? "teal" : "gray"}
                              variant="dot"
                              size="xs"
                            >
                              {v.pemeriksaanRutin ? "Periksa Rutin" : "Tidak Rutin"}
                            </Badge>
                          </Group>
                        </Stack>
                      </Paper>
                    ))}
                  </SimpleGrid>

                  <Center>
                    <Pagination
                      value={stBalita.findMany.page}
                      onChange={(p) =>
                        balitaState.findMany.load(
                          p,
                          10,
                          searchBalita,
                          filterStunting ?? ""
                        )
                      }
                      total={stBalita.findMany.totalPages}
                      radius="lg"
                      color={colors["blue-button"]}
                    />
                  </Center>
                </>
              )}
            </Stack>
          </Tabs.Panel>

          {/* ===== IBU HAMIL ===== */}
          <Tabs.Panel value="ibu-hamil" pt="md">
            <Stack gap="md">
              <Group wrap="wrap">
                <TextInput
                  placeholder="Cari nama..."
                  radius="xl"
                  leftSection={<IconSearch size={18} />}
                  value={searchIbuHamil}
                  onChange={(e) => setSearchIbuHamil(e.currentTarget.value)}
                  style={{ flex: 1, minWidth: 200 }}
                />
                <Select
                  placeholder="Semua status"
                  clearable
                  radius="xl"
                  data={[
                    { value: "AKTIF", label: "Aktif" },
                    { value: "MELAHIRKAN", label: "Melahirkan" },
                    { value: "KEGUGURAN", label: "Keguguran" },
                    { value: "NONAKTIF", label: "Nonaktif" },
                  ]}
                  value={filterStatusIbuHamil}
                  onChange={setFilterStatusIbuHamil}
                  w={{ base: "100%", sm: 200 }}
                />
              </Group>

              {stIbuHamil.findMany.loading ? (
                <Stack gap="sm">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} h={100} radius="lg" />
                  ))}
                </Stack>
              ) : !stIbuHamil.findMany.data?.length ? (
                <Paper p="xl" radius="lg" withBorder bg="white" ta="center">
                  <Text c="dimmed">Tidak ada data ibu hamil ditemukan</Text>
                </Paper>
              ) : (
                <>
                  <Text fz="sm" c="dimmed">
                    Total: <strong>{stIbuHamil.findMany.total}</strong> data ibu hamil
                  </Text>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    {stIbuHamil.findMany.data.map((v, i) => (
                      <Paper key={i} p="md" radius="lg" withBorder bg="white" shadow="xs">
                        <Stack gap="xs">
                          <Group
                            justify="space-between"
                            align="flex-start"
                            wrap="nowrap"
                          >
                            <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                              <Text fw={600} fz="sm" lineClamp={1}>{v.nama}</Text>
                              <Text fz="xs" c="dimmed">
                                Usia kehamilan: {v.usiaKehamilan} minggu
                              </Text>
                            </Stack>
                            <Badge
                              color={ibuHamilBadgeColor(v.status)}
                              variant="light"
                              size="sm"
                              radius="sm"
                              style={{ flexShrink: 0 }}
                            >
                              {v.status}
                            </Badge>
                          </Group>

                          {v.posyandu && (
                            <Flex align="center" gap={4}>
                              <IconMapPin size={13} color="gray" />
                              <Text fz="xs" c="dimmed">
                                {v.posyandu.name}
                                {v.posyandu.banjar
                                  ? ` · Banjar ${v.posyandu.banjar.name}`
                                  : ""}
                              </Text>
                            </Flex>
                          )}

                          {v.taksiranLahir && (
                            <Flex align="center" gap={4}>
                              <IconCalendar size={13} color="gray" />
                              <Text fz="xs" c="dimmed">
                                Taksiran lahir:{" "}
                                {new Date(v.taksiranLahir).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </Text>
                            </Flex>
                          )}
                        </Stack>
                      </Paper>
                    ))}
                  </SimpleGrid>

                  <Center>
                    <Pagination
                      value={stIbuHamil.findMany.page}
                      onChange={(p) =>
                        ibuHamilState.findMany.load(
                          p,
                          10,
                          searchIbuHamil,
                          filterStatusIbuHamil ?? ""
                        )
                      }
                      total={stIbuHamil.findMany.totalPages}
                      radius="lg"
                      color={colors["blue-button"]}
                    />
                  </Center>
                </>
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Box>
    </Stack>
  );
}
