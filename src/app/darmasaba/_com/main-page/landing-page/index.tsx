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

const isWorkingHours = (currentTime: string): boolean => {
  const [openTime, closeTime] = ["08:00", "17:00"];
  const compareTimes = (time1: string, time2: string) => {
    const [hour1, minute1] = time1.split(":").map(Number);
    const [hour2, minute2] = time2.split(":").map(Number);
    if (hour1 < hour2) return true;
    if (hour1 > hour2) return false;
    return minute1 <= minute2;
  };
  return compareTimes(currentTime, closeTime) && !compareTimes(currentTime, openTime);
};

const getWorkStatus = (day: string, currentTime: string): { status: string; message: string } => {
  const workingDays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
  if (!workingDays.includes(day)) {
    return { status: "Tutup", message: "Libur Akhir Pekan" };
  }
  const isOpen = isWorkingHours(currentTime);
  return isOpen
    ? { status: "Buka", message: "08:00 - 17:00" }
    : { status: "Tutup", message: "08:00 - 17:00" };
};

function LandingPage() {
  const [socialMedia, setSocialMedia] = useState<
    Prisma.MediaSosialGetPayload<{ include: { image: true } }>[]
  >([]);
  const [profile, setProfile] = useState<
    Prisma.PejabatDesaGetPayload<{ include: { image: true } }> | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

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
        setIsLoading(false);
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
      }
    };

    fetchSocialMedia();
    fetchProfile();
  }, []);

  const [workStatus, setWorkStatus] = useState<{ status: string; message: string }>({
    status: "",
    message: "",
  });

  useEffect(() => {
    const updateWorkStatus = () => {
      const day = getDayOfWeek();
      const time = getCurrentTime();
      const status = getWorkStatus(day, time);
      setWorkStatus(status);
    };
    updateWorkStatus();
    const intervalId = setInterval(updateWorkStatus, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Stack bg={colors.Bg} p="md" gap="xl">
      <Flex gap="lg" wrap={{ base: "wrap", md: "nowrap" }}>
        <Stack w={{ base: "100%", md: "65%" }} gap="lg">
          <Card radius="xl" bg={colors.grey[1]} p="lg" shadow="xl">
            <Stack gap="xl">
              <Flex gap="md" wrap="wrap">
                <Group>
                  <Box bg="white" w={72} h={72} p="sm" style={{ borderRadius: 24 }}>
                    <Image loading="lazy" src="/darmasaba-icon.png" alt="Logo Darmasaba" fit="contain" />
                  </Box>
                  <Box bg="white" w={72} h={72} p="sm" style={{ borderRadius: 24 }}>
                    <Image loading="lazy" src="/pudak-icon.png" alt="Logo Pudak" fit="contain" />
                  </Box>
                </Group>
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
                        <GridCol span={{ base: 12, md: 6 }}>
                          <Stack gap="xs">
                            <Flex align="center" gap="xs">
                              <IconCalendarTime size={16} color="white" />
                              <Text c="white" fz="sm">Jam Operasional</Text>
                            </Flex>
                            <Paper p="sm" radius="md" bg="white">
                              <Tooltip label="Status saat ini berdasarkan jam operasional kantor">
                                <Badge
                                  color={workStatus.status === "Buka" ? "green" : "red"}
                                  radius="sm"
                                  variant="filled"
                                >
                                  {workStatus.status}
                                </Badge>
                              </Tooltip>
                              <Text fw="bold" fz="lg">{workStatus.message}</Text>
                            </Paper>
                          </Stack>
                        </GridCol>
                        <GridCol span={{ base: 12, md: 6 }}>
                          <Stack gap="xs">
                            <Flex align="center" gap="xs">
                              <IconInfoCircle size={16} color="white" />
                              <Text c="white" fz="sm">Hari Ini</Text>
                            </Flex>
                            <Paper p="sm" radius="md" bg="white">
                              <Text fz="sm">Status Kantor</Text>
                              <Text fw="bold" fz="lg">
                                {workStatus.status === "Buka" ? "Sedang Beroperasi" : "Tidak Beroperasi"}
                              </Text>
                            </Paper>
                          </Stack>
                        </GridCol>
                      </Grid>
                    </Paper>
                  </Grid.Col>
                </Grid>
              </Flex>

              <ModuleView />

              {isLoading ? (
                <Skeleton height={32} width="100%" />
              ) : socialMedia.length > 0 ? (
                <SosmedView data={socialMedia} />
              ) : (
                <Center>
                  <Text c="dimmed">Belum ada tautan media sosial yang tersedia</Text>
                </Center>
              )}

              <Text ta="center" c={colors.trans.dark[2]}>
                Bagikan ide, kritik, atau saran Anda untuk mendukung pembangunan desa.
                Semua lebih mudah dengan fitur interaktif yang kami sediakan.
              </Text>
            </Stack>
          </Card>
        </Stack>

        {isLoading ? (
          <Skeleton height={300} width="100%" radius="lg" />
        ) : profile ? (
          <ProfileView data={profile} />
        ) : (
          <Center w="100%">
            <Text c="dimmed">Informasi profil belum tersedia</Text>
          </Center>
        )}
      </Flex>
    </Stack>
  );
}

export default LandingPage;
