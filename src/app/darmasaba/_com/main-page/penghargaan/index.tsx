/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import penghargaanState from "@/app/admin/(dashboard)/_state/desa/penghargaan";
import colors from "@/con/colors";
import { Stack, Box, Container, Button, Text } from "@mantine/core";
import { useTransitionRouter } from 'next-view-transitions'
import { useEffect, useState } from "react";
import { useProxy } from "valtio/utils";

function Penghargaan() {
  const router = useTransitionRouter()
  const state = useProxy(penghargaanState)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        await state.findMany.load()
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const data = state.findMany.data?.slice(0, 3)
  return (
    <Stack pos={"relative"} h={720}>
      <video
        width="320"
        height="240"
        loop
        autoPlay
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          overflow: "hidden",
        }}
      >
        <source src="/assets/videos/award.mp4" type="video/mp4" />
      </video>
      <Box
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          background: "rgba(0,0,0,0.6)",
        }}
      >
        <Container w={{ base: "100%", md: "80%" }} p={"xl"} h={720}>
          <Stack justify="center" align="center">
            <Text
              style={{
                textAlign: "center",
              }}
              fw={"bold"}
              fz={"2.4rem"}
              c={"white"}
            >
              Penghargaan
            </Text>
            {loading ? (
              <Text
                style={{
                  textAlign: "center",
                }}
                fw={"bold"}
                fz={"2.4rem"}
                c={"white"}
              >
                Memuat Data...
              </Text>
            ) : (
              data?.map((v, k) => {
                return (
                  <Box key={k}>
                    <Stack align="center" gap={0}>
                      <Text fz={"1.4rem"} c={"white"}>
                        {v.name}
                      </Text>
                    </Stack>
                  </Box>
                );
              })
            )}
            <Button color={colors["blue-button"]} onClick={() => router.push("/darmasaba/penghargaan")} variant="white" radius={100}>
              Selanjutnya
            </Button>
          </Stack>
        </Container>
      </Box>
    </Stack>
  );
}

export default Penghargaan;