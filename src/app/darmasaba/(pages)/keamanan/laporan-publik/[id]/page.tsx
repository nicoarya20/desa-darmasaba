'use client'
import laporanPublikState from '@/app/admin/(dashboard)/_state/keamanan/laporan-publik'
import colors from '@/con/colors'
import {
  Box,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
  Tooltip
} from '@mantine/core'
import { useShallowEffect } from '@mantine/hooks'
import { IconArrowLeft } from '@tabler/icons-react'
import { useParams, useRouter } from 'next/navigation'
import { useProxy } from 'valtio/utils'

function Page() {
  const stateLaporan = useProxy(laporanPublikState)
  const params = useParams()
  const router = useRouter()

  useShallowEffect(() => {
    stateLaporan.findUnique.load(params?.id as string)
  }, [])

  if (!stateLaporan.findUnique.data) {
    return (
      <Stack align="center" justify="center" h="70vh">
        <Loader size="lg" color="blue" />
        <Text c="dimmed">Memuat detail laporan publik...</Text>
      </Stack>
    )
  }

  const data = stateLaporan.findUnique.data

  return (
    <Box py="xl" px={{ base: 'md', md: 100 }}>
      <Group mb="lg">
        <Tooltip label="Kembali ke daftar laporan">
          <Button
            variant="light"
            color="blue"
            leftSection={<IconArrowLeft size={20} />}
            onClick={() => router.back()}
            radius="xl"
          >
            Kembali
          </Button>
        </Tooltip>
      </Group>

      <Paper
        withBorder
        p="xl"
        radius="xl"
        shadow="md"
        bg={colors['white-1']}
      >
        <Stack gap="lg">
          <Title order={2} >
            Detail Laporan Publik
          </Title>

          <Card withBorder radius="md" shadow="sm" p="md" >
            <Stack gap="md">
              <Box>
                <Text fw={600} fz="lg" >Judul</Text>
                <Text fz="sm" c="dimmed">{data.judul || '-'}</Text>
              </Box>

              <Divider />

              <Box>
                <Text fw={600} fz="lg" >Tanggal</Text>
                <Text fz="sm" c="dimmed">
                  {data.tanggalWaktu
                    ? new Date(data.tanggalWaktu).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })
                    : '-'}
                </Text>
              </Box>

              <Divider />

              <Box>
                <Text fw={600} fz="lg" >Lokasi</Text>
                <Text fz="sm" c="dimmed">{data.lokasi || '-'}</Text>
              </Box>

              <Divider />

              <Box>
                <Text fw={600} fz="lg" >Status</Text>
                <Box
                  style={{
                    display: 'inline-block',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    backgroundColor:
                      data.status === 'Selesai' ? '#38d9a9' :
                        data.status === 'Proses' ? '#ffd43b' :
                          '#ff6b6b',
                    color: data.status === 'Proses' ? '#2e2e2e' : '#fff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    textAlign: 'center',
                    minWidth: '90px',
                  }}
                >
                  {data.status || '-'}
                </Box>
              </Box>

              <Divider />

              <Box>
                <Text fw={600} fz="lg" >Kronologi</Text>
                <Text fz="sm" c="dimmed" style={{wordBreak: "break-word", whiteSpace: "normal"}} dangerouslySetInnerHTML={{ __html: data.kronologi || '-' }} />
              </Box>

              <Divider />

              <Box>
                <Text fw={600} fz="lg" >Penanganan</Text>
                {data.penanganan?.length ? (
                  <Stack gap="sm" mt="xs">
                    {data.penanganan.map((item, index) => (
                      <Paper
                        key={index}
                        p="sm"
                        radius="md"
                        shadow="xs"
                        withBorder
                        bg="dark.5"
                      >
                        <Text
                          fz="sm"
                          c="dimmed"
                          dangerouslySetInnerHTML={{ __html: item.deskripsi || '-' }}
                          style={{wordBreak: "break-word", whiteSpace: "normal"}}
                        />
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Text fz="sm" c="dimmed" fs="italic">
                    Belum ada penanganan
                  </Text>
                )}
              </Box>
            </Stack>
          </Card>
        </Stack>
      </Paper>
    </Box>
  )
}

export default Page
