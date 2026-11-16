'use client'
import LembagaDetailContent from '@/app/(public)/(pages)/pendidikan/info-sekolah/_com/lembaga-detail/LembagaDetailContent';
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';
import colors from '@/con/colors';
import type { LembagaDetail } from '@/lib/lembaga-pendidikan/lembaga.types';
import { Alert, Box, Button, Flex, Paper, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft, IconEdit, IconExternalLink, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';

const DAFTAR = '/admin/pendidikan/info-sekolah/lembaga';
const PUBLIK = '/pendidikan/info-sekolah/lembaga';

function Data({ label, value }: { label: string; value: string | number }) {
  return (
    <Box>
      <Text fz="sm" c="dimmed">{label}</Text>
      <Text fz="lg" fw={600}>{value}</Text>
    </Box>
  );
}

/** Kartu data inti lembaga (nama, jenjang, jumlah siswa & pengajar aktif). */
function DataInti({ data }: { data: LembagaDetail }) {
  return (
    <Paper p="lg" radius="md" withBorder>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Data label="Nama Lembaga" value={data.nama} />
        <Data label="Jenjang Pendidikan" value={data.jenjangPendidikan?.nama ?? '-'} />
        <Data label="Jumlah Siswa" value={data._count.siswa} />
        <Data label="Jumlah Pengajar" value={data._count.pengajar} />
      </SimpleGrid>
    </Paper>
  );
}

/** Halaman admin detail lembaga: data inti, pratinjau halaman detail publik, hapus & edit. */
function DetailLembaga() {
  const router = useRouter();
  const id = useParams()?.id as string;
  const detail = useSnapshot(infoSekolahPaud.lembagaPendidikan.findUnique);
  const hapus = useSnapshot(infoSekolahPaud.lembagaPendidikan.delete);
  const [modalHapus, setModalHapus] = useState(false);

  useEffect(() => {
    if (id) void infoSekolahPaud.lembagaPendidikan.findUnique.load(id);
  }, [id]);

  const handleHapus = async () => {
    await infoSekolahPaud.lembagaPendidikan.delete.byId(id);
    setModalHapus(false);
    router.push(DAFTAR);
  };

  const data = infoSekolahPaud.lembagaPendidikan.findUnique.data;
  if (detail.gagal) return <Alert color="red" m="md">Data lembaga tidak ditemukan atau gagal dimuat.</Alert>;
  if (detail.loading || !data || data.id !== id) {
    return (
      <Stack p="md">
        <Skeleton h={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Box mb="md">
        <Button variant="light" leftSection={<IconArrowLeft size={20} />} onClick={() => router.back()} radius="xl" color="blue">
          Kembali
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '80%' }} p="xl" radius="lg" withBorder shadow="md" style={{ background: colors['white-1'] }}>
        <Stack gap="lg">
          <Title order={2} c="dark">Detail Lembaga</Title>
          <DataInti data={data} />

          <Paper p="lg" radius="md" withBorder>
            <Text fz="sm" c="dimmed" mb="sm">Pratinjau halaman detail sekolah publik</Text>
            <LembagaDetailContent data={data} />
          </Paper>

          <Flex gap="sm" wrap="wrap">
            <Button onClick={() => setModalHapus(true)} leftSection={<IconTrash size={18} />} color="red" radius="md" variant="light">
              Hapus
            </Button>
            <Button onClick={() => router.push(`${DAFTAR}/${data.id}/edit`)} leftSection={<IconEdit size={18} />} color="green" radius="md" variant="light">
              Edit
            </Button>
            <Button
              component="a"
              href={`${PUBLIK}/${encodeURIComponent(data.id)}`}
              target="_blank"
              rel="noopener noreferrer"
              leftSection={<IconExternalLink size={18} />}
              radius="md"
              variant="light"
            >
              Lihat di website
            </Button>
          </Flex>
        </Stack>
      </Paper>

      <ModalKonfirmasiHapus
        opened={modalHapus}
        loading={hapus.loading}
        onClose={() => setModalHapus(false)}
        onConfirm={() => void handleHapus()}
        text="Apakah anda yakin ingin menghapus lembaga ini?"
      />
    </Box>
  );
}

export default DetailLembaga;
