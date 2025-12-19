'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Image,
  Paper,
  Skeleton,
  Stack,
  Text
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function DetailSuratKeterangan() {
  const suratKeteranganState = useProxy(stateLayananDesa.suratKeterangan);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    suratKeteranganState.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      suratKeteranganState.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push('/admin/desa/layanan/pelayanan_surat_keterangan');
    }
  };

  if (!suratKeteranganState.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = suratKeteranganState.findUnique.data;

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      {/* Tombol Kembali */}
      <Button
        variant="subtle"
        onClick={() => router.back()}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        Kembali
      </Button>

      <Paper
        withBorder
        w={{ base: '100%', md: '70%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Surat Keterangan
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Stack gap={"xs"}>
                <Text fz="lg" fw="bold">
                  Nama
                </Text>
                <Text fz="md" c="dimmed">
                  {data?.name || '-'}
                </Text>
              </Stack>

              <Stack gap={"xs"}>
                <Text fz="lg" fw="bold">
                  Deskripsi
                </Text>
                <Box pl={10}>
                  <Text
                  fz="md"
                  c="dimmed"
                  dangerouslySetInnerHTML={{
                    __html: data?.deskripsi || '-',
                  }}
                  style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                />
                </Box>
              </Stack>

              <Stack gap={"xs"}>
                <Text fz="lg" fw="bold">
                Gambar Konten Pelayanan
                </Text>
                {data?.image?.link ? (
                  <Image
                    src={data.image.link}
                    alt="gambar"
                    w={200}
                    h={200}
                    radius="md"
                    fit="cover"
                    loading="lazy"
                  />
                ) : (
                  <Text fz="sm" c="dimmed">
                    Tidak ada gambar
                  </Text>
                )}
              </Stack>

              <Box>
                <Text fz="lg" fw="bold">
                Gambar Alur Pelayanan Surat
                </Text>
                {data?.image2?.link ? (
                  <Image
                    src={data.image2.link}
                    alt="gambar"
                    w={200}
                    h={200}
                    radius="md"
                    fit="cover"
                    loading="lazy"
                  />
                ) : (
                  <Text fz="sm" c="dimmed">
                    Tidak ada gambar
                  </Text>
                )}
              </Box>

              <Group gap="sm">
                  <Button
                    color="red"
                    onClick={() => {
                      setSelectedId(data.id);
                      setModalHapus(true);
                    }}
                    variant="light"
                    radius="md"
                    size="md"
                    disabled={suratKeteranganState.delete.loading}
                  >
                    <IconTrash size={20} />
                  </Button>

                  <Button
                    color="green"
                    onClick={() =>
                      router.push(
                        `/admin/desa/layanan/pelayanan_surat_keterangan/${data.id}/edit`
                      )
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

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah Anda yakin ingin menghapus surat keterangan ini?"
      />
    </Box>
  );
}

export default DetailSuratKeterangan;
