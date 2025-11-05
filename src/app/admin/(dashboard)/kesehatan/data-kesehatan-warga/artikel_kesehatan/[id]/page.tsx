'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import artikelKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
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

function DetailArtikelKesehatan() {
  const params = useParams();
  const router = useRouter();
  const state = useProxy(artikelKesehatanState);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useShallowEffect(() => {
    state.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      state.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push('/admin/kesehatan/data-kesehatan-warga/artikel_kesehatan');
    }
  };

  if (!state.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = state.findUnique.data;

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
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Artikel Kesehatan
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              {/* Judul */}
              <Box>
                <Text fz="lg" fw="bold">Judul</Text>
                <Text fz="md" c="dimmed">{data.title}</Text>
              </Box>
              {/* Gambar */}
              <Box>
                <Text fz="lg" fw="bold">Gambar</Text>
                {data.image?.link ? (
                  <Image
                    src={data.image.link}
                    alt={data.title || 'Gambar Berita'}
                    w={200}
                    h={200}
                    radius="md"
                    fit="cover"
                    loading="lazy"
                  />
                ) : (
                  <Text fz="sm" c="dimmed">Tidak ada gambar</Text>
                )}
              </Box>

              {/* Deskripsi */}
              <Box>
                <Text fz="lg" fw="bold">Deskripsi</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.content }} />
              </Box>

              {/* Pendahuluan */}
              <Box>
                <Text fz="lg" fw="bold">Pendahuluan</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.introduction?.content }} />
              </Box>

              {/* Gejala */}
              <Box>
                <Text fz="lg" fw="bold">Gejala</Text>
                <Text fz="md" fw="bold">Judul</Text>
                <Text fz="md" c="dimmed">{data.symptom?.title}</Text>
                <Text fz="md" fw="bold">Deskripsi</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.symptom?.content }} />
              </Box>

              {/* Pencegahan */}
              <Box>
                <Text fz="lg" fw="bold">Pencegahan</Text>
                <Text fz="md" fw="bold">Judul</Text>
                <Text fz="md" c="dimmed">{data.prevention?.title}</Text>
                <Text fz="md" fw="bold">Deskripsi</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.prevention?.content }} />
              </Box>

              {/* Pertolongan Pertama */}
              <Box>
                <Text fz="lg" fw="bold">Pertolongan Pertama</Text>
                <Text fz="md" fw="bold">Judul</Text>
                <Text fz="md" c="dimmed">{data.firstaid?.title}</Text>
                <Text fz="md" fw="bold">Deskripsi</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.firstaid?.content }} />
              </Box>

              {/* Mitos vs Fakta */}
              <Box>
                <Text fz="lg" fw="bold">Mitos dan Fakta</Text>
                <Text fz="md" fw="bold">Judul</Text>
                <Text fz="md" c="dimmed">{data.mythvsfact?.title}</Text>
                <Text fz="md" fw="bold">Mitos</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.mythvsfact?.mitos }} />
                <Text fz="md" fw="bold">Fakta</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.mythvsfact?.fakta }} />
              </Box>

              {/* Kapan ke Dokter */}
              <Box>
                <Text fz="lg" fw="bold">Kapan Harus ke Dokter</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.doctorsign?.content }} />
              </Box>

              {/* Aksi */}
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
                >
                  <IconTrash size={20} />
                </Button>

                <Button
                  color="green"
                  onClick={() =>
                    router.push(
                      `/admin/kesehatan/data-kesehatan-warga/artikel_kesehatan/${data.id}/edit`
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
        text="Apakah anda yakin ingin menghapus artikel kesehatan ini?"
      />
    </Box>
  );
}

export default DetailArtikelKesehatan;
