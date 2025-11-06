/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import apbdes from '@/app/admin/(dashboard)/_state/landing-page/apbdes'
import colors from '@/con/colors'
import { BarChart } from '@mantine/charts'
import { ActionIcon, BackgroundImage, Box, Button, Center, Flex, Group, Loader, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { IconDownload } from '@tabler/icons-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useProxy } from 'valtio/utils'
import parseJumlah from './lib/convert'

function Apbdes() {
  type APBDes = {
    id: string
    name: string
    jumlah: number
  };

  const [chartData, setChartData] = useState<APBDes[]>([])
  const [mounted, setMounted] = useState(false);
  const state = useProxy(apbdes)
  const [loading, setLoading] = useState(false)

  const textHeading = {
    title: 'APBDes',
    des: 'Transparansi APBDes Darmasaba adalah langkah nyata menuju tata kelola desa yang bersih, terbuka, dan bertanggung jawab.'
  }

  useEffect(() => {
    if (state.findMany.data) {
      setChartData(
        state.findMany.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          jumlah: parseJumlah(item.jumlah),
        }))
      );
    }
  }, [state.findMany.data]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setMounted(true);
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

      {/* Chart */}
      <Box mt={30} style={{ width: '100%', minHeight: 400 }}>
        <Paper bg={colors['white-1']} py={50} px={90} mb={"xl"} radius="md" withBorder>
          <Stack gap={"xs"}>
            <Title ta={"center"} pb={10} order={2}>
              Grafik APBDes
            </Title>
            {mounted && chartData.length > 0 ? (
              <BarChart
                orientation="vertical"
                h={450}
                barProps={{ radius: 50 }}
                data={chartData}
                dataKey="name"
                type="stacked"
                valueFormatter={(value: number) => {
                  if (value >= 1_000_000_000_000)
                    return `Rp ${(value / 1_000_000_000_000).toFixed(1)} T`;
                  if (value >= 1_000_000_000)
                    return `Rp ${(value / 1_000_000_000).toFixed(1)} M`;
                  if (value >= 1_000_000)
                    return `Rp ${(value / 1_000_000).toFixed(1)} Jt`;
                  if (value >= 1_000)
                    return `Rp ${(value / 1_000).toFixed(1)} Rb`;
                  return `Rp ${value}`;
                }}
                series={[
                  {
                    name: 'jumlah',
                    color: colors['blue-button'],
                    label: 'Jumlah',
                  },
                ]}
              />
            ) : (
              <Text c="dimmed">Belum ada data untuk ditampilkan dalam grafik</Text>
            )}
            <Box py={10}>
              <Group justify='center'>
                <Flex align="center" gap={10}>
                  <Box bg={colors['blue-button']} w={20} h={20} />
                  <Text>Jumlah</Text>
                </Flex>
              </Group>
            </Box>
          </Stack>
        </Paper>
      </Box>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
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

      <Group justify="center" pb={"xl"}>
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
    </Stack>
  )
}

export default Apbdes
