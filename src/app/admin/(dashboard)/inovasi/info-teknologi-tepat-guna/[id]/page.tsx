'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import infoTeknoState from '../../../_state/inovasi/info-tekno';

function DetailInfoTeknologiTepatGuna() {
  const stateInfoTekno = useProxy(infoTeknoState)
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter()
  const params = useParams()

  useShallowEffect(() => {
    stateInfoTekno.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = async () => {
    if (!selectedId) return
    // await delete dulu — tanpa ini, router.push berlari mendahului DELETE
    // yang belum commit, list mount & fetch data lama → item terhapus masih tampil.
    const ok = await stateInfoTekno.delete.byId(selectedId)
    setModalHapus(false)
    setSelectedId(null)
    if (ok) router.push("/admin/inovasi/info-teknologi-tepat-guna")
  }

  if (!stateInfoTekno.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    )
  }

  const data = stateInfoTekno.findUnique.data

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Tombol Kembali */}
      <Button
        variant="subtle"
        onClick={() => router.back()}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        Kembali
      </Button>

      {/* Card Utama */}
      <Paper
        withBorder
        w={{ base: "100%", md: "70%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Info Teknologi Tepat Guna
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Judul</Text>
                <Text fz="md" c="dimmed">{data?.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi</Text>
                <Text
                  fz="md"
                  c="dimmed"
                  dangerouslySetInnerHTML={{ __html: data?.deskripsi || '-' }}
                  style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Gambar</Text>
                {data?.image?.link ? (
                  <Image
                    src={data.image.link}
                    alt={data.name || 'Gambar Teknologi'}
                    w={150}
                    h={150}
                    radius="md"
                    fit="cover"
                    loading="lazy"
                  />
                ) : (
                  <Text fz="sm" c="dimmed">Tidak ada gambar</Text>
                )}
              </Box>

              {/* Action Buttons */}
              <Group gap="sm" mt={10}>
                <Button
                  color="red"
                  onClick={() => {
                    setSelectedId(data.id);
                    setModalHapus(true);
                  }}
                  variant="light"
                  radius="md"
                  size="md"
                  disabled={stateInfoTekno.delete.loading}
                >
                  <IconTrash size={20} />
                </Button>

                <Button
                  color="green"
                  onClick={() =>
                    router.push(`/admin/inovasi/info-teknologi-tepat-guna/${data.id}/edit`)
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
        text='Apakah anda yakin ingin menghapus info teknologi tepat guna ini?'
      />
    </Box>
  );
}

export default DetailInfoTeknologiTepatGuna;
