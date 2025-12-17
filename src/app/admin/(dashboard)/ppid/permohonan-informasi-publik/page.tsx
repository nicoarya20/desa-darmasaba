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
  IconId,
  IconInfoCircle,
  IconPhone,
  IconSearch,
  IconUser,
} from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useProxy } from 'valtio/utils'
import statepermohonanInformasiPublikForm from '../../_state/ppid/permohonan_informasi_publik/permohonanInformasiPublik'
import { useDebouncedValue } from '@mantine/hooks'

function Page() {
  const permohonanInformasiPublikState = useProxy(statepermohonanInformasiPublikForm)
  const router = useRouter()
  const { data, page, totalPages, loading, load } = permohonanInformasiPublikState.statepermohonanInformasiPublik.findMany
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 1000);

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
        <Paper bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} radius="xl" shadow="sm" withBorder>
          <Stack gap={'sm'}>
            <Grid mb={10}>
              <GridCol span={{ base: 12, md: 9 }}>
                <Title order={2} lh={1.2} c="dark">
                  Daftar Permohonan Informasi Publik
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
                  : 'Belum ada permohonan yang tercatat'
                }
              </Text>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    )
  }


  return (
    <Box py={{ base: 'sm', md: 'md' }}>
      <Paper bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} radius="xl" shadow="sm" withBorder>
        <Stack gap={'sm'}>
          <Grid mb={10}>
            <GridCol span={{ base: 12, md: 9 }}>
              <Title order={2} lh={1.2} c="dark">
                Daftar Permohonan Informasi Publik
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
            <Stack align="center" py={{ base: 'xl', md: 'xl' }}>
              <IconInfoCircle size={40} stroke={1.5} color={colors['blue-button']} />
              <Text fz={{ base: 'sm', md: 'md' }} fw={500} c="dimmed" lh={1.5}>
                Belum ada permohonan informasi yang tercatat
              </Text>
            </Stack>
          ) : (
            <>
              {/* Desktop Table */}
              <Box visibleFrom="md">
                <Table highlightOnHover>
                  <TableThead>
                    <TableTr>
                      <TableTh fz="sm" fw={600} ta="center" w={60}>
                        No
                      </TableTh>
                      <TableTh fz="sm" fw={600}>
                        <Group gap={5}>
                          <IconUser size={16} />
                          Nama
                        </Group>
                      </TableTh>
                      <TableTh fz="sm" fw={600}>
                        <Group gap={5}>
                          <IconId size={16} />
                          NIK
                        </Group>
                      </TableTh>
                      <TableTh fz="sm" fw={600}>
                        <Group gap={5}>
                          <IconPhone size={16} />
                          Telepon
                        </Group>
                      </TableTh>
                      <TableTh fz="sm" fw={600} w={140}>
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
                          <Text fz="sm" lh={1.5}>{item.nik}</Text>
                        </TableTd>
                        <TableTd>
                          <Text fz="sm" lh={1.5}>{item.notelp}</Text>
                        </TableTd>
                        <TableTd>
                          <Button
                            size="xs"
                            radius="md"
                            variant="light"
                            color="blue"
                            leftSection={<IconDeviceImacCog size={16} />}
                            onClick={() =>
                              router.push(`/admin/ppid/permohonan-informasi-publik/${item.id}`)
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
                    <Stack gap={4}>
                      <Box>
                        <Text fz="xs" fw={600} lh={1.4} c="dark">
                          No
                        </Text>
                        <Text fz="sm" fw={500} lh={1.5} c="dark">
                          {index + 1}
                        </Text>
                      </Box>
                      <Box>
                        <Text fz="xs" fw={600} lh={1.4} c="dark">
                          Nama
                        </Text>
                        <Text fz="sm" fw={500} lh={1.5} c="dark" lineClamp={1}>
                          {item.name}
                        </Text>
                      </Box>
                      <Box>
                        <Text fz="xs" fw={600} lh={1.4} c="dark">
                          NIK
                        </Text>
                        <Text fz="sm" lh={1.5} c="dark">{item.nik}</Text>
                      </Box>
                      <Box>
                        <Text fz="xs" fw={600} lh={1.4} c="dark">
                          Telepon
                        </Text>
                        <Text fz="sm" lh={1.5} c="dark">{item.notelp}</Text>
                      </Box>
                      <Box>
                        <Text fz="xs" fw={600} lh={1.4} c="dark">
                          Detail
                        </Text>
                        <Button
                          size="xs"
                          radius="md"
                          variant="light"
                          color="blue"
                          leftSection={<IconDeviceImacCog size={16} />}
                          onClick={() =>
                            router.push(`/admin/ppid/permohonan-informasi-publik/${item.id}`)
                          }
                          mt={2}
                        >
                          Lihat Detail
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