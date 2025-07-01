"use client";
import colors from "@/con/colors";
import {
  Box,
  Card,
  Flex,
  Grid,
  GridCol,
  Image,
  Paper,
  Stack,
  Text
} from "@mantine/core";
import ModuleView from "./ModuleView";
import SosmedView from "./SosmedView";
import { useEffect, useState } from "react";

const getDayOfWeek = () => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const today = new Date();
  return days[today.getDay()];
}

const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

const isWorkingHours = (currentTime: string): boolean => {
  const [openTime, closeTime] = ['08:00', '16:00'];

  const compareTimes = (time1: string, time2: string) => {
    const [hour1, minute1] = time1.split(':').map(Number);
    const [hour2, minute2] = time2.split(':').map(Number);

    if (hour1 < hour2) return true;
    if (hour1 > hour2) return false;
    return minute1 <= minute2;
  };
  return compareTimes(currentTime, closeTime) && !compareTimes(currentTime, openTime);
}
const getWorkStatus = (day: string, currentTime: string): { status: string; message: string } => {
  const workingDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  if (!workingDays.includes(day)) {
    return {
      status: 'Tutup',
      message: 'Sabtu - Minggu'
    }
  }
  const isOpen = isWorkingHours(currentTime)
  return isOpen ? { status: 'Buka', message: '08:00 - 16:00' } : { status: 'Tutup', message: '08:00 - 16:00' };
}


function LandingPage() {
  const [workStatus, setWorkStatus] = useState<{ status: string; message: string }>
    ({ status: '', message: '' });

  useEffect(() => {
    const updateWorkStatus = () => {
      const day = getDayOfWeek();
      const time = getCurrentTime();
      const status = getWorkStatus(day, time);
      setWorkStatus(status);
    }
    updateWorkStatus();
    const intervalId = setInterval(updateWorkStatus, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);
  return (
    <Stack bg={colors["Bg"]}>
      <Flex
        gap={"md"}
        wrap={{
          base: "wrap",
          md: "nowrap",
        }}
      >
        <Stack
          gap={"xl"}
          w={{
            base: "100%",
            md: "60%",
          }}
          py={{
            base: "xs",
            md: "40",
          }}
          px={{
            base: "xs",
            md: "100",
          }}
        >
          <Card
            radius={"32"}
            bg={colors.grey[1]}
            p={{
              base: "xs",
              md: "32",
            }}
          >
            <Stack gap={42}>
              <Flex
                gap={"md"}
                wrap={{
                  base: "wrap",
                  md: "nowrap",
                }}
              >
                <Grid
                >
                  <Grid.Col span={{
                    base: 3,
                    lg: 2,
                    md: 3,
                  }}>
                    <Box
                      pos={"relative"}
                      bg={"white"}
                      w={{
                        base: 64,
                        md: 72,
                      }}
                      h={{
                        base: 64,
                        md: 72,
                      }}
                      style={{
                        borderRadius: 24,
                      }}
                      p={"sm"}
                    >
                      <Image
                        src={"/darmasaba-icon.png"}
                        alt="icon"
                        sizes="100%"
                      />
                    </Box>
                  </Grid.Col>

                  <Grid.Col span={{
                    base: 6,
                    lg: 2,
                    md: 3,
                  }}>
                    <Box
                      pos={"relative"}
                      w={{
                        base: 64,
                        md: 72,
                      }}
                      h={{
                        base: 64,
                        md: 72,
                      }}
                      style={{
                        borderRadius: 24,
                      }}
                      p={"sm"}
                      bg={"white"}
                    >
                      <Image
                        src={"/pudak-icon.png"}
                        alt="icon"
                        sizes={"100%"}
                        fit="contain"
                      />
                    </Box>
                  </Grid.Col>
                  <Grid.Col span={{
                    base: 12,
                    lg: 8,
                    md: 12,
                  }}>
                    <Paper
                      pos={"relative"}
                      bg={colors["blue-button"]}
                      p={10}
                      w={{ base: "100%", sm: "auto", md: "auto" }}
                      flex={{ base: "1", sm: "1", md: "1" }}
                    >
                      <Grid
                      >
                        <GridCol span={{
                          base: 12,
                          lg: 6,
                          md: 6,
                        }}>
                          <Box>
                            <Text c={colors["white-1"]} fz={"sm"}>
                              Jadwal Kerja
                            </Text>
                            <Paper
                              w={{ base: "100%", sm: "100%", md: "auto" }}
                              p={5}
                              bg={colors["white-1"]}
                            >
                              <Flex justify={"space-between"} align={"center"}>
                                <Paper
                                  w={{ base: "100%", sm: "100%", md: "auto" }}
                                  p={5}
                                  bg={colors["white-1"]}
                                >

                                  <Box>
                                    <Text fw="bold" fz="sm" c={workStatus.status === 'Buka' ? "black" : "red"}>
                                      {workStatus.status}
                                    </Text>
                                    <Text fw="bold" fz="lg" >
                                      {workStatus.message}
                                    </Text>
                                  </Box>
                                </Paper>
                              </Flex>
                            </Paper>
                          </Box>
                        </GridCol>
                        {/* Edit yang ini */}
                        <GridCol span={{ base: 12, lg: 6, md: 6 }}>
                          <Box>
                            <Text c={colors["white-1"]} fz={"sm"}>
                              {new Intl.DateTimeFormat('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }).format(new Date())}
                            </Text>
                            <Paper bg={colors["white-1"]} p={10}>
                              <Text fz="sm" >
                                Status
                              </Text>
                              <Text fw="bold" fz="lg" >
                                {workStatus.status === 'Buka' ? 'Operasional' : 'Tutup'}
                              </Text>
                            </Paper>

                          </Box>
                        </GridCol>
                      </Grid>
                    </Paper>
                  </Grid.Col>

                </Grid>

              </Flex>
              <ModuleView />
              <SosmedView />
              <Text c={colors.trans.dark[2]} style={{
                textAlign: "center"
              }} >Sampaikan saran dan masukan guna kemajuan dalam pembangunan. Semua lebih mudah melalui fitur interaktif</Text>
            </Stack>
          </Card>

        </Stack>
        <Stack
          justify={"end"}
          align={"end"}
          pos={"relative"}
          w={{
            base: "100%",
            md: "40%",
          }}
          px={"xl"}
        >
          <Image
            src={"/assets/images/perbekel.png"}
            alt="perbekel"
            sizes="100%"
            fit="contain"
          />
          <Box
            pos={"absolute"}
            bottom={0}
            p={{
              base: "xs",
              md: "md",
            }}
          >
            <Card
              px={"lg"}
              radius={"32"}
              className="glass3"
              style={{
                border: `1px solid white`,
              }}
            >
              <Text>Perbekel Desa Darmasaba</Text>
              <Text c={colors["blue-button"]} fw={"bolder"} fz={"1rem"}>
                I.B. Surya Prabhawa Manuaba, S.H.,M.H.,NL.P.
              </Text>
            </Card>
          </Box>
        </Stack>
      </Flex>
    </Stack >
  );
}

export default LandingPage;
