'use client'
import { useEffect, useState } from "react"
import { Box, Button, Center, Container, Image, Paper, SimpleGrid, Stack, Text, Title, useMantineTheme } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { Prisma } from "@prisma/client"
import Link from "next/link"
import { IconMoodSad } from "@tabler/icons-react"

export default function SDGS() {
  const theme = useMantineTheme()
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)
  const [sdgsDesa, setSdgsDesa] = useState<Prisma.SDGSDesaGetPayload<{ include: { image: true } }>[] | null>(null)

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
          <Title order={1} fz={{ base: "2.2rem", md: "3.4rem" }} fw={900}>
            SDGs Desa
          </Title>
        </Center>
        <Text fz={{ base: "1rem", md: "1.3rem" }} ta="center" c="dimmed" mt="md" maw={800} mx="auto">
          SDGs Desa adalah penerapan 17 Tujuan Pembangunan Berkelanjutan di tingkat desa. Fokus pada pengentasan kemiskinan,
          pendidikan, kesehatan, kesetaraan gender, dan pelestarian lingkungan untuk menciptakan desa yang maju, inklusif, dan berkelanjutan.
        </Text>

        <Box py={50}>
          <Paper
            p={{ base: "md", md: "xl" }}
            radius="xl"
            withBorder
            shadow="lg"
            style={{
              background: "linear-gradient(145deg, #FAF6E9, #FFFDF6)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {sdgsDesa && sdgsDesa.length > 0 ? (
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" verticalSpacing="xl">
                {sdgsDesa.map((item) => (
                  <Paper
                    key={item.id}
                    p="lg"
                    radius="lg"
                    shadow="sm"
                    style={{
                      background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                      border: "1px solid rgba(255,255,255,0.08)",
                      transition: "all 0.3s ease",
                    }}
                    withBorder
                  >
                    <Center mb="lg">
                      <Box
                        p="md"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          backdropFilter: "blur(6px)",
                          width: mobile ? 140 : 160,
                          height: mobile ? 140 : 160,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "1rem",
                        }}
                      >
                        <Image
                          src={item.image?.link ? item.image.link : "/placeholder-sdgs.png"}
                          alt={item.name}
                          w={mobile ? 90 : 110}
                          h={mobile ? 90 : 110}
                          fit="contain"
                        />
                      </Box>
                    </Center>
                    <Text ta="center" fz={{ base: "lg", md: "xl" }} fw={700} mb="xs">
                      {item.name}
                    </Text>
                    <Title
                      order={2}
                      ta="center"
                      style={{
                        fontSize: mobile ? "2.3rem" : "3rem",
                        fontWeight: 900,
                        letterSpacing: "-1px",
                      }}
                    >
                      {item.jumlah}
                    </Title>
                  </Paper>
                ))}
              </SimpleGrid>
            ) : (
              <Center mih={200} style={{ flexDirection: "column" }}>
                <IconMoodSad size={48} stroke={1.5} style={{ marginBottom: "1rem" }} />
                <Text fz="lg" c="dimmed">
                  Belum ada data SDGs Desa
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
              mt={30}
              variant="gradient"
              gradient={{ from: "#26667F", to: "#124170" }}
            >
              Lihat Semua SDGs Desa
            </Button>
          </Center>
        </Box>
      </Container>
    </Stack>
  )
}
