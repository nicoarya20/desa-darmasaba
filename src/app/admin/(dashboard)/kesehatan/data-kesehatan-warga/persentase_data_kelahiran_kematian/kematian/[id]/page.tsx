'use client'
import { Box, Button, Group, Paper, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';


import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import persentaseKelahiranKematian from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
import colors from '@/con/colors';


function DetailKematian() {
  const state = useProxy(persentaseKelahiranKematian.kematian);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();


  useShallowEffect(() => {
    state.findUnique.load(params?.id as string);
  }, []);


  const handleHapus = () => {
    if (selectedId) {
      state.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kelahiran");
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
        w={{ base: "100%", md: "50%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Data Kematian
          </Text>


          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Nama</Text>
                <Text fz="md" c="dimmed">{data?.nama || '-'}</Text>
              </Box>


              <Box>
                <Text fz="lg" fw="bold">Tanggal</Text>
                <Text fz="md" c="dimmed">
                  {new Date(data.tanggal).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </Box>


              <Box>
                <Text fz="lg" fw="bold">Jenis Kelamin</Text>
                <Text fz="md" c="dimmed">{data?.jenisKelamin || '-'}</Text>
              </Box>


              <Box>
                <Text fz="lg" fw="bold">Alamat</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{data?.alamat || '-'}</Text>
              </Box>


              <Box>
                <Text fz="lg" fw="bold">Penyebab</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data?.penyebab || '-' }} />
              </Box>


              <Group gap="sm">
                <Tooltip label="Hapus Data" withArrow position="top">
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
                </Tooltip>


                <Tooltip label="Edit Data" withArrow position="top">
                  <Button
                    color="green"
                    onClick={() => router.push(
                      `/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kematian/${data.id}/edit`
                    )}
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


      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah Anda yakin ingin menghapus data ini?"
      />
    </Box>
  );
}


export default DetailKematian;