'use client'
import { useProxy } from 'valtio/utils'
import { useShallowEffect } from '@mantine/hooks'
import { Box, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Title, Text, Group, Tooltip, Badge } from '@mantine/core'
import { IconInfoCircle, IconUser, IconMail, IconPhone, IconId } from '@tabler/icons-react'
import statepermohonanInformasiPublikForm from '../../_state/ppid/permohonan_informasi_publik/permohonanInformasiPublik'
import colors from '@/con/colors'

function Page() {
  const permohonanInformasiPublikState = useProxy(statepermohonanInformasiPublikForm)

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
            <Tooltip label="Data permohonan informasi sesuai dengan pengajuan masyarakat" position="bottom">
              <IconInfoCircle size={20} stroke={1.5} />
            </Tooltip>
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
                    <TableTh><Group gap={5}><IconMail size={16} /> Email</Group></TableTh>
                    <TableTh>Jenis Informasi</TableTh>
                    <TableTh>Cara Akses Informasi</TableTh>
                    <TableTh>Salinan Informasi</TableTh>
                  </TableTr>
                </TableThead>
                <TableTbody>
                  {data.map((item, index) => (
                    <TableTr key={item.id}>
                      <TableTd>{index + 1}</TableTd>
                      <TableTd>
                        <Tooltip label={item.name}>
                          <Text lineClamp={1} fw={500}>{item.name}</Text>
                        </Tooltip>
                      </TableTd>
                      <TableTd>{item.nik}</TableTd>
                      <TableTd>{item.notelp}</TableTd>
                      <TableTd>{item.email}</TableTd>
                      <TableTd>
                        <Badge variant="light" radius="sm" color="blue">
                          {item.jenisInformasiDiminta?.name || '-'}
                        </Badge>
                      </TableTd>
                      <TableTd>
                        <Tooltip label={item.caraMemperolehInformasi?.name}>
                          <Text lineClamp={1} size="sm">{item.caraMemperolehInformasi?.name || '-'}</Text>
                        </Tooltip>
                      </TableTd>
                      <TableTd>
                        <Tooltip label={item.caraMemperolehSalinanInformasi?.name}>
                          <Text lineClamp={1} size="sm">{item.caraMemperolehSalinanInformasi?.name || '-'}</Text>
                        </Tooltip>
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
