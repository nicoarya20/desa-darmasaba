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
        else return setSdgsDesa([])

        const top4Sdgs = [...data].sort((a, b) => parseInt(b.jumlah) - parseInt(a.jumlah)).slice(0, 4)
        setSdgsDesa(top4Sdgs)
      } catch {
        setSdgsDesa([])
      }
    }
    fetchSdgsDesa()
  }, [])

  return (
    <Stack p="sm" my="xs">
      <Container w={{ base: "100%", md: "80%" }} p="xl">

        {/* ========== TITLE SECTION ========== */}
        <Center>
          <Title
            order={1}
            fz={{ base: "2.2rem", md: "3.4rem" }}
            lh={{ base: 1.1, md: 1.1 }}
            fw={900}
            c={colors["blue-button"]}
            ta="center"
          >
            SDGs Desa
          </Title>
        </Center>

        <Text
          ta="center"
          fz={{ base: "1rem", md: "1.2rem" }}
          lh={{ base: 1.5, md: 1.6 }}
          c="black"
          mt="xs"
          mb="md"
        >
          SDGs Desa adalah upaya desa untuk menciptakan pembangunan yang maju, inklusif, dan berkelanjutan melalui 17 tujuan mulai dari pengentasan kemiskinan, pendidikan, kesehatan, hingga pelestarian lingkungan.
        </Text>

        <Box py="lg">
          {sdgsDesa && sdgsDesa.length > 0 ? (

            /* ========== LIST GRID ========== */
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
                      height: "100%",
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
                          src={item.image?.link || "/no-image.jpg"}
                          alt={item.name}
                          w={mobile ? 90 : 110}
                          h={mobile ? 90 : 110}
                          fit="contain"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/no-image.jpg";
                          }}
                        />
                      </Box>
                    </Center>

                    <Stack justify="space-between" align="center" gap="xs" h="100%">
                      
                      {/* JUDUL ITEM */}
                      <Text
                        ta="center"
                        fz={{ base: "lg", md: "xl" }}
                        lh={{ base: 1.3, md: 1.3 }}
                        fw={700}
                        style={{ minHeight: mobile ? 60 : 70 }}
                      >
                        {item.name}
                      </Text>

                      {/* ANGKA */}
                      <Title
                        order={2}
                        ta="center"
                        style={{
                          fontSize: mobile ? "2.2rem" : "3rem",
                          lineHeight: 1.1,
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

            /* ========== EMPTY STATE ========== */
            <Center mih={200} style={{ flexDirection: "column" }}>
              <IconMoodSad size={48} stroke={1.5} style={{ marginBottom: "1rem" }} />
              <Text fz="lg" lh={1.4} c="dimmed">Data SDGs Desa belum tersedia</Text>
            </Center>
          )}

          {/* BUTTON */}
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
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)"
                e.currentTarget.style.boxShadow = "0 10px 20px rgba(18,65,112,0.35)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 6px 14px rgba(18,65,112,0.25)"
              }}
            >
              <Text c="white" fz={{ base: "md", md: "lg" }} lh={1.3} fw={600}>
                Jelajahi Semua Tujuan SDGs Desa
              </Text>
            </Button>
          </Center>
        </Box>
      </Container>
    </Stack>
  )
}
