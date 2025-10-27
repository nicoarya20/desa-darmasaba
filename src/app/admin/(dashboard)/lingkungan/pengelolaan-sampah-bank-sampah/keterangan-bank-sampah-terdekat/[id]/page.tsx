/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import pengelolaanSampahState from '@/app/admin/(dashboard)/_state/lingkungan/pengelolaan-sampah';
import colors from '@/con/colors';
import { Anchor, Box, Button, Flex, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('@/app/admin/(dashboard)/_com/leafletMapCreate'), {
  ssr: false
});

function DetailKeteranganBankSampahTerdekat() {
  const router = useRouter();
  const keteranganState = useProxy(pengelolaanSampahState.keteranganSampah);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalHapus, setModalHapus] = useState(false);
  const params = useParams();

  useEffect(() => {
    keteranganState.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      keteranganState.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/lingkungan/pengelolaan-sampah-bank-sampah/keterangan-bank-sampah-terdekat");
    }
  };

  if (!keteranganState.findUnique.data) {
    return (
      <Stack p="md">
        <Skeleton h={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Box>
      <Box mb="md">
        <Button
          variant="light"
          leftSection={<IconArrowLeft size={20} />}
          onClick={() => router.back()}
          radius="xl"
          color="blue"
        >
          Kembali
        </Button>
      </Box>

      <Paper
        w={{ base: "100%", md: "60%" }}
        p="xl"
        radius="lg"
        withBorder
        shadow="md"
        style={{ background: colors['white-1'] }}
      >
        <Stack gap="lg">
          <Title order={2} c="dark">
            Detail Bank Sampah Terdekat
          </Title>

          <Paper p="lg" radius="md" withBorder >
            <Stack gap="md">
              <Box>
                <Text fz="sm" c="dimmed">Nama Bank Sampah</Text>
                <Text fz="lg" fw={600}>{keteranganState.findUnique.data?.name}</Text>
              </Box>

              <Box>
                <Text fz="sm" c="dimmed">Alamat</Text>
                <Text fz="lg" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{keteranganState.findUnique.data?.alamat}</Text>
              </Box>

              <Box>
                <Text fz="sm" c="dimmed">Nama Tempat di Maps</Text>
                <Text fz="lg" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{keteranganState.findUnique.data?.namaTempatMaps}</Text>
              </Box>

              <Box>
                <Text fz="sm" c="dimmed" mb={6}>Peta Lokasi</Text>
                {keteranganState.findUnique.data?.lat && keteranganState.findUnique.data?.lng ? (
                  <Box style={{ height: "300px", borderRadius: "12px", overflow: "hidden" }}>
                    <LeafletMap
                      defaultCenter={{ lat: keteranganState.findUnique.data.lat, lng: keteranganState.findUnique.data.lng }}
                      readOnly
                    />
                  </Box>
                ) : (
                  <Text c="dimmed" fz="sm">Belum ada koordinat</Text>
                )}
              </Box>

              <Box>
                <Text fz="sm" c="dimmed" mb={6}>Petunjuk Arah</Text>
                {keteranganState.findUnique.data?.lat && keteranganState.findUnique.data?.lng ? (
                  <Anchor
                    href={`https://www.google.com/maps/dir/?api=1&destination=${keteranganState.findUnique.data.lat},${keteranganState.findUnique.data.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="always"
                    c="blue"
                  >
                    Buka di Google Maps
                  </Anchor>
                ) : (
                  <Text c="dimmed" fz="sm">Belum ada koordinat</Text>
                )}
              </Box>

              <Flex gap="sm" mt="md">
                <Button
                  onClick={() => {
                    if (keteranganState.findUnique.data) {
                      setSelectedId(keteranganState.findUnique.data.id);
                      setModalHapus(true);
                    }
                  }}
                  disabled={!keteranganState.findUnique.data}
                  leftSection={<IconTrash size={18} />}
                  color="red"
                  radius="md"
                  variant='light'
                >
                  Hapus
                </Button>
                <Button
                  onClick={() =>
                    router.push(`/admin/lingkungan/pengelolaan-sampah-bank-sampah/keterangan-bank-sampah-terdekat/${keteranganState.findUnique.data?.id}/edit`)
                  }
                  leftSection={<IconEdit size={18} />}
                  color="green"
                  radius="md"
                  variant='light'
                >
                  Edit
                </Button>
              </Flex>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah Anda yakin ingin menghapus data bank sampah ini?"
      />
    </Box>
  );
}

export default DetailKeteranganBankSampahTerdekat;
