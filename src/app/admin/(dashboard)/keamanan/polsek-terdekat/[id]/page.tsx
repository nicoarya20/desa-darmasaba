'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import polsekTerdekat from '../../../_state/keamanan/polsek-terdekat';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function DetailPolsekTerdekat() {
  const router = useRouter();
  const polsekState = useProxy(polsekTerdekat);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalHapus, setModalHapus] = useState(false);
  const params = useParams();

  useShallowEffect(() => {
    polsekState.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      polsekState.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/keamanan/polsek-terdekat");
    }
  };

  if (!polsekState.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = polsekState.findUnique.data;

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
            Detail Polsek Terdekat
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              {/* Nama */}
              <Box>
                <Text fz="lg" fw="bold">Nama Polsek Terdekat</Text>
                <Text fz="md" c="dimmed">{data?.nama || "-"}</Text>
              </Box>

              {/* Jarak */}
              <Box>
                <Text fz="lg" fw="bold">Jarak Polsek ke Desa</Text>
                <Text fz="md" c="dimmed">{data?.jarakKeDesa || "-"}</Text>
              </Box>

              {/* Alamat */}
              <Box>
                <Text fz="lg" fw="bold">Alamat Polsek</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{data?.alamat || "-"}</Text>
              </Box>

              {/* Nomor */}
              <Box>
                <Text fz="lg" fw="bold">Nomor Polsek</Text>
                <Text fz="md" c="dimmed">{data?.nomorTelepon || "-"}</Text>
              </Box>

              {/* Jam Operasional */}
              <Box>
                <Text fz="lg" fw="bold">Jam Operasional</Text>
                <Text fz="md" c="dimmed">{data?.jamOperasional || "-"}</Text>
              </Box>

              {/* Google Maps */}
              <Box>
                <Text fz="lg" fw="bold">Google Maps</Text>
                {data?.embedMapUrl ? (
                  <Box style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                    <iframe
                      src={data.embedMapUrl}
                      width="100%"
                      height="100%"
                      style={{
                        border: 0,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                      }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </Box>
                ) : (
                  <Text c="dimmed" fz="sm">Tidak ada maps</Text>
                )}
              </Box>

              {/* Nama Tempat Maps */}
              <Box>
                <Text fz="lg" fw="bold">Nama Tempat Maps</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{data?.namaTempatMaps || "-"}</Text>
              </Box>

              {/* Alamat Maps */}
              <Box>
                <Text fz="lg" fw="bold">Alamat Maps</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{data?.alamatMaps || "-"}</Text>
              </Box>

              {/* Link Petunjuk Arah */}
              <Box>
                <Text fz="lg" fw="bold" >Link Petunjuk Arah</Text>
                <Text fz="md" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
                  <a
                    href={data?.linkPetunjukArah || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'black', textDecoration: 'underline' }}
                  >
                    {data?.linkPetunjukArah || "Tidak ada link"}
                  </a>
                </Text>
              </Box>

              {/* Layanan Polsek */}
              <Box>
                <Text fz="lg" fw="bold">Layanan Polsek</Text>
                <Text fz="md" c="dimmed">{data?.layananPolsek?.nama || "-"}</Text>
              </Box>

              {/* Aksi */}
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
                    onClick={() => router.push(`/admin/keamanan/polsek-terdekat/${data.id}/edit`)}
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
        text="Apakah anda yakin ingin menghapus polsek terdekat ini?"
      />
    </Box>
  );
}

export default DetailPolsekTerdekat;
