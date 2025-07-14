/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import grafikBerdasarkanJenisKelamin from '@/app/admin/(dashboard)/_state/ppid/indeks_kepuasan_masyarakat/grafikBerdasarkanJenisKelamin';
import colors from '@/con/colors';
import { Box, Button, Center, Flex, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function GrafikBerdasarkanJenisKelamin() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Grafik Berdasarkan Jenis Kelamin Responden'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListGrafikBerdasarkanJenisKelamin search={search} />
    </Box>
  );
}

function ListGrafikBerdasarkanJenisKelamin({ search }: { search: string }) {
  const stategrafikBerdasarkanJenisKelamin = useProxy(grafikBerdasarkanJenisKelamin)
  const [donutData, setDonutData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter();
  const { data, page, totalPages, loading, load } = stategrafikBerdasarkanJenisKelamin.findMany


  useShallowEffect(() => {
    setMounted(true);
    load(page, 10)
  }, [page]);

  useEffect(() => {
    if (data) {
      const totalLaki = data.reduce((acc: number, cur: any) => acc + Number(cur.laki || 0), 0);
      const totalPerempuan = data.reduce((acc: number, cur: any) => acc + Number(cur.perempuan || 0), 0);
      setDonutData([
        { name: 'laki', value: totalLaki, color: colors['blue-button'], key: 'laki' },
        { name: 'perempuan', value: totalPerempuan, color: '#10A85AFF', key: 'perempuan' }
      ]);
    }
  }, [data])

  const filteredData = (data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.laki.toString().toLowerCase().includes(keyword) ||
      item.perempuan.toString().toLowerCase().includes(keyword)
    );
  });

  const handleDelete = async () => {
    if (selectedId) {
      await grafikBerdasarkanJenisKelamin.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)

      stategrafikBerdasarkanJenisKelamin.findMany.load()
    }
  }

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={730} />
      </Stack>
    );
  }
  if (data.length === 0) {
    return (
      <Box py={10}>
        <Paper p="md">
          <Stack>
            <JudulList
              title='List Data Berdasarkan Jenis Kelamin Responden'
              href='/admin/ppid/ikm-desa-darmasaba/grafik_berdasarkan_jenis_kelamin_responden/create'
            />
            <Table striped withTableBorder withRowBorders>
              <TableThead>
                <TableTr>
                  <TableTh>No</TableTh>
                  <TableTh>Laki-laki</TableTh>
                  <TableTh>Perempuan</TableTh>
                  <TableTh>Edit</TableTh>
                  <TableTh>Delete</TableTh>
                </TableTr>
              </TableThead>
            </Table>
            <Text ta="center">Tidak ada data berdasarkan jenis kelamin responden yang tersedia</Text>
          </Stack>
        </Paper>
      </Box >
    );
  }

  return (
    <Box>
      <Stack gap={"xs"}>
        <Paper bg={colors['white-1']} p={"md"} h={{ base: 730, md: 650 }}>
          <JudulList
            title='List Data Berdasarkan Jenis Kelamin Responden'
            href='/admin/ppid/ikm-desa-darmasaba/grafik_berdasarkan_jenis_kelamin_responden/create'
          />
          <Table striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '5%', textAlign: 'center' }}>No</TableTh>
                <TableTh style={{ width: '20%', textAlign: 'center' }}>Laki-laki</TableTh>
                <TableTh style={{ width: '20%', textAlign: 'center' }}>Perempuan</TableTh>
                <TableTh style={{ width: '15%', textAlign: 'center' }}>Edit</TableTh>
                <TableTh style={{ width: '15%', textAlign: 'center' }}>Delete</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length === 0 ? (
                <TableTr>
                  <TableTd colSpan={6}>
                    <Text ta='center' c='dimmed'>Belum ada data grafik responden</Text>
                  </TableTd>
                </TableTr>
              ) : (
                filteredData.map((item, index) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ width: '5%', textAlign: 'center' }}>{index + 1}</TableTd>
                    <TableTd style={{ width: '20%', textAlign: 'center' }}>{item.laki}</TableTd>
                    <TableTd style={{ width: '20%', textAlign: 'center' }}>{item.perempuan}</TableTd>
                    <TableTd style={{ width: '15%', textAlign: 'center' }}>
                      <Button color='green' onClick={() => router.push(`/admin/ppid/ikm-desa-darmasaba/grafik_berdasarkan_jenis_kelamin_responden/${item.id}`)}>
                        <IconEdit size={20} />
                      </Button>
                    </TableTd>
                    <TableTd style={{ width: '15%', textAlign: 'center' }}>
                      <Button
                        color='red'
                        disabled={stategrafikBerdasarkanJenisKelamin.delete.loading}
                        onClick={() => {
                          setSelectedId(item.id)
                          setModalHapus(true)
                        }}>
                        <IconTrash size={20} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              )}
            </TableTbody>
          </Table>
        </Paper>
        <Center>
          <Pagination
            value={page}
            onChange={(newPage) => {
              load(newPage, 10);
              window.scrollTo(0, 0);
            }}
            total={totalPages}
            mt="md"
            mb="md"
          />
        </Center>

        {/* Chart */}
        <Box>
          <Paper bg={colors['white-1']} p={'md'}>
            <Stack>
              <Title pb={10} order={3}>Grafik Berdasarkan Jenis Kelamin Responden</Title>
              {mounted && donutData.length === 0 ? (<Text c='dimmed'>Belum ada data untuk ditampilkan dalam grafik</Text>) : (<Box style={{ width: '100%', height: 'auto', minHeight: 200 }}>
                <PieChart
                  width={800} height={300}
                  data={donutData}
                >
                  <Pie
                    dataKey="value"
                    nameKey="name"
                    data={donutData}
                    cx={500}
                    cy={150}
                    innerRadius={60}
                    outerRadius={115}
                    label={true}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
                <Flex gap={"md"} align={"center"}>
                  <Box bg={colors['blue-button']} w={20} h={20} />
                  <Text>Laki-laki: {donutData.find((entry) => entry.name === 'laki')?.value}</Text>
                </Flex>
                <Flex gap={"md"} align={"center"}>
                  <Box bg={'#10A85AFF'} w={20} h={20} />
                  <Text>Perempuan: {donutData.find((entry) => entry.name === 'perempuan')?.value}</Text>
                </Flex>
              </Box>
              )}
            </Stack>
          </Paper>
        </Box>
      </Stack>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text='Apakah anda yakin ingin menghapus grafik berdasarkan hasil responden ini?'
      />
    </Box>
  );
}

export default GrafikBerdasarkanJenisKelamin;
