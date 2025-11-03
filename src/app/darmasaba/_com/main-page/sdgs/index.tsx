'use client'
import colors from "@/con/colors"
import { Box, Button, Center, Container, Image, Paper, SimpleGrid, Stack, Text, Title, useMantineTheme } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { Prisma } from "@prisma/client"
import { IconMoodSad } from "@tabler/icons-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "framer-motion";

export default function SDGS() {
  const theme = useMantineTheme()
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)
  const [sdgsDesa, setSdgsDesa] = useState<Prisma.SdgsDesaGetPayload<{ include: { image: true } }>[] | null>(null)

  useEffect(() => {
    const fetchSdgsDesa = async () => {
      try {
        const response = await fetch("/api/landingpage/sdgsdesa/findMany")
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const result = await response.json()
        let data = []
        if (Array.isArray(result.data)) data = result.data
        else if (Array.isArray(result)) data = result
        else {
          setSdgsDesa([])
          return
        }
        const top4Sdgs = [...data].sort((a, b) => parseInt(b.jumlah) - parseInt(a.jumlah)).slice(0, 4)
        setSdgsDesa(top4Sdgs)
      } catch {
        setSdgsDesa([])
      }
    }
    fetchSdgsDesa()
  }, [])

  return (
    <Stack p="sm" my={"xs"}>
      <Container w={{ base: "100%", md: "80%" }} p="xl">
        <Center>
          <Title
            order={1}
            fz={{ base: "2.4rem", md: "3.6rem" }}
            fw={900}
            c={colors["blue-button"]}
          >
            SDGs Desa
          </Title>
        </Center>
        <Text ta={"center"} fz={{ base: "1rem", md: "1.3rem" }}>
          SDGs Desa merupakan langkah nyata untuk mewujudkan desa yang maju, inklusif, dan berkelanjutan melalui 17 tujuan pembangunan dari pengentasan kemiskinan, pendidikan, kesehatan, kesetaraan gender, hingga pelestarian lingkungan.
        </Text>

        <Box py="lg">
          {sdgsDesa && sdgsDesa.length > 0 ? (
            <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="xl" verticalSpacing="xl" pb={30}>
              {sdgsDesa.map((item) => (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={item.id}
                >
                  <Paper
                    p="lg"
                    radius="xl"
                    shadow="sm"
                    withBorder
                    style={{
                      background: "linear-gradient(180deg, #FFFFFF, #F6F8FA)",
                      border: "1px solid rgba(0,0,0,0.05)",
                      transition: "all 0.3s ease",
                      height: "100%", // biar tinggi antar card konsisten
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Center mb="lg">
                      <Box
                        p="md"
                        style={{
                          background: "rgba(240, 249, 255, 0.8)",
                          backdropFilter: "blur(6px)",
                          width: mobile ? 140 : 160,
                          height: mobile ? 140 : 160,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "1rem",
                          boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                        }}
                      >
                        <Image
                          src={item.image?.link ? item.image.link : "/placeholder-sdgs.png"}
                          alt={item.name}
                          w={mobile ? 90 : 110}
                          h={mobile ? 90 : 110}
                          fit="contain"
                          loading="lazy"
                        />
                      </Box>
                    </Center>

                    {/* Stack isi teks & angka */}
                    <Stack justify="space-between" align="center" gap="xs" h="100%">
                      <Text
                        ta="center"
                        fz={{ base: "lg", md: "xl" }}
                        fw={700}
                        mb="xs"
                        style={{ minHeight: mobile ? 60 : 70 }} // biar judulnya punya tinggi tetap
                      >
                        {item.name}
                      </Text>

                      <Title
                        order={2}
                        ta="center"
                        style={{
                          fontSize: mobile ? "2.4rem" : "3.2rem",
                          fontWeight: 900,
                          letterSpacing: "-0.5px",
                          color: "#124170",
                        }}
                      >
                        {item.jumlah}
                      </Title>
                    </Stack>
                  </Paper>
                </motion.div>
              ))}
            </SimpleGrid>

          ) : (
            <Center mih={200} style={{ flexDirection: "column" }}>
              <IconMoodSad size={48} stroke={1.5} style={{ marginBottom: "1rem" }} />
              <Text fz="lg" c="dimmed">
                Data SDGs Desa belum tersedia
              </Text>
            </Center>
          )}

          <Center>
            <Button
              component={Link}
              href="/darmasaba/sdgs-desa"
              radius="xl"
              size="lg"
              mt="md"
              variant="gradient"
              gradient={{ from: "#26667F", to: "#124170" }}
              style={{
                boxShadow: "0 6px 14px rgba(18,65,112,0.25)",
                transition: "all 0.3s ease",
                transform: "translateY(0)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 10px 20px rgba(18,65,112,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 14px rgba(18,65,112,0.25)";
              }}
            >
              <Text c="white" fz={{ base: "md", md: "lg" }} fw="bold">Jelajahi Semua Tujuan SDGs Desa</Text>
            </Button>
          </Center>
        </Box>
      </Container>
    </Stack>
  )
}
