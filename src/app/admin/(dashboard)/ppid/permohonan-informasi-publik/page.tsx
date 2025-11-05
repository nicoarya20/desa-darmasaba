'use client'
import colors from '@/con/colors'
import { Box, Button, Group, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core'
import { useShallowEffect } from '@mantine/hooks'
import { IconDeviceImacCog, IconId, IconInfoCircle, IconPhone, IconUser } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useProxy } from 'valtio/utils'
import statepermohonanInformasiPublikForm from '../../_state/ppid/permohonan_informasi_publik/permohonanInformasiPublik'

function Page() {
  const permohonanInformasiPublikState = useProxy(statepermohonanInformasiPublikForm)
  const router = useRouter()

  useShallowEffect(() => {
    permohonanInformasiPublikState.statepermohonanInformasiPublik.findMany.load()
  }, [])

  if (!permohonanInformasiPublikState.statepermohonanInformasiPublik.findMany.data) {
    return (
      <Stack pos="relative" bg={colors.Bg} p="lg" align="center">
        <Skeleton radius="md" h={40} w="60%" />
        <Skeleton radius="md" h={200} w="100%" />
      </Stack>
    )
  }

  const data = permohonanInformasiPublikState.statepermohonanInformasiPublik.findMany.data

  return (
    <Box py="md">
      <Paper bg={colors['white-1']} p="lg" radius="xl" shadow="sm" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={2} c="dark">Daftar Permohonan Informasi Publik</Title>
              <IconInfoCircle size={20} stroke={1.5} />
          </Group>

          {data.length === 0 ? (
            <Stack align="center" py="xl">
              <IconInfoCircle size={40} stroke={1.5} color={colors['blue-button']} />
              <Text fw={500} c="dimmed">Belum ada permohonan informasi yang tercatat</Text>
            </Stack>
          ) : (
            <Box style={{ overflowX: 'auto' }}>
              <Table
                highlightOnHover
                withRowBorders
                withColumnBorders
                withTableBorder
                striped
                stickyHeader
              >
                <TableThead>
                  <TableTr>
                    <TableTh>No</TableTh>
                    <TableTh><Group gap={5}><IconUser size={16} /> Nama</Group></TableTh>
                    <TableTh><Group gap={5}><IconId size={16} /> NIK</Group></TableTh>
                    <TableTh><Group gap={5}><IconPhone size={16} /> Telepon</Group></TableTh>
                    <TableTh><Group gap={5}><IconInfoCircle size={16} /> Detail</Group></TableTh>
                  </TableTr>
                </TableThead>
                <TableTbody>
                  {data.map((item, index) => (
                    <TableTr key={item.id}>
                      <TableTd>{index + 1}</TableTd>
                      <TableTd>
                        <Box w={200}>
                          <Text lineClamp={1} fw={500}>{item.name}</Text>
                        </Box>
                      </TableTd>
                      <TableTd>
                        <Box w={200}>
                          {item.nik}
                        </Box>
                      </TableTd>
                      <TableTd>
                        <Box w={200}>
                          {item.notelp}
                        </Box>
                      </TableTd>
                      <TableTd>
                        <Button
                          size="xs"
                          radius="md"
                          variant="light"
                          color="blue"
                          leftSection={<IconDeviceImacCog size={16} />}
                          onClick={() => router.push(`/admin/ppid/permohonan-informasi-publik/${item.id}`)}
                        >
                          Detail
                        </Button>
                      </TableTd>
                    </TableTr>
                  ))}
                </TableTbody>
              </Table>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  )
}

export default Page
