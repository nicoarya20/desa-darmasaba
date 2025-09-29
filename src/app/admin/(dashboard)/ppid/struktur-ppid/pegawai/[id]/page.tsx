'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import stateStrukturPPID from '@/app/admin/(dashboard)/_state/ppid/struktur_ppid/struktur_PPID';
import colors from '@/con/colors';
import { Box, Button, Group, Image, Paper, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function DetailPegawai() {
  const statePegawai = useProxy(stateStrukturPPID.pegawai);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    stateStrukturPPID.posisiOrganisasi.findMany.load();
    statePegawai.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      statePegawai.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/ppid/struktur-ppid/pegawai");
    }
  };

  if (!statePegawai.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = statePegawai.findUnique.data;

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Paper
        withBorder
        w={{ base: "100%", md: "60%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Pegawai PPID
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="md">
              <Box>
                <Text fz="lg" fw="bold">Nama Lengkap</Text>
                <Text fz="md" c="dimmed" style={{wordBreak: "break-word", whiteSpace: "normal"}}>
                  {data.namaLengkap || '-'} {data.gelarAkademik || ''}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Posisi</Text>
                <Text fz="md" c="dimmed">{data.posisi?.nama || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Email</Text>
                <Text fz="md" c="dimmed">{data.email || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Telepon</Text>
                <Text fz="md" c="dimmed">{data.telepon || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Alamat</Text>
                <Text fz="md" c="dimmed" style={{wordBreak: "break-word", whiteSpace: "normal"}}>{data.alamat || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Tanggal Masuk</Text>
                <Text fz="md" c="dimmed">
                  {data.tanggalMasuk ? new Date(data.tanggalMasuk).toLocaleDateString() : '-'}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Status</Text>
                <Text fz="md" c={data.isActive ? 'green' : 'red'}>
                  {data.isActive ? 'Aktif' : 'Tidak Aktif'}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Foto Profil</Text>
                {data.image?.link ? (
                  <Image
                    src={data.image.link}
                    alt={data.namaLengkap || 'Foto Profil'}
                    w={200}
                    h={200}
                    radius="md"
                    fit="cover"
                    mt="sm"
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                    }}
                    loading='lazy'
                  />
                ) : (
                  <Text fz="sm" c="dimmed" mt="sm">Tidak ada foto profil</Text>
                )}
              </Box>

              <Group gap="sm" mt="md">
                <Tooltip label="Hapus Pegawai" withArrow position="top">
                  <Button
                    color="red"
                    onClick={() => {
                      setSelectedId(data.id || null);
                      setModalHapus(true);
                    }}
                    variant="light"
                    radius="md"
                    size="md"
                  >
                    <IconTrash size={20} />
                  </Button>
                </Tooltip>

                <Tooltip label="Edit Pegawai" withArrow position="top">
                  <Button
                    color="green"
                    onClick={() => router.push(`/admin/ppid/struktur-ppid/pegawai/${data.id}/edit`)}
                    variant="light"
                    radius="md"
                    size="md"
                  >
                    <IconEdit size={20} />
                  </Button>
                </Tooltip>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      {/* Modal Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah Anda yakin ingin menghapus data pegawai ini?"
      />
    </Box>
  );
}

export default DetailPegawai;
