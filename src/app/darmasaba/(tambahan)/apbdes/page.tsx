/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import PendapatanAsliDesa from '@/app/admin/(dashboard)/_state/ekonomi/PADesa'
import apbdes from '@/app/admin/(dashboard)/_state/landing-page/apbdes'
import colors from '@/con/colors'
import { ActionIcon, BackgroundImage, Box, Center, Container, Group, Loader, Paper, Progress, SimpleGrid, Stack, Table, Text, Title } from '@mantine/core'
import { IconDownload } from '@tabler/icons-react'
import { Link } from 'next-view-transitions'
import { useEffect, useState } from 'react'
import { useProxy } from 'valtio/utils'
import BackButton from '../../(pages)/desa/layanan/_com/BackButto'

function Page() {
  const state = useProxy(apbdes)
  const paDesaState = useProxy(PendapatanAsliDesa.ApbDesa)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        await state.findMany.load()
        await paDesaState.findMany.load()
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const dataAPBDes = state.findMany.data || []

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap={32}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Container w={{ base: '100%', md: '60%' }}>
        <Stack align="center" gap="sm">
          <Title order={1} fz={{ base: '2.4rem', md: '3.2rem' }} fw="bold" ta="center">
            Anggaran Pendapatan & Belanja Desa (APBDes)
          </Title>
          <Text fz="md" c="dimmed" ta="center">
            Laporan transparansi APBDes Desa Darmasaba sebagai bentuk keterbukaan dan akuntabilitas pengelolaan anggaran desa.
          </Text>
        </Stack>
      </Container>
      {loading ? (
        <Center mih={200}>
          <Stack align="center" gap="sm">
            <Loader size="lg" color="blue" />
            <Text fz="lg" c="dimmed">Sedang memuat data APBDes...</Text>
          </Stack>
        </Center>
      ) : dataAPBDes.length === 0 ? (
        <Center mih={200}>
          <Stack align="center" gap="xs">
            <Text fz="xl" fw={600} c="dimmed">Belum ada data APBDes tersedia</Text>
            <Text fz="sm" c="dimmed">Data akan ditampilkan jika sudah diunggah oleh admin desa</Text>
          </Stack>
        </Center>
      ) : (
        <SimpleGrid px={{ base: 'md', md: 100 }} cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
          {dataAPBDes.map((v: any, k: number) => (
            <BackgroundImage key={k} src={v.image?.link || ''} h={360} radius="xl" pos="relative">
              <Box pos="absolute" inset={0} bg="rgba(0,0,0,0.45)" style={{ borderRadius: 27 }} />
              <Stack justify="space-between" h="100%" p="lg" pos="relative">
                <Box>
                  <Text fz="lg" fw={600} c="white" ta="center">
                    {v.name}
                  </Text>
                </Box>
                <Text fz="2.6rem" fw="bold" c="white" ta="center">
                  {v.jumlah}
                </Text>
                <Group justify="center">
                  <ActionIcon
                    component={Link}
                    href={v.file?.link || '#'}
                    radius="xl"
                    size="lg"
                    bg={colors['blue-button']}
                    variant="filled"
                  >
                    <IconDownload size={20} color="white" />
                  </ActionIcon>
                </Group>
              </Stack>
            </BackgroundImage>
          ))}
        </SimpleGrid>
      )}
      <DetailAPBDesaTable />
      <APBDesaProgress />
    </Stack>
  )
}

function DetailAPBDesaTable() {
  // 🔹 Dummy data
  const data = {
    tahun: 2024,
    pendapatan: [
      { id: 1, nama: 'Pendapatan Asli Desa', anggaran: 32000000, realisasi: 6500000 },
      { id: 2, nama: 'Dana Desa', anggaran: 125000000, realisasi: 120000000 },
      { id: 3, nama: 'Bagi Hasil Pajak dan Retribusi', anggaran: 10000000, realisasi: 9000000 },
    ],
    belanja: [
      { id: 1, nama: 'Belanja Pegawai', anggaran: 80000000, realisasi: 75000000 },
      { id: 2, nama: 'Belanja Barang & Jasa', anggaran: 50000000, realisasi: 42000000 },
    ],
    pembiayaan: [
      { id: 1, nama: 'Penerimaan Pembiayaan', anggaran: 15000000, realisasi: 15000000 },
      { id: 2, nama: 'Pengeluaran Pembiayaan', anggaran: 10000000, realisasi: 8000000 },
    ],
  };

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 2,
      style: 'decimal',
    }).format(value);

  // 🔹 Helper buat render satu kategori (Pendapatan, Belanja, Pembiayaan)
  const renderSection = (title: string, items: any[]) => {
    const totalAnggaran = items.reduce((sum, i) => sum + Number(i.anggaran || 0), 0);
    const totalRealisasi = items.reduce((sum, i) => sum + Number(i.realisasi || 0), 0);
    const totalSelisih = totalAnggaran - totalRealisasi;
    const totalPersen = totalAnggaran
      ? (totalRealisasi / totalAnggaran) * 100
      : 0;

    return (
      <Paper withBorder radius="md" shadow="xs" p="md">
        <Title order={5} mb="sm" c={colors['blue-button']}>
          {title.toUpperCase()}
        </Title>
        <Table withColumnBorders highlightOnHover>
          <Table.Thead bg={colors['blue-button']}>
            <Table.Tr>
              <Table.Th c="white">Uraian</Table.Th>
              <Table.Th c="white" ta="right">
                Anggaran (Rp)
              </Table.Th>
              <Table.Th c="white" ta="right">
                Realisasi (Rp)
              </Table.Th>
              <Table.Th c="white" ta="right">
                Lebih/(Kurang) (Rp)
              </Table.Th>
              <Table.Th c="white" ta="center">
                Persentase (%)
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.map((item, index) => {
              const selisih = Number(item.anggaran) - Number(item.realisasi);
              const persen = item.anggaran
                ? (item.realisasi / item.anggaran) * 100
                : 0;
              return (
                <Table.Tr key={item.id || index}>
                  <Table.Td>
                    <strong>{`${index + 1}. ${item.nama}`}</strong>
                  </Table.Td>
                  <Table.Td ta="right">{formatRupiah(item.anggaran)}</Table.Td>
                  <Table.Td ta="right">{formatRupiah(item.realisasi)}</Table.Td>
                  <Table.Td ta="right">{formatRupiah(selisih)}</Table.Td>
                  <Table.Td ta="center">{persen.toFixed(2)}</Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
          <Table.Tfoot bg="#f1f5fb">
            <Table.Tr>
              <Table.Th>Total {title}</Table.Th>
              <Table.Th ta="right">{formatRupiah(totalAnggaran)}</Table.Th>
              <Table.Th ta="right">{formatRupiah(totalRealisasi)}</Table.Th>
              <Table.Th ta="right">{formatRupiah(totalSelisih)}</Table.Th>
              <Table.Th ta="center">{totalPersen.toFixed(2)}</Table.Th>
            </Table.Tr>
          </Table.Tfoot>
        </Table>
      </Paper>
    );
  };

  return (
    <Box py="md" px={{ base: 'md', md: 100 }}>
      <Stack gap="xl">
        <Title order={4} c={colors['blue-button']}>
          APB Desa Tahun {data.tahun}
        </Title>

        {renderSection('Pendapatan', data.pendapatan)}
        {renderSection('Belanja', data.belanja)}
        {renderSection('Pembiayaan', data.pembiayaan)}
      </Stack>
    </Box>
  );
}

function APBDesaProgress() {
  const data = {
    tahun: 2024,
    pendapatan: [
      { id: 1, nama: 'Pendapatan Asli Desa', anggaran: 32000000, realisasi: 6500000 },
      { id: 2, nama: 'Dana Desa', anggaran: 125000000, realisasi: 120000000 },
      { id: 3, nama: 'Bagi Hasil Pajak dan Retribusi', anggaran: 10000000, realisasi: 9000000 },
    ],
    belanja: [
      { id: 1, nama: 'Belanja Pegawai', anggaran: 80000000, realisasi: 75000000 },
      { id: 2, nama: 'Belanja Barang & Jasa', anggaran: 50000000, realisasi: 42000000 },
    ],
    pembiayaan: [
      { id: 1, nama: 'Penerimaan Pembiayaan', anggaran: 15000000, realisasi: 15000000 },
      { id: 2, nama: 'Pengeluaran Pembiayaan', anggaran: 10000000, realisasi: 8000000 },
    ],
  };

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
    }).format(value);

  const calcProgress = (items: any[]) => {
    const anggaran = items.reduce((sum, i) => sum + i.anggaran, 0);
    const realisasi = items.reduce((sum, i) => sum + i.realisasi, 0);
    const persen = anggaran ? (realisasi / anggaran) * 100 : 0;
    return { anggaran, realisasi, persen };
  };

  const pendapatan = calcProgress(data.pendapatan);
  const belanja = calcProgress(data.belanja);
  const pembiayaan = calcProgress(data.pembiayaan);

  const renderProgress = (label: string, dataset: any) => (
    <Box>
      <Text fw={600}>{label}</Text>
      <Text fw={700} mb="xs">
        {formatRupiah(dataset.realisasi)} | {formatRupiah(dataset.anggaran)}
      </Text>
      <Progress
        value={dataset.persen}
        size="xl"
        radius="xl"
        striped={false}
        styles={{
          root: { backgroundColor: '#d7e3f1' },
          section: { 
            backgroundColor: colors['blue-button'],
            position: 'relative',
            '&::after': {
              content: `'${dataset.persen.toFixed(2)}%'`,
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.8rem',
            }
          },
        }}
      />
    </Box>
  );

  return (
    <Paper mx={{ base: 'md', md: 100 }} p="xl" radius="md" shadow="sm" withBorder bg={colors['white-1']}>
      <Stack gap="lg">
        <Title order={4} c={colors['blue-button']}>
          Grafik APB Desa Tahun {data.tahun}
        </Title>

        {renderProgress('Pendapatan Desa', pendapatan)}
        {renderProgress('Belanja Desa', belanja)}
        {renderProgress('Pembiayaan Desa', pembiayaan)}
      </Stack>
    </Paper>
  );
}



export default Page
