'use client'
import BankSampahDetailContent from '@/app/(public)/(pages)/lingkungan/pengelolaan-sampah-bank-sampah/_com/bank-sampah.detail-content';
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import keteranganSampah from '@/app/admin/(dashboard)/_state/lingkungan/bank-sampah/bank-sampah.state';
import colors from '@/con/colors';
import { Alert, Box, Button, Flex, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft, IconEdit, IconTrash } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';

const LeafletMap = dynamic(() => import('@/app/admin/(dashboard)/_com/leafletMapCreate'), {
  ssr: false
});

const DAFTAR = '/admin/lingkungan/pengelolaan-sampah-bank-sampah/keterangan-bank-sampah-terdekat';

/** Halaman admin detail bank sampah: data inti, peta, dan pratinjau tab publik (Profil/Struktur/Dokumentasi). */
function DetailKeteranganBankSampahTerdekat() {
  const router = useRouter();
  const id = useParams()?.id as string;
  const detail = useSnapshot(keteranganSampah.findUnique);
  const hapus = useSnapshot(keteranganSampah.delete);
  const [modalHapus, setModalHapus] = useState(false);

  useEffect(() => {
    if (id) void keteranganSampah.findUnique.load(id);
  }, [id]);

  const handleHapus = async () => {
    await keteranganSampah.delete.byId(id);
    setModalHapus(false);
    router.push(DAFTAR);
  };

  const data = keteranganSampah.findUnique.data;
  if (detail.gagal) return <Alert color="red" m="md">Data bank sampah tidak ditemukan atau gagal dimuat.</Alert>;
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

      <Paper w={{ base: "100%", md: "70%" }} p="xl" radius="lg" withBorder shadow="md" style={{ background: colors['white-1'] }}>
        <Stack gap="lg">
          <Title order={2} c="dark">Detail Bank Sampah Terdekat</Title>

          <Paper p="lg" radius="md" withBorder>
            <Stack gap="md">
              <Box>
                <Text fz="sm" c="dimmed">Nama Bank Sampah</Text>
                <Text fz="lg" fw={600}>{data.name}</Text>
              </Box>
              <Box>
                <Text fz="sm" c="dimmed">Nama Tempat di Maps</Text>
                <Text fz="lg" style={{ wordBreak: "break-word" }}>{data.namaTempatMaps}</Text>
              </Box>
              <Box>
                <Text fz="sm" c="dimmed" mb={6}>Peta Lokasi</Text>
                {data.lat && data.lng ? (
                  <Box style={{ height: "300px", borderRadius: "12px", overflow: "hidden" }}>
                    <LeafletMap defaultCenter={{ lat: data.lat, lng: data.lng }} readOnly />
                  </Box>
                ) : (
                  <Text c="dimmed" fz="sm">Belum ada koordinat</Text>
                )}
              </Box>
            </Stack>
          </Paper>

          <Paper p="lg" radius="md" withBorder>
            <Text fz="sm" c="dimmed" mb="sm">Pratinjau detail di halaman publik</Text>
            <BankSampahDetailContent data={data} />
          </Paper>

          <Flex gap="sm">
            <Button onClick={() => setModalHapus(true)} leftSection={<IconTrash size={18} />} color="red" radius="md" variant="light">
              Hapus
            </Button>
            <Button onClick={() => router.push(`${DAFTAR}/${data.id}/edit`)} leftSection={<IconEdit size={18} />} color="green" radius="md" variant="light">
              Edit
            </Button>
          </Flex>
        </Stack>
      </Paper>

      <ModalKonfirmasiHapus
        opened={modalHapus}
        loading={hapus.loading}
        onClose={() => setModalHapus(false)}
        onConfirm={() => void handleHapus()}
        text="Apakah Anda yakin ingin menghapus data bank sampah ini? Pengurus dan dokumentasinya ikut terhapus."
      />
    </Box>
  );
}

export default DetailKeteranganBankSampahTerdekat;
