/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors'
import {
  Box,
  Button,
  Center,
  Grid,
  GridCol,
  Group,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import {
  IconDeviceImacCog,
  IconInfoCircle,
  IconMail,
  IconPhone,
  IconSearch,
  IconUser,
} from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useProxy } from 'valtio/utils'
import statePermohonanKeberatan from '../../_state/ppid/permohonan_keberatan_informasi_publik/permohonanKeberatanInformasi'
import { useEffect, useState } from 'react'
import { useDebouncedValue } from '@mantine/hooks'

function Page() {
  const router = useRouter()
  const listState = useProxy(statePermohonanKeberatan)
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 1000);
  const { data, page, totalPages, loading, load } = listState.findMany

  useEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  if (loading) {
    return (
      <Stack pos="relative" p="lg" align="center">
        <Skeleton radius="md" h={200} w="100%" />
      </Stack>
    )
  }
  if (!data || data.length === 0) {
    return (
      <Box py={{ base: 'md', md: 'lg' }}>
        <Paper bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} radius="md" shadow="sm" withBorder>
          <Stack gap={'sm'}>
            <Grid mb={10}>
              <GridCol span={{ base: 12, md: 9 }}>
                <Title order={4} lh={1.2} c="dark">
                  Daftar Permohonan Keberatan Informasi Publik
                </Title>
              </GridCol>
              <GridCol span={{ base: 12, md: 3 }}>
                <Paper radius="lg" bg={colors['white-1']}>
                  <TextInput
                    radius="lg"
                    placeholder={"Cari nama..."}
                    leftSection={<IconSearch size={16} />}
                    w="100%"
                    value={search}
                    onChange={(e) => setSearch(e.currentTarget.value)}
                  />
                </Paper>
              </GridCol>
            </Grid>
            <Stack align="center" py="xl" ta="center">
              <IconInfoCircle size={40} stroke={1.5} color={colors['blue-button']} />
              <Text fz={{ base: 'sm', md: 'md' }} fw={500} c="dimmed" lh={1.5}>
                {search
                  ? 'Tidak ditemukan data yang sesuai dengan pencarian'
                  : 'Belum ada permohonan keberatan yang tercatat'
                }
              </Text>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    )
  }

  return (
    <Box py={{ base: 'md', md: 'lg' }}>
      <Paper bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} radius="md" shadow="sm" withBorder>
        <Stack gap={'sm'}>
          <Grid mb={10}>
            <GridCol span={{ base: 12, md: 9 }}>
              <Title order={4} lh={1.2} c="dark">
                Daftar Permohonan Keberatan Informasi Publik
              </Title>
            </GridCol>
            <GridCol span={{ base: 12, md: 3 }}>
              <Paper radius="lg" bg={colors['white-1']}>
                <TextInput
                  radius="lg"
                  placeholder={"Cari nama..."}
                  leftSection={<IconSearch size={16} />}
                  w="100%"
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                />
              </Paper>
            </GridCol>
          </Grid>

          {data.length === 0 ? (
            <Stack align="center" py="xl" ta="center">
              <IconInfoCircle size={40} stroke={1.5} color={colors['blue-button']} />
              <Text fz={{ base: 'sm', md: 'md' }} fw={500} c="dimmed" lh={1.5}>
                Belum ada permohonan keberatan yang tercatat
              </Text>
            </Stack>
          ) : (
            <>
              {/* Desktop Table */}
             <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
               <Table highlightOnHover
    layout="fixed" // 🔥 PENTING
    withColumnBorders={false}>
                  <TableThead>
                    <TableTr>
                      <TableTh fz="sm" fw={600} lh={1.4} ta="center">
                        No
                      </TableTh>
                      <TableTh fz="sm" fw={600} lh={1.4}>
                        <Group gap={5}>
                          <IconUser size={16} />
                          Nama
                        </Group>
                      </TableTh>
                      <TableTh fz="sm" fw={600} lh={1.4}>
                        <Group gap={5}>
                          <IconMail size={16} />
                          Email
                        </Group>
                      </TableTh>
                      <TableTh fz="sm" fw={600} lh={1.4}>
                        <Group gap={5}>
                          <IconPhone size={16} />
                          Telepon
                        </Group>
                      </TableTh>
                      <TableTh fz="sm" fw={600} lh={1.4} ta="center">
                        <Group gap={5}>
                          <IconInfoCircle size={16} />
                          Detail
                        </Group>
                      </TableTh>
                    </TableTr>
                  </TableThead>
                  <TableTbody>
                    {data.map((item, index) => (
                      <TableTr key={item.id}>
                        <TableTd ta="center" fz="sm" lh={1.5}>
                          {index + 1}
                        </TableTd>
                        <TableTd>
                          <Text fz="sm" fw={500} lh={1.5} lineClamp={1}>
                            {item.name}
                          </Text>
                        </TableTd>
                        <TableTd>
                          <Text fz="sm" lh={1.5}>
                            {item.email || '-'}
                          </Text>
                        </TableTd>
                        <TableTd>
                          <Text fz="sm" lh={1.5}>
                            {item.notelp || '-'}
                          </Text>
                        </TableTd>
                        <TableTd>
                          <Button
                            size="xs"
                            radius="md"
                            variant="light"
                            color="blue"
                            leftSection={<IconDeviceImacCog size={16} />}
                            onClick={() =>
                              router.push(
                                `/admin/ppid/permohonan-keberatan-informasi-publik/${item.id}`
                              )
                            }
                          >
                            Detail
                          </Button>
                        </TableTd>
                      </TableTr>
                    ))}
                  </TableTbody>
                </Table>
              </Box>

              {/* Mobile Cards */}
              <Stack hiddenFrom="md" gap="xs">
                {data.map((item, index) => (
                  <Paper key={item.id} p="sm" radius="md" withBorder bg="white">
                    <Stack gap={'xs'}>
                      <Box>
                        <Text fz="xs" fw={600} lh={1.4} c="dimmed">
                          No
                        </Text>
                        <Text fz="sm" fw={600} lh={1.5}>
                          {index + 1}
                        </Text>
                      </Box>
                      <Box>
                        <Text fz="xs" fw={600} lh={1.4} c="dimmed">
                          Nama
                        </Text>
                        <Text fz="sm" fw={600} lh={1.5}>
                          {item.name}
                        </Text>
                      </Box>
                      <Box>
                        <Text fz="xs" fw={600} lh={1.4} c="dimmed">
                          Email
                        </Text>
                        <Text fz="sm" lh={1.5}>
                          {item.email || '-'}
                        </Text>
                      </Box>
                      <Box>
                        <Text fz="xs" fw={600} lh={1.4} c="dimmed">
                          Telepon
                        </Text>
                        <Text fz="sm" lh={1.5}>
                          {item.notelp || '-'}
                        </Text>
                      </Box>
                      <Box>
                        <Button
                          size="xs"
                          radius="md"
                          variant="light"
                          color="blue"
                          leftSection={<IconDeviceImacCog size={16} />}
                          onClick={() =>
                            router.push(
                              `/admin/ppid/permohonan-keberatan-informasi-publik/${item.id}`
                            )
                          }
                          mt={4}
                        >
                          Detail
                        </Button>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </>
          )}
        </Stack>
        <Center mt="xl">
          <Pagination
            value={page}
            onChange={(newPage) => {
              load(newPage, 10);
              window.scrollTo(0, 0);
            }}
            total={totalPages}
            withEdges
            withControls
            radius="md"
          />
        </Center>
      </Paper>
    </Box>
  )
}

export default Page