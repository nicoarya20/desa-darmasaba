'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
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
  Title
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
  import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import PendapatanAsliDesa from '../../../_state/ekonomi/PADesa';

function APBDesa() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title="APB Desa"
        placeholder="Cari tahun atau nominal..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListAPBDesa search={search} />
    </Box>
  );
}

function ListAPBDesa({ search }: { search: string }) {
  const apbDesaState = useProxy(PendapatanAsliDesa.ApbDesa);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = apbDesaState.findMany;

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={{ base: 'sm', md: 'md' }}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'sm', md: 'md' }}>
      <Paper withBorder bg={colors["white-1"]} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            List APB Desa
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push(
                "/admin/ekonomi/PADesa-pendapatan-asli-desa/apbdesa/create"
              )
            }
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md">
          <Table
            highlightOnHover
            miw={0}
            style={{
              tableLayout: 'fixed',
              width: '100%',
            }}
          >
            <TableThead>
              <TableTr>
                <TableTh style={{ width: "15%" }}>
                  <Text fz="sm" fw={600} lh={1.4} ta="left">Tahun</Text>
                </TableTh>
                <TableTh style={{ width: "25%" }}>
                  <Text fz="sm" fw={600} lh={1.4} ta="left">Pembiayaan</Text>
                </TableTh>
                <TableTh style={{ width: "25%" }}>
                  <Text fz="sm" fw={600} lh={1.4} ta="left">Belanja</Text>
                </TableTh>
                <TableTh style={{ width: "25%" }}>
                  <Text fz="sm" fw={600} lh={1.4} ta="left">Pendapatan</Text>
                </TableTh>
                <TableTh style={{ width: "10%" }}>
                  <Text fz="sm" fw={600} lh={1.4} ta="left">Aksi</Text>
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} ta="left">{item.tahun}</Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} ta="left">
                        {formatRupiah(
                          item.pembiayaan.reduce(
                            (sum, val) => sum + Number(val.value),
                            0
                          )
                        )}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} ta="left">
                        {formatRupiah(
                          item.belanja.reduce(
                            (sum, val) => sum + Number(val.value),
                            0
                          )
                        )}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} ta="left">
                        {formatRupiah(
                          item.pendapatan.reduce(
                            (sum, val) => sum + Number(val.value),
                            0
                          )
                        )}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="green"
                        onClick={() =>
                          router.push(
                            `/admin/ekonomi/PADesa-pendapatan-asli-desa/apbdesa/${item.id}`
                          )
                        }
                        size="compact-sm"
                      >
                        <IconDeviceImacCog size={16} />
                        <Text ml={5} fz="sm" fw={500} lh={1.4}>
                          Detail
                        </Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py={20}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data APB Desa yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Box hiddenFrom="md">
          <Stack gap="sm">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <Paper key={item.id} withBorder p="md" radius="sm">
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4}>Tahun</Text>
                      <Text fz="sm" fw={500} lh={1.4}>{item.tahun}</Text>
                    </Box>
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4}>Pembiayaan</Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {formatRupiah(
                          item.pembiayaan.reduce(
                            (sum, val) => sum + Number(val.value),
                            0
                          )
                        )}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4}>Belanja</Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {formatRupiah(
                          item.belanja.reduce(
                            (sum, val) => sum + Number(val.value),
                            0
                          )
                        )}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4}>Pendapatan</Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {formatRupiah(
                          item.pendapatan.reduce(
                            (sum, val) => sum + Number(val.value),
                            0
                          )
                        )}
                      </Text>
                    </Box>
                    <Button
                      variant="light"
                      color="green"
                      fullWidth
                      onClick={() =>
                        router.push(
                          `/admin/ekonomi/PADesa-pendapatan-asli-desa/apbdesa/${item.id}`
                        )
                      }
                      size="sm"
                    >
                      <IconDeviceImacCog size={16} />
                      <Text ml={5} fz="sm" fw={500} lh={1.4}>
                        Detail
                      </Text>
                    </Button>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py={20}>
                <Text c="dimmed" fz="sm" lh={1.4}>
                  Tidak ada data APB Desa yang cocok
                </Text>
              </Center>
            )}
          </Stack>
        </Box>
      </Paper>

      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          total={totalPages}
          mt="md"
          mb="md"
          color="blue"
          radius="md"
        />
      </Center>
    </Box>
  );
}

export default APBDesa;