'use client'
import { Box, Button, Group, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

import colors from '@/con/colors';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import sdgsDesa from '../../../_state/landing-page/sdgs-desa';

function DetailSDGSDesa() {
  const sdgsState = useProxy(sdgsDesa);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    sdgsState.findUnique.load(params?.id as string)
  }, [])


  const handleHapus = () => {
    if (selectedId) {
      sdgsState.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/landing-page/SDGs")
    }
  }

  if (!sdgsState.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = sdgsState.findUnique.data;

  return (
     <Box px={{ base: 0, md: 'xs' }} py="xs">
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
            Detail Sdgs Desa
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="md">
              <Box>
                <Text fz="lg" fw="bold" mb={4}>Nama Sdgs Desa</Text>
                <Text fz="md" c="dimmed">{data.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold" mb={4}>Jumlah</Text>
                <Text fz="md" c="dimmed">{data.jumlah || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold" mb={4}>Gambar</Text>
                {data.image?.link ? (
                  <Image
                    src={data.image.link}
                    alt={data.name || 'Gambar Sdgs Desa'}
                    w={200}
                    h={200}
                    radius="md"
                    fit="contain"
                    loading="lazy"
                  />
                ) : (
                  <Text fz="sm" c="dimmed">Tidak ada gambar</Text>
                )}
              </Box>

              <Group gap="sm" mt="md">
                  <Button
                    color="red"
                    onClick={() => {
                      setSelectedId(data.id);
                      setModalHapus(true);
                    }}
                    variant="light"
                    radius="md"
                    size="md"
                    disabled={sdgsState.delete.loading}
                  >
                    <IconTrash size={20} />
                  </Button>

                  <Button
                    color="green"
                    onClick={() => router.push(`/admin/landing-page/SDGs/${data.id}/edit`)}
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

      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah Anda yakin ingin menghapus Sdgs Desa ini?"
      />
    </Box>
  );
}

export default DetailSDGSDesa;