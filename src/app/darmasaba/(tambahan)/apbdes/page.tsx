/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import apbdes from '@/app/admin/(dashboard)/_state/landing-page/apbdes'
import colors from '@/con/colors'
import { ActionIcon, BackgroundImage, Box, Center, Container, Group, Loader, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { IconDownload } from '@tabler/icons-react'
import { Link } from 'next-view-transitions'
import { useEffect, useState } from 'react'
import { useProxy } from 'valtio/utils'
import BackButton from '../../(pages)/desa/layanan/_com/BackButto'

function Page() {
  const state = useProxy(apbdes)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        await state.findMany.load()
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const data = state.findMany.data || []

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap={32}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Container w={{ base: '100%', md: '60%' }}>
        <Stack align="center" gap="sm">
          <Title order={1} fz={{ base: '2.4rem', md: '3.2rem' }} fw="bold" ta="center">
            Anggaran Pendapatan & Belanja Desa (APBDes)
          </Title>
          <Text fz="md" c="dimmed" ta="center">
            Laporan transparansi APBDes Desa Darmasaba sebagai bentuk keterbukaan dan akuntabilitas pengelolaan anggaran desa.
          </Text>
        </Stack>
      </Container>
      {loading ? (
        <Center mih={200}>
          <Stack align="center" gap="sm">
            <Loader size="lg" color="blue" />
            <Text fz="lg" c="dimmed">Sedang memuat data APBDes...</Text>
          </Stack>
        </Center>
      ) : data.length === 0 ? (
        <Center mih={200}>
          <Stack align="center" gap="xs">
            <Text fz="xl" fw={600} c="dimmed">Belum ada data APBDes tersedia</Text>
            <Text fz="sm" c="dimmed">Data akan ditampilkan jika sudah diunggah oleh admin desa</Text>
          </Stack>
        </Center>
      ) : (
        <SimpleGrid px={{ base: 'md', md: 100 }} cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
          {data.map((v: any, k: number) => (
            <BackgroundImage key={k} src={v.image?.link || ''} h={360} radius="xl" pos="relative">
              <Box pos="absolute" inset={0} bg="rgba(0,0,0,0.45)" style={{ borderRadius: 27 }} />
              <Stack justify="space-between" h="100%" p="lg" pos="relative">
                <Box>
                  <Text fz="lg" fw={600} c="white" ta="center">
                    {v.name}
                  </Text>
                </Box>
                <Text fz="2.6rem" fw="bold" c="white" ta="center">
                  {v.jumlah}
                </Text>
                <Group justify="center">
                  <ActionIcon
                    component={Link}
                    href={v.file?.link || '#'}
                    radius="xl"
                    size="lg"
                    bg={colors['blue-button']}
                    variant="filled"
                  >
                      <IconDownload size={20} color="white" />
                  </ActionIcon>
                </Group>
              </Stack>
            </BackgroundImage>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  )
}

export default Page
