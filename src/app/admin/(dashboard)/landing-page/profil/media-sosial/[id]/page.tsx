/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import profileLandingPageState from '@/app/admin/(dashboard)/_state/landing-page/profile';
import colors from '@/con/colors';
import { Box, Button, Group, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { sosmedMap } from '../../_lib/sosmed';

function DetailMediaSosial() {
  const stateMediaSosial = useProxy(profileLandingPageState.mediaSosial);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  const getIconSource = (item: any) => {
    if (item.image?.link) return item.image.link;
    if (item.icon && sosmedMap[item.icon as keyof typeof sosmedMap]?.src) {
      return sosmedMap[item.icon as keyof typeof sosmedMap].src;
    }
    return null;
  };

  useShallowEffect(() => {
    stateMediaSosial.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      stateMediaSosial.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/landing-page/profil/media-sosial");
    }
  };

  if (!stateMediaSosial.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = stateMediaSosial.findUnique.data;

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
        w={{ base: "100%", md: "70%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Media Sosial
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Nama Media Sosial / Kontak</Text>
                <Text fz="md" c="dimmed">{data.name || '-'}</Text>
              </Box>

              <Box >
                <Text fz="lg" fw="bold">Link / Nomor Telepon</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-all", whiteSpace: "pre-wrap" }}>{data.iconUrl || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Gambar</Text>
                {(() => {
                  const src = getIconSource(data);

                  if (src) {
                    return (
                      <Image
                        loading="lazy"
                        src={src}
                        alt={data.name}
                        fit={data.image?.link ? "cover" : "contain"}
                      />
                    );
                  }

                  return <Box bg={colors['blue-button']} w="100%" h="100%" />;
                })()}
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
                  onClick={() => router.push(`/admin/landing-page/profil/media-sosial/${data.id}/edit`)}
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
        text="Apakah Anda yakin ingin menghapus media sosial ini?"
      />
    </Box>
  );
}

export default DetailMediaSosial;
