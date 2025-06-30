'use client'
import persentasekelahiran from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useMediaQuery, useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { useProxy } from 'valtio/utils';
import JudulListTab from '../../../_com/jusulListTab';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function PersentaseDataKelahiranKematian() {
  type PDKMGrafik = {
    id: string;
    tahun: string;
    kematianKasar: number;
    kematianBayi: number;
    kelahiranKasar: number;
  }
  const statePersentase = useProxy(persentasekelahiran);
  const [chartData, setChartData] = useState<PDKMGrafik[]>([]);
  const [mounted, setMounted] = useState(false); // untuk memastikan DOM sudah ready
  const isTablet = useMediaQuery('(max-width: 1024px)')
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter();

  const handleDelete = () => {
    if (selectedId) {
      statePersentase.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)

      statePersentase.findMany.load()
    }
  }

  useShallowEffect(() => {
    setMounted(true)
    statePersentase.findMany.load()
  }, [])

  useEffect(() => {
    setMounted(true);
    if (statePersentase.findMany.data) {
      setChartData(statePersentase.findMany.data.map((item) => ({
        id: item.id,
        tahun: item.tahun,
        kematianKasar: Number(item.kematianKasar),
        kematianBayi: Number(item.kematianBayi),
        kelahiranKasar: Number(item.kelahiranKasar),
      })));
    }
  }, [statePersentase.findMany.data]);

  if (!statePersentase.findMany.data) {
    return (
      <Stack>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Box>
      <Stack gap={"xs"}>
        {/* Form Input */}
        <Paper bg={colors['white-1']} p={'md'}>
          <JudulListTab
            title='List Persentase Data Kelahiran & Kematian'
            href='/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/create'
            placeholder='pencarian'
            searchIcon={<IconSearch size={16} />}
          />
          <Table striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh>Tahun</TableTh>
                <TableTh>Kematian Kasar</TableTh>
                <TableTh>Kematian Bayi</TableTh>
                <TableTh>kelahiran Kasar</TableTh>
                <TableTh>Edit</TableTh>
                <TableTh>Delete</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {statePersentase.findMany.data?.map((item) => (
                <TableTr key={item.id}>
                  <TableTd>{item.tahun}</TableTd>
                  <TableTd>{item.kematianKasar}</TableTd>
                  <TableTd>{item.kematianBayi}</TableTd>
                  <TableTd>{item.kelahiranKasar}</TableTd>
                  <TableTd>
                    <Button color='green' onClick={() => router.push(`/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/${item.id}`)}>
                      <IconEdit size={20} />
                    </Button>
                  </TableTd>
                  <TableTd>
                    <Button
                      color='red'
                      disabled={statePersentase.delete.loading}
                      onClick={() => {
                        setSelectedId(item.id)
                        setModalHapus(true)
                      }}>
                      <IconTrash size={20} />
                    </Button>
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </Paper>


        {/* Chart */}
        {!mounted && !chartData ? (
          <Box style={{ width: '100%', minWidth: 300, height: 400, minHeight: 300 }}>
            <Paper bg={colors['white-1']} p={'md'}>
              <Title pb={10} order={3}>Data Kelahiran & Kematian</Title>
              <Text c='dimmed'>Belum ada data untuk ditampilkan dalam grafik</Text>
            </Paper>
          </Box>
        ) : (
          <Box style={{ width: '100%', minWidth: 300, height: 400, minHeight: 300 }}>
            <Paper bg={colors['white-1']} p={'md'}>
              <Title pb={10} order={4}>Data Kelahiran & Kematian</Title>
              {mounted && chartData.length > 0 && (
                <BarChart width={isMobile ? 450 : isTablet ? 500 : 550} height={350} data={chartData} >
                  <XAxis dataKey="tahun" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="kematianKasar" fill="#f03e3e" name="Kematian Kasar" />
                  <Bar dataKey="kematianBayi" fill="#ff922b" name="Kematian Bayi" />
                  <Bar dataKey="kelahiranKasar" fill="#4dabf7" name="Kelahiran Kasar" />
                </BarChart>
              )}
            </Paper>
          </Box>
        )}
      </Stack>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text='Apakah anda yakin ingin menghapus persentase data kelahiran & kematian ini?'
      />
    </Box>
  );
}

export default PersentaseDataKelahiranKematian;
