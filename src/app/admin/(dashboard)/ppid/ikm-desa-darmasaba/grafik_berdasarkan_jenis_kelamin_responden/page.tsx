/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import grafikBerdasarkanJenisKelamin from '@/app/admin/(dashboard)/_state/ppid/indeks_kepuasan_masyarakat/grafikBerdasarkanJenisKelamin';
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { useProxy } from 'valtio/utils';
import JudulListTab from '../../../_com/jusulListTab';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function GrafikBerdasarkanJenisKelamin() {
  const stategrafikBerdasarkanJenisKelamin = useProxy(grafikBerdasarkanJenisKelamin)
  const [donutData, setDonutData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter();

  const handleDelete = async () => {
    if (selectedId) {
      await grafikBerdasarkanJenisKelamin.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)

      stategrafikBerdasarkanJenisKelamin.findMany.load()
    }
  }

  useShallowEffect(() => {
    setMounted(true);
    stategrafikBerdasarkanJenisKelamin.findMany.load()
  }, []);

  useEffect(() => {
    if (stategrafikBerdasarkanJenisKelamin.findMany.data) {
      const totalLaki = stategrafikBerdasarkanJenisKelamin.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.laki || 0), 0);
      const totalPerempuan = stategrafikBerdasarkanJenisKelamin.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.perempuan || 0), 0);
      setDonutData([
        { name: 'laki', value: totalLaki, color: colors['blue-button'], key: 'laki' },
        { name: 'perempuan', value: totalPerempuan, color: '#10A85AFF', key: 'perempuan' }
      ]);
    }
  }, [stategrafikBerdasarkanJenisKelamin.findMany.data])

  if (!stategrafikBerdasarkanJenisKelamin.findMany.data) {
    return (
      <Box>
        <Skeleton h={500} />
      </Box>
    )
  }

  return (
    <Box>
      <Stack gap={"xs"}>
        <Paper bg={colors['white-1']} p={"md"}>
          <JudulListTab
            title='List Grafik Berdasarkan Jenis Kelamin Responden'
            href='/admin/ppid/ikm-desa-darmasaba/grafik_berdasarkan_jenis_kelamin_responden/create'
            placeholder='pencarian'
            searchIcon={<IconSearch size={16} />}
          />
          <Table striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh>Laki-laki</TableTh>
                <TableTh>Perempuan</TableTh>
                <TableTh>Edit</TableTh>
                <TableTh>Delete</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {stategrafikBerdasarkanJenisKelamin.findMany.data.length === 0 ? (
                <TableTr>
                  <TableTd colSpan={6}>
                    <Text ta='center' c='dimmed'>Belum ada data grafik responden</Text>
                  </TableTd>
                </TableTr>
              ) : (
                stategrafikBerdasarkanJenisKelamin.findMany.data.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>{item.laki}</TableTd>
                    <TableTd>{item.perempuan}</TableTd>
                    <TableTd>
                      <Button color='green' onClick={() => router.push(`/admin/ppid/ikm-desa-darmasaba/grafik_berdasarkan_jenis_kelamin_responden/${item.id}`)}>
                        <IconEdit size={20} />
                      </Button>
                    </TableTd>
                    <TableTd>
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

        {/* Chart */}
        <Box>
          <Paper bg={colors['white-1']} p={'md'}>
            <Stack>
              <Title pb={10} order={3}>Grafik Berdasarkan Responden</Title>
              {mounted && donutData.length > 0 ? (<Box style={{ width: '100%', height: 'auto', minHeight: 200 }}>
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
              ) : (
                <Text c='dimmed'>Belum ada data untuk ditampilkan dalam grafik</Text>
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
