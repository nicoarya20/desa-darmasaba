"use client";
import colors from "@/con/colors";
import {
  Box,
  Card,
  Flex,
  Image,
  Paper,
  Stack,
  Text
} from "@mantine/core";
import ModuleView from "./ModuleView";
import SosmedView from "./SosmedView";

function LandingPage() {
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
                <Flex gap={"md"} flex={1}>
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
                      src={"/assets/images/darmasaba-icon.png"}
                      alt="icon"
                      sizes="100%"
                    />
                  </Box>
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
                      src={"/assets/images/pudak-icon.png"}
                      alt="icon"
                      sizes={"100%"}
                      fit="contain"
                    />
                  </Box>
                </Flex>
                <Stack flex={2} gap={0} justify="end" c={colors["blue-button"]}>
                  {/* <Text
                    fz={{
                      base: "1.5rem",
                      md: "1.4rem",
                    }}
                  >
                    Pemerintah Desa
                  </Text>
                  <Title>DARMASABA</Title> */}
                  <Paper bg={colors["blue-button"]} p={10} w={400}>
                    <Flex align={"center"} justify={"space-between"}>
                      <Box>
                        <Text c={colors["white-1"]} fz={"sm"}>
                          Jadwal Kerja
                        </Text>
                        <Paper w={175} p={5} bg={colors["white-1"]}>
                          <Flex justify={"space-between"} align={"center"}>
                            <Box>
                              <Text fz={"sm"}>
                                Buka
                              </Text>
                              <Text fw={"bold"} fz={"lg"}>
                                08:00
                              </Text>
                            </Box>
                            <Text fz={"lg"} fw={"bold"}>-</Text>
                            <Box>
                              <Text fz={"sm"}>
                                Tutup
                              </Text>
                              <Text fw={"bold"} fz={"lg"}>
                                16:00
                              </Text>
                            </Box>
                          </Flex>
                        </Paper>
                      </Box>
                      <Box>
                        <Text c={colors["white-1"]} fz={"sm"}>
                          Rabu, 10 Maret 2025
                        </Text>
                        <Paper w={175} p={5} bg={colors["white-1"]}>
                          <Box>
                            <Text fz={"sm"}>
                              Buka
                            </Text>
                            <Text fw={"bold"} fz={"lg"}>
                              Sabtu - Minggu
                            </Text>
                          </Box>
                        </Paper>
                      </Box>
                    </Flex>
                  </Paper>
                </Stack>
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
