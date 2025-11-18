/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import apbdes from '@/app/admin/(dashboard)/_state/landing-page/apbdes'
import APBDesProgress from '@/app/darmasaba/(tambahan)/apbdes/lib/apbDesaProgress'
import colors from '@/con/colors'
import { ActionIcon, BackgroundImage, Box, Button, Center, Flex, Group, Loader, SimpleGrid, Stack, Text } from '@mantine/core'
import { IconDownload } from '@tabler/icons-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useProxy } from 'valtio/utils'

function Apbdes() {
  const state = useProxy(apbdes)
  const [loading, setLoading] = useState(false)

  const textHeading = {
    title: 'APBDes',
    des: 'Transparansi APBDes Darmasaba adalah langkah nyata menuju tata kelola desa yang bersih, terbuka, dan bertanggung jawab.'
  }

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

  const data = (state.findMany.data || []).slice(0, 3)

  return (
    <Stack p="sm" gap="xl" bg={colors.Bg}>
      <Box mt={"xl"}>
        <Stack gap="sm">
          <Text c={colors["blue-button"]} ta={"center"} fw={"bold"} fz={{ base: "1.8rem", md: "3.4rem" }}>
            {textHeading.title}
          </Text>
          <Text ta={"center"} fz={{ base: "1rem", md: "1.3rem" }}>
            {textHeading.des}
          </Text>
        </Stack>
      </Box>

      <Group justify="center">
        <Button
          component={Link}
          href="/darmasaba/apbdes"
          radius="xl"
          size="lg"
          variant="gradient"
          gradient={{ from: "#26667F", to: "#124170" }}
        >
          Lihat Semua Data
        </Button>
      </Group>

      {/* Chart */}
      <APBDesProgress />

      <SimpleGrid mx={{ base: 'md', md: 100 }} cols={{ base: 1, sm: 3 }} spacing="lg" pb={"xl"}>
        {loading ? (
          <Center mih={200}>
            <Loader size="lg" color="blue" />
          </Center>
        ) : data.length === 0 ? (
          <Center mih={200}>
            <Stack align="center" gap="xs">
              <Text fz="lg" c="dimmed">
                Belum ada data APBDes yang tersedia
              </Text>
              <Text fz="sm" c="dimmed">
                Data akan ditampilkan di sini setelah diunggah
              </Text>
            </Stack>
          </Center>
        ) : (
          data.map((v, k) => (
            <BackgroundImage
              key={k}
              src={v.image?.link || ''}
              h={360}
              radius="xl"
              pos="relative"
              style={{ overflow: 'hidden' }}
            >
              <Box pos="absolute" inset={0} bg="rgba(0,0,0,0.45)" style={{ borderRadius: 16 }} />
              <Stack justify="space-between" h="100%" p="xl" pos="relative">
                <Text
                  c="white"
                  fw={600}
                  fz="lg"
                  ta="center"
                  lineClamp={2}
                >
                  {v.name}
                </Text>
                <Text
                  fw="bold"
                  c="white"
                  fz="3rem"
                  ta="center"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
                >
                  {v.jumlah}
                </Text>
                <Group justify="center">
                  <ActionIcon
                    component={Link}
                    href={v.file?.link || ''}
                    radius="xl"
                    size="lg"
                    variant="gradient"
                    gradient={{ from: '#1C6EA4', to: '#1C6EA4' }}
                  >
                    <Flex align="center" gap="xs" px="md" py={6}>
                      <IconDownload size={18} color="white" />
                    </Flex>
                  </ActionIcon>
                </Group>
              </Stack>
            </BackgroundImage>
          ))
        )}
      </SimpleGrid>

      
    </Stack>
  )
}

export default Apbdes
