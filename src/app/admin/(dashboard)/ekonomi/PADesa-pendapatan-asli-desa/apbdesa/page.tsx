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
  Text
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
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
    load(page, 10, search);
  }, [page, search]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors["white-1"]} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Text fw={600} fz="lg">
            List APB Desa
          </Text>
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
        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: "15%" }}>Tahun</TableTh>
                <TableTh style={{ width: "25%" }}>Pembiayaan</TableTh>
                <TableTh style={{ width: "25%" }}>Belanja</TableTh>
                <TableTh style={{ width: "25%" }}>Pendapatan</TableTh>
                <TableTh style={{ width: "10%" }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>{item.tahun}</TableTd>
                    <TableTd>
                      {formatRupiah(
                        item.pembiayaan.reduce(
                          (sum, val) => sum + Number(val.value),
                          0
                        )
                      )}
                    </TableTd>
                    <TableTd>
                      {formatRupiah(
                        item.belanja.reduce(
                          (sum, val) => sum + Number(val.value),
                          0
                        )
                      )}
                    </TableTd>
                    <TableTd>
                      {formatRupiah(
                        item.pendapatan.reduce(
                          (sum, val) => sum + Number(val.value),
                          0
                        )
                      )}
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
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py={20}>
                      <Text color="dimmed">
                        Tidak ada data APB Desa yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
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
