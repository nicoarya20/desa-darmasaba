'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import jadwalKegiatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function DetailJadwalKegiatan() {
  const params = useParams()
  const router = useRouter();
  const stateJadwalKegiatan = useProxy(jadwalKegiatanState)
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useShallowEffect(() => {
    stateJadwalKegiatan.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      stateJadwalKegiatan.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/kesehatan/data-kesehatan-warga/jadwal_kegiatan")
    }
  }

  if (!stateJadwalKegiatan.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    )
  }

  const data = stateJadwalKegiatan.findUnique.data

  return (
    <Box py={10}>
      {/* Tombol Back */}
      <Button
        variant="subtle"
        onClick={() => router.back()}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        Kembali
      </Button>

      {/* Wrapper Detail */}
      <Paper
        withBorder
        w={{ base: "100%", md: "50%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Jadwal Kegiatan
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              {/* Nama Kegiatan */}
              <Box>
                <Text fz="lg" fw="bold">Nama Kegiatan</Text>
                <Text fz="md" c="dimmed">{data.content || '-'}</Text>
              </Box>

              {/* Informasi */}
              <Box>
                <Text fz="lg" fw="bold">Informasi</Text>
                <Text fz="md" fw="bold">Nama</Text>
                <Text fz="md" c="dimmed">{data.informasijadwalkegiatan.name || '-'}</Text>
                <Text fz="md" fw="bold">Tanggal</Text>
                <Text fz="md" c="dimmed">{data.informasijadwalkegiatan.tanggal || '-'}</Text>
                <Text fz="md" fw="bold">Waktu</Text>
                <Text fz="md" c="dimmed">{data.informasijadwalkegiatan.waktu || '-'}</Text>
                <Text fz="md" fw="bold">Lokasi</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{data.informasijadwalkegiatan.lokasi || '-'}</Text>
              </Box>

              {/* Deskripsi */}
              <Box>
                <Text fz="lg" fw="bold">Deskripsi</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.deskripsijadwalkegiatan.deskripsi }} />
              </Box>

              {/* Layanan */}
              <Box>
                <Text fz="lg" fw="bold">Layanan</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.layananjadwalkegiatan.content }} />
              </Box>

              {/* Syarat Ketentuan */}
              <Box>
                <Text fz="lg" fw="bold">Syarat Ketentuan</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.syaratketentuanjadwalkegiatan.content }} />
              </Box>

              {/* Dokumen */}
              <Box>
                <Text fz="lg" fw="bold">Dokumen</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.dokumenjadwalkegiatan.content }} />
              </Box>

              {/* Aksi */}
              <Group gap="sm">
                <Button
                  color="red"
                  onClick={() => {
                    setSelectedId(data.id)
                    setModalHapus(true)
                  }}
                  variant="light"
                  radius="md"
                  size="md"
                >
                  <IconTrash size={20} />
                </Button>

                <Button
                  color="green"
                  onClick={() =>
                    router.push(`/admin/kesehatan/data-kesehatan-warga/jadwal_kegiatan/${data.id}/edit`)
                  }
                  variant="light"
                  radius="md"
                  size="md"
                >
                  <IconEdit size={20} />
                </Button>
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
        text="Apakah anda yakin ingin menghapus jadwal kegiatan ini?"
      />
    </Box>
  );
}

export default DetailJadwalKegiatan;
