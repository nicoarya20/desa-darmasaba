'use client'
import { useEffect, useState } from "react"
import { Box, Button, Center, Container, Image, Paper, SimpleGrid, Stack, Text, Title, useMantineTheme, Tooltip } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { Prisma } from "@prisma/client"
import Link from "next/link"
import { IconMoodSad } from "@tabler/icons-react"

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
        const top3Sdgs = [...data].sort((a, b) => parseInt(b.jumlah) - parseInt(a.jumlah)).slice(0, 3)
        setSdgsDesa(top3Sdgs)
      } catch {
        setSdgsDesa([])
      }
    }
    fetchSdgsDesa()
  }, [])

  return (
    <Stack p="sm">
      <Container w={{ base: "100%", md: "80%" }} p="xl">
        <Center>
          <Title
            order={1}
            fz={{ base: "2.4rem", md: "3.6rem" }}
            fw={900}
            style={{
              background: "linear-gradient(90deg, #1A5F7A, #159895)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            SDGs Desa
          </Title>
        </Center>
        <Text ta={"center"} fz={{ base: "1rem", md: "1.3rem" }}>
          SDGs Desa merupakan langkah nyata untuk mewujudkan desa yang maju, inklusif, dan berkelanjutan melalui 17 tujuan pembangunan dari pengentasan kemiskinan, pendidikan, kesehatan, kesetaraan gender, hingga pelestarian lingkungan.
        </Text>

        <Box py={50}>
          <Paper
            p={{ base: "md", md: "xl" }}
            radius="2xl"
            withBorder
            shadow="lg"
            style={{
              background: "linear-gradient(145deg, #FFFFFF, #F9FAFB)",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            {sdgsDesa && sdgsDesa.length > 0 ? (
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" verticalSpacing="xl">
              {sdgsDesa.map((item) => (
                <Paper
                  key={item.id}
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
                    <Tooltip label="Nama tujuan SDGs Desa" position="top" withArrow>
                      <Text
                        ta="center"
                        fz={{ base: "lg", md: "xl" }}
                        fw={700}
                        mb="xs"
                        style={{ minHeight: mobile ? 60 : 70 }} // biar judulnya punya tinggi tetap
                      >
                        {item.name}
                      </Text>
                    </Tooltip>
            
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
          </Paper>

          <Center>
            <Button
              component={Link}
              href="/darmasaba/sdgs-desa"
              radius="xl"
              size="lg"
              mt={40}
              variant="gradient"
              gradient={{ from: "#26667F", to: "#124170" }}
              style={{ boxShadow: "0 6px 14px rgba(18,65,112,0.25)"}}
            >
              <Text c="white" fz={{ base: "md", md: "lg" }} fw="bold">Jelajahi Semua Tujuan SDGs Desa</Text>
            </Button>
          </Center>
        </Box>
      </Container>
    </Stack>
  )
}
