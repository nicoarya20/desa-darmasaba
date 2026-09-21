"use client";
import colors from "@/con/colors";
import {
  Badge,
  Box,
  Card,
  Center,
  Flex,
  Grid,
  GridCol,
  Group,
  Image,
  Paper,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { Prisma } from "@prisma/client";
import { IconCalendarTime, IconInfoCircle } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import ModuleView from "./ModuleView";
import ProfileView from "./ProfileView";
import SosmedView from "./SosmedView";

const getDayOfWeek = () => {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const today = new Date();
  return days[today.getDay()];
};

const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Fungsi untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isWorkingHours = (day: string, currentTime: string, isHoliday: boolean): boolean => {
  // Cek apakah hari ini hari libur nasional
  if (isHoliday) {
    return false;
  }

  let openTime = "";
  let closeTime = "";

  // Atur jam kerja berdasarkan hari
  if (["Senin", "Selasa", "Rabu", "Kamis"].includes(day)) {
    openTime = "07:30";
    closeTime = "15:30";
  } else if (day === "Jumat") {
    openTime = "07:30";
    closeTime = "12:00";
  } else {
    // Sabtu dan Minggu tutup
    return false;
  }

  const compareTimes = (time1: string, time2: string) => {
    const [hour1, minute1] = time1.split(":").map(Number);
    const [hour2, minute2] = time2.split(":").map(Number);
    if (hour1 < hour2) return true;
    if (hour1 > hour2) return false;
    return minute1 <= minute2;
  };

  return compareTimes(currentTime, closeTime) && !compareTimes(currentTime, openTime);
};

const getWorkStatus = (
  day: string,
  currentTime: string,
  holiday: { isHoliday: boolean; holidayName: string | null }
): { status: string; message: string } => {
  // Cek apakah hari ini hari libur nasional
  if (holiday.isHoliday) {
    return { status: "Tutup", message: holiday.holidayName ?? "Hari Libur Nasional" };
  }

  const workingDays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
  if (!workingDays.includes(day)) {
    return { status: "Tutup", message: "Libur Akhir Pekan" };
  }

  const isOpen = isWorkingHours(day, currentTime, holiday.isHoliday);

  let workHoursMessage = "";
  if (["Senin", "Selasa", "Rabu", "Kamis"].includes(day)) {
    workHoursMessage = "07:30 - 15:30";
  } else if (day === "Jumat") {
    workHoursMessage = "07:30 - 12:00";
  }

  return isOpen
    ? { status: "Buka", message: workHoursMessage }
    : { status: "Tutup", message: workHoursMessage };
};

// 🟦 Skeleton component untuk Social Media
const SosmedSkeleton = () => (
  <Flex gap="md" justify="center" wrap="wrap">
    {[1, 2, 3, 4].map((i) => (
      <Skeleton key={i} height={56} width={56} circle />
    ))}
  </Flex>
);

// 🟦 Skeleton component untuk Profile
const ProfileSkeleton = () => (
  <Card
    radius="xl"
    bg={colors.grey[1]}
    p="lg"
    shadow="xl"
    w={{ base: "100%", md: "35%" }}
    style={{ height: "fit-content" }}
  >
    <Stack gap="lg" align="center">
      <Skeleton height={300} width="100%" radius="lg" />
      <Stack gap="xs" w="100%" align="center">
        <Skeleton height={20} width="60%" />
        <Skeleton height={32} width="80%" />
      </Stack>
    </Stack>
  </Card>
);

function LandingPage() {
  const [socialMedia, setSocialMedia] = useState<
    Prisma.MediaSosialGetPayload<{ include: { image: true } }>[]
  >([]);
  const [profile, setProfile] = useState<
    Prisma.PejabatDesaGetPayload<{ include: { image: true } }> | null
  >(null);
  const [isLoadingSosmed, setIsLoadingSosmed] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [holiday, setHoliday] = useState<{ isHoliday: boolean; holidayName: string | null }>({
    isHoliday: false,
    holidayName: null,
  });
  const [isLoadingHoliday, setIsLoadingHoliday] = useState(true);

  useEffect(() => {
    const fetchSocialMedia = async () => {
      try {
        const response = await fetch("/api/landingpage/mediasosial/findMany");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (Array.isArray(result.data)) {
          setSocialMedia(result.data);
        } else if (Array.isArray(result)) {
          setSocialMedia(result);
        } else {
          setSocialMedia([]);
        }
      } catch {
        setSocialMedia([]);
      } finally {
        setIsLoadingSosmed(false);
      }
    };

    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/landingpage/pejabatdesa/edit`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        setProfile(result.data || null);
      } catch {
        setProfile(null);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    const fetchHoliday = async () => {
      try {
        const response = await fetch(`/api/landingpage/harilibur/cek?date=${getTodayDate()}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        setHoliday({
          isHoliday: Boolean(result.isHoliday),
          holidayName: result.holidayName ?? null,
        });
      } catch {
        // Fail-open: kalau gagal ambil data hari libur, anggap bukan hari libur
        // supaya widget jam operasional tetap jalan berdasarkan jam kerja normal.
        setHoliday({ isHoliday: false, holidayName: null });
      } finally {
        setIsLoadingHoliday(false);
      }
    };

    fetchSocialMedia();
    fetchProfile();
    fetchHoliday();
  }, []);

  const [workStatus, setWorkStatus] = useState<{ status: string; message: string }>({
    status: "",
    message: "",
  });

  useEffect(() => {
    if (isLoadingHoliday) return;

    const updateWorkStatus = () => {
      const day = getDayOfWeek();
      const time = getCurrentTime();
      const status = getWorkStatus(day, time, holiday);
      setWorkStatus(status);
    };
    updateWorkStatus();
    const intervalId = setInterval(updateWorkStatus, 60 * 1000);
    return () => clearInterval(intervalId);
  }, [isLoadingHoliday, holiday]);

  return (
    <Stack bg={colors.Bg} p="md" gap="lg">
      <Flex gap="lg" wrap={{ base: "wrap", md: "nowrap" }} pb={30}>
        <Stack w={{ base: "100%", md: "65%" }} gap="lg">
          <Card radius="xl" bg={colors.grey[1]} p="lg" mt={10} shadow="xl">
            <Stack gap="xl">

              {/* Header Logo */}
              <Flex gap="md" wrap="wrap">
                <Group>
                  <Box bg="white" w={72} h={72} p="sm" style={{ borderRadius: 24 }}>
                    <Image loading="lazy" src="/darmasaba-icon.png" alt="Logo Darmasaba" fit="contain" />
                  </Box>
                  <Box bg="white" w={72} h={72} p="sm" style={{ borderRadius: 24 }}>
                    <Image loading="lazy" src="/pudak-icon.png" alt="Logo Pudak" fit="contain" />
                  </Box>
                </Group>

                {/* Jam Operasional */}
                <Grid w="100%">
                  <Grid.Col span={12}>
                    <Paper
                      bg={colors["blue-button"]}
                      p="md"
                      radius="lg"
                      shadow="md"
                      style={{ position: "relative", overflow: "hidden" }}
                    >
                      <Grid gutter="md">

                        {/* Kolom 1 */}
                        <GridCol span={{ base: 12, md: 6 }}>
                          <Stack gap="xs">
                            <Flex align="center" gap="xs">
                              <IconCalendarTime size={16} color="white" />
                              <Text c="white" fz={{ base: "xs", md: "sm" }}>
                                Jam Operasional
                              </Text>
                            </Flex>

                            <Paper p="sm" radius="md" bg="white">
                              {isLoadingHoliday ? (
                                <Stack gap={4}>
                                  <Skeleton height={20} width={60} radius="sm" />
                                  <Skeleton height={22} width="80%" mt={4} />
                                </Stack>
                              ) : (
                                <>
                                  <Tooltip label="Status saat ini berdasarkan jam operasional kantor">
                                    <Badge
                                      color={workStatus.status === "Buka" ? "green" : "red"}
                                      radius="sm"
                                      variant="filled"
                                      size="md"
                                    >
                                      {workStatus.status}
                                    </Badge>
                                  </Tooltip>

                                  <Text
                                    fw={700}
                                    fz={{ base: "md", md: "lg" }}
                                    mt={4}
                                  >
                                    {workStatus.message}
                                  </Text>
                                </>
                              )}
                            </Paper>
                          </Stack>
                        </GridCol>

                        {/* Kolom 2 */}
                        <GridCol span={{ base: 12, md: 6 }}>
                          <Stack gap="xs">
                            <Flex align="center" gap="xs">
                              <IconInfoCircle size={16} color="white" />
                              <Text c="white" fz={{ base: "xs", md: "sm" }}>
                                Hari Ini
                              </Text>
                            </Flex>

                            <Paper p="sm" radius="md" bg="white">
                              <Text fz={{ base: "xs", md: "sm" }} c="dimmed">
                                Status Kantor
                              </Text>
                              {isLoadingHoliday ? (
                                <Skeleton height={22} width="70%" mt={4} />
                              ) : (
                                <Text fw={700} fz={{ base: "md", md: "lg" }}>
                                  {workStatus.status === "Buka"
                                    ? "Sedang Beroperasi"
                                    : "Tidak Beroperasi"}
                                </Text>
                              )}
                            </Paper>
                          </Stack>
                        </GridCol>
                      </Grid>
                    </Paper>
                  </Grid.Col>
                </Grid>
              </Flex>

              {/* MODULE VIEW */}
              <ModuleView />

              {/* Sosmed */}
              {isLoadingSosmed ? (
                <SosmedSkeleton />
              ) : socialMedia.length > 0 ? (
                <SosmedView data={socialMedia} />
              ) : (
                <Center>
                  <Text fz={{ base: "sm", md: "md" }} c="dimmed">
                    Belum ada tautan media sosial yang tersedia
                  </Text>
                </Center>
              )}

              {/* CTA Text */}
              <Text
                ta="center"
                c={colors.trans.dark[2]}
                fz={{ base: "sm", md: "md" }}
                lh={1.5}
              >
                Bagikan ide, kritik, atau saran Anda untuk mendukung pembangunan desa.
                Semua lebih mudah dengan fitur interaktif yang kami sediakan.
              </Text>
            </Stack>
          </Card>
        </Stack>

        {/* PROFIL */}
        {isLoadingProfile ? (
          <ProfileSkeleton />
        ) : profile ? (
          <ProfileView data={profile} />
        ) : (
          <Card
            radius="xl"
            bg={colors.grey[1]}
            p="lg"
            shadow="xl"
            w={{ base: "100%", md: "35%" }}
            style={{ height: "fit-content" }}
          >
            <Center h={300}>
              <Text fz={{ base: "sm", md: "md" }} c="dimmed">
                Informasi profil belum tersedia
              </Text>
            </Center>
          </Card>
        )}
      </Flex>
    </Stack>
  );
}

export default LandingPage;
