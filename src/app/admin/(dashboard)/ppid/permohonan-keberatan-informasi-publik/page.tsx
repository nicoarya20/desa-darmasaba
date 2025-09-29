'use client'
import colors from '@/con/colors'
import { Box, Group, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title, Tooltip } from '@mantine/core'
import { useShallowEffect } from '@mantine/hooks'
import { IconInfoCircle, IconMail, IconMessage, IconPhone, IconUser } from '@tabler/icons-react'
import { useProxy } from 'valtio/utils'
import statePermohonanKeberatan from '../../_state/ppid/permohonan_keberatan_informasi_publik/permohonanKeberatanInformasi'

function Page() {
  const listState = useProxy(statePermohonanKeberatan)
  useShallowEffect(() => {
    listState.findMany.load()
  }, [])

  if (!listState.findMany.data) {
    return (
      <Stack pos="relative" bg={colors.Bg} p="lg" align="center">
        <Skeleton radius="md" h={40} w="60%" />
        <Skeleton radius="md" h={200} w="100%" />
      </Stack>
    )
  }

  const data = listState.findMany.data

  return (
    <Box py="md">
      <Paper bg={colors['white-1']} p="lg" radius="xl" shadow="sm" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={2} c="dark">Daftar Permohonan Keberatan Informasi Publik</Title>
            <Tooltip label="Data permohonan keberatan atas informasi yang diajukan masyarakat" position="bottom">
              <IconInfoCircle size={20} stroke={1.5} />
            </Tooltip>
          </Group>

          {data.length === 0 ? (
            <Stack align="center" py="xl">
              <IconInfoCircle size={40} stroke={1.5} color={colors['blue-button']} />
              <Text fw={500} c="dimmed">Belum ada permohonan keberatan yang tercatat</Text>
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
                    <TableTh><Group gap={5}><IconMail size={16} /> Email</Group></TableTh>
                    <TableTh><Group gap={5}><IconPhone size={16} /> Telepon</Group></TableTh>
                    <TableTh><Group gap={5}><IconMessage size={16} /> Alasan Keberatan</Group></TableTh>
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
                      <TableTd>
                        <Text size="sm">{item.email || '-'}</Text>
                      </TableTd>
                      <TableTd>
                        <Text>{item.notelp || '-'}</Text>
                      </TableTd>
                      <TableTd>
                        <Tooltip label={item.alasan?.replace(/<[^>]*>?/gm, '')}>
                          <div 
                            style={{ 
                              maxWidth: '300px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis', 
                              wordBreak: "break-word",
                              whiteSpace: "normal" 
                            }}
                            dangerouslySetInnerHTML={{ 
                              __html: item.alasan ? 
                                item.alasan.replace(/<[^>]*>?/gm, '').substring(0, 50) + '...' : 
                                '-' 
                            }} 
                            
                          />
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
  );
}
export default Page;
