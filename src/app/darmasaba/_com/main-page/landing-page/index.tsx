"use client";
import colors from "@/con/colors";
import {
  Box,
  Button,
  Card,
  Flex,
  Image,
  Stack,
  Text,
  Title
} from "@mantine/core";
import ModuleView from "./ModuleView";
import SosmedView from "./SosmedView";

function LandingPage() {
  return (
    <Stack bg={colors["blue-button"]}>
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
            md: "72",
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
                  <Text
                    fz={{
                      base: "1.5rem",
                      md: "1.4rem",
                    }}
                  >
                    Pemerintah Desa
                  </Text>
                  <Title>DARMASABA</Title>
                </Stack>
              </Flex>
              <ModuleView />
              <SosmedView />
            </Stack>
          </Card>
          <Stack
            align="center"
            justify={"center"}
          >
            <Text c={"white"} style={{
              textAlign: "center"
            }} maw={300}>Tambahkan Text Apa aja disini untuk lebih detail yang berwarna putih</Text>
            <Button
              radius={100}
              w={{
                base: "100%",
                sm: "300",
              }}
              px={42}
              size="lg"
              variant="fill"
              bg={"gray.1"}
              c={"dark"}
            >
              Button 1
            </Button>
          </Stack>
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
