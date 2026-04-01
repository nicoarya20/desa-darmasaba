'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import puskesmasState from '../../../_state/kesehatan/puskesmas/puskesmas';

function DetailPuskesmas() {
  const params = useParams();
  const router = useRouter();
  const statePuskesmas = useProxy(puskesmasState);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useShallowEffect(() => {
    statePuskesmas.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      statePuskesmas.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/kesehatan/puskesmas");
    }
  };

  if (!statePuskesmas.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = statePuskesmas.findUnique.data;

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Tombol kembali */}
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
        w={{ base: "100%", md: "70%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Puskesmas
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Nama Puskesmas</Text>
                <Text fz="md" c="dimmed">{data?.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Alamat</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{data?.alamat || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Jam Operasional</Text>
                <Text fz="md" c="dimmed">Senin - Jumat</Text>
                <Text fz="md" c="dimmed">{data?.jam?.workDays || '-'} - {data?.jam?.weekDays || '-'}</Text>
                <Text fz="md" c="dimmed">Sabtu - Minggu / Hari Libur</Text>
                <Text fz="md" c="dimmed">{data?.jam?.holiday || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Gambar</Text>
                {data?.image?.link ? (
                  <Image src={data.image.link} alt="gambar" radius="md" loading="lazy"/>
                ) : (
                  <Text fz="md" c="dimmed">-</Text>
                )}
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Kontak</Text>
                <Text fz="md" c="dimmed">Kontak Puskesmas</Text>
                <Text fz="md" c="dimmed">{data?.kontak?.kontakPuskesmas || '-'}</Text>
                <Text fz="md" c="dimmed">Email</Text>
                <Text fz="md" c="dimmed">{data?.kontak?.email || '-'}</Text>
                <Text fz="md" c="dimmed">Facebook</Text>
                <Text fz="md" c="dimmed">{data?.kontak?.facebook || '-'}</Text>
                <Text fz="md" c="dimmed">Kontak UGD</Text>
                <Text fz="md" c="dimmed">{data?.kontak?.kontakUGD || '-'}</Text>
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
                  >
                    <IconTrash size={20} />
                  </Button>

                  <Button
                    color="green"
                    onClick={() =>
                      router.push(`/admin/kesehatan/puskesmas/${data.id}/edit`)
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
        text="Apakah anda yakin ingin menghapus data ini?"
      />
    </Box>
  );
}

export default DetailPuskesmas;
